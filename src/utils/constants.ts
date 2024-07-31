import { BigNumber, BigNumberish, ethers } from 'ethers';
import { DepositVault } from '../types';
import { useStore } from '../store';
import { sepolia } from 'viem/chains';

// export const contractChainID = 1; // Ethereum Mainnet
export const contractChainID = 11155111; // Sepolia
export const contractRpcURL = 'https://ethereum-sepolia.blockpi.network/v1/rpc/public';
export const etherScanBaseUrl = 'https://sepolia.etherscan.io';

export const riftExchangeContractAddress = '0x421b6FaDB88281402F688010C60Cc72EB9f10135';
export const wethAddress = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';
export const WETH_ABI = [
    {
        constant: false,
        inputs: [
            { name: 'guy', type: 'address' },
            { name: 'wad', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
    },
];
