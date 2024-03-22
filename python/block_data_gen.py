# Grabs blocks from btc block data api
from textwrap import dedent
import asyncio
import math
import aiohttp
import hashlib
from typing import TypedDict
import os

class StaleBlockDetected(Exception):
    pass

class BitcoinApiFailure(Exception):
    pass

class BlockHeader(TypedDict):
    block_hash: str #hexstr
    version: int
    prev_block_hash: str #hexstr
    merkle_root: str #hexstr 
    timestamp: int
    bits: int
    nonce: int

class BitcoinBlockDataHandler:
    def __init__(self) -> None:
        self._block_height_url = lambda x: f"https://blockchain.info/block-height/{x}?format=json"
         
    async def get_block_at_height(self, height: int) -> dict:
        async with aiohttp.ClientSession() as session:
            async with session.get(self._block_height_url(height), ssl=False) as raw_resp:
                data = await raw_resp.json()

                if "blocks" not in data:
                    raise BitcoinApiFailure("response text:", await raw_resp.text())

                if len(data['blocks']) > 1:
                    raise StaleBlockDetected(f"Block height: {height}, has more than 1 block")

                return data['blocks'][0]

    @staticmethod
    def extract_block_header(full_block: dict) -> BlockHeader:
        return {
            "block_hash": full_block["hash"],
            "version": full_block["ver"],
            "prev_block_hash": full_block["prev_block"],
            "merkle_root": full_block["mrkl_root"],
            "timestamp": full_block["time"],
            "bits": full_block["bits"],
            "nonce": full_block["nonce"],
        }

    @staticmethod
    # TODO: THIS DOES NOT WORK?
    def hash_block_header(block_header: BlockHeader) -> str:  # hexstr
        # Concatenate and serialize the block header fields
        serialized_header = (
            block_header["version"].to_bytes(4, byteorder='little', signed=False) +
            bytes.fromhex(block_header["prev_block_hash"]) +
            bytes.fromhex(block_header["merkle_root"]) +
            block_header["timestamp"].to_bytes(4, byteorder='little', signed=False) +
            block_header["bits"].to_bytes(4, byteorder='little', signed=False) +
            block_header["nonce"].to_bytes(4, byteorder='little', signed=False)
        )
        print("version bytes", block_header["version"].to_bytes(4, byteorder='little', signed=False).hex())
        print("what is this ser header", serialized_header.hex())

        # Double hash the serialized header using SHA-256
        first_hash = hashlib.sha256(serialized_header).digest()
        second_hash = hashlib.sha256(first_hash).digest()

        # Convert the double-hashed bytes to hexadecimal string
        hex_str = second_hash.hex()

        # Bitcoin's block hash is in little-endian byte order, so we need to reverse the byte order
        return hex_str 
    
    @staticmethod
    def encode_to_noir_byte_array(hexstr: str) -> str:
        if len(hexstr) % 2 != 0:
            raise Exception("Not encodable, needs to be mod 2 length")
        if len(hexstr) == 0:
            return "[]" 
        # returns array str
        window_size = 2
        array_str = ""
        for i in range(0, len(hexstr), window_size):  # Change made here
            array_str += f"0x{hexstr[i: i + window_size]},"
        return f"[{array_str[:-1]}]"

    @staticmethod
    def dump_block_header_to_toml(data: BlockHeader, height: int):
        struct_data = ""
        for key in data:
            if key == "block_hash" or key == "prev_block_hash" or key == "merkle_root":
                struct_data += f"{key} = {BitcoinBlockDataHandler.encode_to_noir_byte_array(data[key])}\n" 
            else:
                struct_data += f"{key} = {data[key]}\n"
        struct_data += f"height = {height}"


    @staticmethod
    def dump_header_to_noir_struct(data: BlockHeader, data_out: str):
        # let block_header = BlockHeader { block_hash, version, prev_block_hash, merkle_root, timestamp, bits, nonce };
        struct_data = ""
        for key in data:
            if key == "block_hash" or key == "prev_block_hash" or key == "merkle_root":
                struct_data += f" {key}: {BitcoinBlockDataHandler.encode_to_noir_byte_array(data[key])}," 
            else:
                struct_data += f" {key}: {data[key]},"

        final_struct = "BlockHeader {" + struct_data[:-1] + "};"
        with open(data_out, "w+") as f:
            f.write(final_struct)

    @staticmethod
    def create_prover_toml(
            previous_block_hash_noir_array_str: str,
            previous_block_height: int,

            retarget_block_timestamp: int,
            retarget_block_bits: int,
            retarget_block_height: int,

            proposed_block_height: int,
            proposed_block_block_hash_noir_array_str: str,
            proposed_block_version: int,
            proposed_block_prev_block_hash_noir_array_str: str,
            proposed_block_merkle_root_noir_array_str: str,
            proposed_block_timestamp: int,
            proposed_block_bits: int,
            proposed_block_nonce: int,
        ):

        return dedent(f"""
            previous_block_hash = {previous_block_hash_noir_array_str}
            previous_block_height = {previous_block_height}

            [retarget_block]
            timestamp = {retarget_block_timestamp}
            bits = {retarget_block_bits}
            height = {retarget_block_height}

            [proposed_block]
            height = {proposed_block_height}
            block_hash = {proposed_block_block_hash_noir_array_str}
            version = {proposed_block_version} 
            prev_block_hash = {proposed_block_prev_block_hash_noir_array_str}
            merkle_root = {proposed_block_merkle_root_noir_array_str} 
            timestamp = {proposed_block_timestamp} 
            bits = {proposed_block_bits} 
            nonce = {proposed_block_nonce} 
            """
        )




def test():
    api = BitcoinBlockDataHandler()
    print(api.get_block_at_height(1))

async def build_circuit_input():
    # Edit:
    HEIGHT = 834625
    output_location = os.path.dirname(os.path.realpath(__file__)) + "/../circuits/block_verification/Prover.toml"
    OUT = output_location

    # Shouldn't need to touch:
    PREVIOUS_HEIGHT = HEIGHT - 1
    LAST_RETARGET_BLOCK_HEIGHT = math.floor(HEIGHT / 2016) * 2016
    print("Proposed Block", HEIGHT)
    print("Last Block", HEIGHT-1)
    print("Last Retarget", LAST_RETARGET_BLOCK_HEIGHT)

    handler = BitcoinBlockDataHandler()

    last_retarget_block, last_block, proposed_block = await asyncio.gather(*[
        handler.get_block_at_height(LAST_RETARGET_BLOCK_HEIGHT),
        handler.get_block_at_height(PREVIOUS_HEIGHT),
        handler.get_block_at_height(HEIGHT)
    ])
    

    last_retarget_header = BitcoinBlockDataHandler.extract_block_header(last_retarget_block)
    last_block_header = BitcoinBlockDataHandler.extract_block_header(last_block)
    proposed_block_header = BitcoinBlockDataHandler.extract_block_header(proposed_block)
    
    prover_str = BitcoinBlockDataHandler.create_prover_toml(
        previous_block_hash_noir_array_str=BitcoinBlockDataHandler.encode_to_noir_byte_array(last_block_header["block_hash"]),
        previous_block_height=HEIGHT-1,
        retarget_block_timestamp=last_retarget_header["timestamp"],
        retarget_block_bits=last_retarget_header["bits"],
        retarget_block_height=LAST_RETARGET_BLOCK_HEIGHT,

        proposed_block_height=HEIGHT, 
        proposed_block_block_hash_noir_array_str=BitcoinBlockDataHandler.encode_to_noir_byte_array(proposed_block_header["block_hash"]),
        proposed_block_version=proposed_block_header["version"],
        proposed_block_prev_block_hash_noir_array_str=BitcoinBlockDataHandler.encode_to_noir_byte_array(proposed_block_header["prev_block_hash"]),
        proposed_block_merkle_root_noir_array_str=BitcoinBlockDataHandler.encode_to_noir_byte_array(proposed_block_header["merkle_root"]),
        proposed_block_timestamp=proposed_block_header["timestamp"],
        proposed_block_bits=proposed_block_header["bits"],
        proposed_block_nonce=proposed_block_header["nonce"],
    )

    with open(OUT, "w+") as f:
        f.write(prover_str)
     

if __name__ == "__main__":
    asyncio.run(build_circuit_input())
