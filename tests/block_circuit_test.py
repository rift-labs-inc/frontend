import asyncio
from pydantic import BaseModel
import json

from utils.noir_lib import (
    initialize_noir_project_folder,
    compile_project,
    create_witness,
    normalize_hex_str,
    pad_list,
    hex_string_to_byte_array,
    split_hex_into_31_byte_chunks,
    create_proof,
    build_raw_verification_key,
    extract_vk_as_fields,
    verify_proof
)

"""
struct Block {
    height: u64,
    version: Field,
    prev_block_hash: [u8; 32],
    merkle_root: [u8; 32],
    timestamp: Field,
    bits: Field,
    nonce: Field,
}

[proposed_block]
bits = ""
height = ""
merkle_root = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
nonce = ""
prev_block_hash = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
timestamp = ""
version = ""



    proposed_block_hash_encoded: pub [Field; 2],
    safe_block_hash_encoded: pub [Field; 2],
    retarget_block_hash_encoded: pub [Field; 2],
    safe_block_height: pub u64,
    block_height_delta: pub u64,
    proposed_block: Block,
    safe_block: Block,
    retarget_block: Block,
    inner_block_hashes_encoded: [[Field; 2]; INNER_BLOCK_COUNT],
    inner_blocks: [Block; INNER_BLOCK_COUNT]
"""

class Block(BaseModel):
    height: int
    version: int
    prev_block_hash: str
    merkle_root: str
    timestamp: int
    bits: int
    nonce: int

async def block_toml_encoder(block: Block) -> list[str]:
    return [
        f"bits={block.bits}",
        f"height={block.height}",
        f"merkle_root={json.dumps(hex_string_to_byte_array(block.merkle_root))}",
        f"nonce={block.nonce}",
        f"prev_block_hash={json.dumps(hex_string_to_byte_array(block.prev_block_hash))}",
        f"timestamp={block.timestamp}",
        f"version={block.version}",
    ]

async def create_prover_toml_witness(
    proposed_block_hash_hex: str,
    safe_block_hash_hex: str,
    retarget_block_hash_hex: str,
    safe_block_height: int,
    block_height_delta: int,
    proposed_block: Block,
    safe_block: Block,
    retarget_block: Block,
    inner_block_hashes_hex: list[str],
    inner_blocks: list[Block],
    compilation_build_folder: str
):
    MAX_INNER_BLOCKS = 100
    if len(inner_block_hashes_hex) > MAX_INNER_BLOCKS:
        raise ValueError(f"Too many inner blocks. Max is {MAX_INNER_BLOCKS}")
    
    padded_inner_blocks = pad_list(inner_blocks, MAX_INNER_BLOCKS, Block(
        height=0,
        version=0,
        prev_block_hash='0' * 64,
        merkle_root='0' * 64,
        timestamp=0,
        bits=0,
        nonce=0
    ))

    proposed_block_hash_encoded = split_hex_into_31_byte_chunks(proposed_block_hash_hex)
    safe_block_hash_encoded = split_hex_into_31_byte_chunks(safe_block_hash_hex)
    retarget_block_hash_encoded = split_hex_into_31_byte_chunks(retarget_block_hash_hex)
    inner_block_hashes_encoded = [split_hex_into_31_byte_chunks(inner_block_hash) for inner_block_hash in inner_block_hashes_hex]

    padded_inner_block_hashes_encoded = pad_list(inner_block_hashes_encoded, MAX_INNER_BLOCKS, ["0x0", "0x0"])


    prover_toml_string = "\n".join(
        [
            f"proposed_block_hash_encoded={json.dumps(proposed_block_hash_encoded)}",
            f"safe_block_hash_encoded={json.dumps(safe_block_hash_encoded)}",
            f"retarget_block_hash_encoded={json.dumps(retarget_block_hash_encoded)}",
            f"safe_block_height={safe_block_height}",
            f"block_height_delta={block_height_delta}",
            
            "[proposed_block]",
            *block_toml_encoder(proposed_block),

            "[safe_block]",
            *block_toml_encoder(safe_block),

            "[retarget_block]",
            *block_toml_encoder(retarget_block),

            f"inner_block_hashes_encoded={json.dumps(padded_inner_block_hashes_encoded)}",
            
            *list(map(lambda block: "\n".join(
                "[[inner_blocks]]",
                *block_toml_encoder(block)
            ), padded_inner_blocks)),

        ]
    )
    print("PROVER TOML STRING")
    print(prover_toml_string)

    await create_witness(prover_toml_string, compilation_build_folder)



async def single_block_verification_test():
    BLOCK_VERIFICATION_DIR = "circuits/block_verification"
    
    await compile_project(BLOCK_VERIFICATION_DIR)

    proposed_block = Block(
        height=848525,
        version=1,
        prev_block_hash="0000000000000000000116072c747a36de1e104cef399dd388c36dd1cf7fd4ec",
        merkle_root="450a32c0f61ce7155893f9a6ba5d44db2c6124c3a11ff01c071a22b02ee96aa4",
        timestamp=1718745344,
        bits=386096312,
        nonce=1595975252
    )

    safe_block = Block(
        height=848524,
        version=1,
        prev_block_hash="000000000000000000002b338c518fa4970e11b7365915934bad79b0210b800e",
        merkle_root="c09758b50aa04c688b45d2284f100ec798fa3d8605af928093d9b84d046be1bc",
        timestamp=1718742499,
        bits=386096312,
        nonce=4279523078
    )

    retarget_block = Block(
        height=846720,
        version=1,
        prev_block_hash="0000000000000000000132f5df736574a143d1e41e1a0cdb9c7d1656a906124c",
        merkle_root="feac8899c7090cd12aaca0c5fb3f5f33ad1e5935934db150bd0f5a7e84aff439",
        timestamp=1717664663,
        bits=386096312,
        nonce=1595975252
    )
    
    await create_prover_toml_witness(
        proposed_block_hash_hex="0x",
        safe_block_hash_hex="0x",
        retarget_block_hash_hex="0x",
        safe_block_height=safe_block.height,
        block_height_delta=proposed_block.height - safe_block.height,
        proposed_block=proposed_block,
        safe_block=safe_block,
        retarget_block=retarget_block,
        inner_block_hashes_hex=[],
        inner_blocks=[],
        compilation_build_folder=BLOCK_VERIFICATION_DIR
    )


def main():
    asyncio.run(single_block_verification_test())

if __name__ == "__main__":
    main()