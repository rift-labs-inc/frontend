import { BigNumber, BigNumberish, ethers } from 'ethers';
import { DepositAsset, DepositVault } from '../types';
import { useStore } from '../store';
import { sepolia } from 'viem/chains';
import { ETH_Icon, ETH_Logo, USDT_Icon } from '../components/other/SVGs';

// export const contractChainID = 1; // Ethereum Mainnet
export const etherScanBaseUrl = 'https://sepolia.etherscan.io';

// export const riftExchangeContractAddress = '0x4f9182DBcCf9C6518b1D67181F4E5a6d3D223C0E'; // deployed for USDT on Sepolia
export const maxSwapOutputs = 200; // TODO: inspect this and find real value

export const validDepositAssets: Record<string, DepositAsset> = {
    USDT: {
        name: 'USDT',
        address: '0x4f9182DBcCf9C6518b1D67181F4E5a6d3D223C0E', // Sepolia USDT
        decimals: 6,
        riftExchangeContractAddress: '0x4f9182DBcCf9C6518b1D67181F4E5a6d3D223C0E', // USDT Rift Exchange pool on Sepolia
        contractChainID: 11155111,
        contractRpcURL: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
        abi: [
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
        ],
        icon_svg: USDT_Icon,
        bg_color: '#125641',
        border_color: '#26A17B',
        dark_bg_color: '#041B14',
        light_text_color: '#265C4C',
    },
    WETH: {
        name: 'WETH',
        address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // Sepolia WETH
        decimals: 18,
        riftExchangeContractAddress: '0xe6167f469152293b045838d69F9687a7Ee30aaf3', // WETH Rift Exchange pool on Sepolia
        contractChainID: 11155111,
        contractRpcURL: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
        abi: [
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
        ],
        icon_svg: ETH_Logo,
        bg_color: '#2E40B7',
        border_color: '#627EEA',
        dark_bg_color: '#161A33',
        light_text_color: '#5b63a5',
    },
};
