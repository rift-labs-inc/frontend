import { ethers } from 'ethers';

export const contractChainID = 1;
export const rpcURL = 'https://ethereum-sepolia.blockpi.network/v1/rpc/public';
export const riftExchangeContractAddress = '0xc8ca5D13913d2D2686Aea5906888458E9EE7a7cE';

// HELPER FUCTIONS
export function weiToEth(wei: ethers.BigNumberish): number {
    return parseFloat(ethers.utils.formatEther(wei));
}

export function satsToBtc(sats: ethers.BigNumberish): number {
    return parseFloat(ethers.utils.formatUnits(sats, 8));
}
