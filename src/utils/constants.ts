import { BigNumber, BigNumberish, ethers } from 'ethers';
import { ValidAsset, DepositVault } from '../types';
import { useStore } from '../store';
import { ETH_Icon, ETH_Logo, USDT_Icon } from '../components/other/SVGs';

// export const contractChainID = 1; // Ethereum Mainnet
export const mainnetEthRpcUrl = 'https://archive-node.tail0a0b83.ts.net/ethereum/?key=7a29b610f3c03ebe55c4dcc5138884bea1976a7b9804fefc796da213610e0bf5';
export const bitcoinDecimals = 8;
export const SATS_PER_BTC = 100000000; // 10^8
export const CONTRACT_RESERVATION_EXPIRY_TIME = 8 * 60 * 60; // 8 hours
export const FRONTEND_RESERVATION_EXPIRY_TIME = 4 * 60 * 60; // 8 hours
export const bitcoin_bg_color = '#c26920';
export const bitcoin_border_color = '#FFA04C';
export const bitcoin_dark_bg_color = '#372412';
export const bitcoin_light_text_color = '#7d572e';
export const opaqueBackgroundColor = { bg: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(10px)' };
export const etherScanBaseUrl = 'https://sepolia.arbiscan.io/';
export const RESERVATION_SERVER_URL = 'https://rift-paymaster-arbitrum-sepolia.up.railway.app';

// export const riftExchangeContractAddress = '0x4f9182DBcCf9C6518b1D67181F4E5a6d3D223C0E'; // deployed for USDT on Sepolia
export const maxSwapOutputs = 175;
export const maxSwapLimitInUSDT = 100; // 100 USDT
export const maxSwapLimitInMicroUSDT = maxSwapLimitInUSDT * 10 ** 6; // 100 USDT

export const protocolFeePercentage = BigNumber.from(1); // 0.1%
export const protocolFeeDenominator = BigNumber.from(1000); // 100% / 0.1% = 1000

export const ERC20ABI = [
    {
        type: 'event',
        name: 'Approval',
        inputs: [
            {
                indexed: true,
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'allowance',
        stateMutability: 'view',
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'spender',
                type: 'address',
            },
        ],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'approve',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
    {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'decimals',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'uint8',
            },
        ],
    },
    {
        type: 'function',
        name: 'name',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'symbol',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'totalSupply',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'transfer',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'recipient',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
    {
        type: 'function',
        name: 'transferFrom',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'sender',
                type: 'address',
            },
            {
                name: 'recipient',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
];
