# Grabs blocks from btc block data api
from os import stat
import requests
from typing import TypedDict, List
import hashlib

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
         
    def get_block_at_height(self, height: int) -> dict:
        raw_resp = requests.get(self._block_height_url(height))
        data = raw_resp.json()
        if "blocks" not in data:
            raise BitcoinApiFailure("response text:", raw_resp.text)
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
    # todo a function to build the new prover data style


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

def test():
    api = BitcoinBlockDataHandler()
    print(api.get_block_at_height(1))

def build_circuit_input():
    height =  645536
    out = "Prover.toml"
    out_data = "data.txt"
    handler = BitcoinBlockDataHandler()
    block = handler.get_block_at_height(height)
    header = BitcoinBlockDataHandler.extract_block_header(block)
    BitcoinBlockDataHandler.dump_block_header_to_toml(header, height)
    BitcoinBlockDataHandler.dump_header_to_noir_struct(header, out_data)

    with open(toml_path, "w+") as f:
        f.write(struct_data)
     

if __name__ == "__main__":
    build_circuit_input() 
