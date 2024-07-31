import { BigNumber, BigNumberish, ethers } from 'ethers';
import { DepositVault } from '../types';
import { useStore } from '../store';
import { sepolia } from 'viem/chains';

const SATS_PER_BTC = 100000000; // 10^8

// const allUserDepositVaults = useStore((state) => state.allUserDepositVaults);

// HELPER FUCTIONS
export function weiToEth(wei: ethers.BigNumberish): number {
    return parseFloat(ethers.utils.formatEther(wei));
}

export function ethToWei(eth: number): BigNumber {
    return ethers.utils.parseEther(eth.toString());
}

export function satsToBtc(sats: number): number {
    return sats / SATS_PER_BTC;
}

export function btcToSats(btcRate: number): string {
    // btc / eth
    return (SATS_PER_BTC / btcRate).toFixed(0);
}

export function calculateAmountBitcoinOutput(vault: DepositVault): BigNumber {
    const btcExchangeRate = 1 / satsToBtc(BigNumber.from(vault.btcExchangeRate).toNumber());
    console.log('btcExchangeRate:', btcExchangeRate);
    console.log('vault.initialBalance:', vault.initialBalance);
    console.log('BigNumber.from(vault.initialBalance):', BigNumber.from(vault.initialBalance));
    console.log('BigNumber.from(btcExchangeRate):', BigNumber.from(btcExchangeRate));
    const amountBitcoinOutput = BigNumber.from(vault.initialBalance).mul(BigNumber.from(btcExchangeRate));
    return amountBitcoinOutput;
}

export function findVaultIndexToOverwrite(): number {
    // TODO - implement this
    // const vaultIndexToOverwrite = allUserDepositVaults.findIndex((vault) => BigNumber.from(vault.unreservedBalance).eq(0));
    // return vaultIndexToOverwrite;
    return -1;
}

export function findVaultIndexWithSameExchangeRate(): number {
    // TODO - implement this
    // const vaultIndexWithSameExchangeRate = allUserDepositVaults.findIndex((vault) => BigNumber.from(vault.btcExchangeRate).eq(allUserDepositVaults[0].btcExchangeRate));
    // return vaultIndexWithSameExchangeRate;
    return -1;
}

export function calculateFillPercentage(vault: DepositVault) {
    const fillPercentageBigNumber = BigNumber.from(vault.initialBalance)
        .sub(BigNumber.from(vault.unreservedBalance))
        .div(BigNumber.from(vault.initialBalance))
        .mul(100);

    const fillPercentage = fillPercentageBigNumber.toNumber();
    return Math.min(Math.max(fillPercentage, 0), 100); // Ensure it's between 0 and 100
}

// CONTRACT FUNCTIONS TODO make into hooks

export async function withdrawLiquidity(
    signer: ethers.Signer,
    riftExchangeAbi: ethers.ContractInterface,
    riftExchangeContract: string,
    globalVaultIndex: number,
    localVaultIndex: number,
    amountToWithdraw: BigNumberish,
    expiredReservationIndexes: number[],
): Promise<{ success: boolean; error?: string }> {
    // [0] create contract instance
    const riftExchangeContractInstance = new ethers.Contract(riftExchangeContract, riftExchangeAbi, signer);

    try {
        console.log('Withdrawing liquidity...');
        console.log('globalVaultIndex:', globalVaultIndex);
        console.log('localVaultIndex:', localVaultIndex);
        console.log('amountToWithdraw:', amountToWithdraw.toString());
        console.log('expiredReservationIndexes:', expiredReservationIndexes);

        // withdraw liquidity
        const withdrawTx = await riftExchangeContractInstance.withdrawLiquidity(
            globalVaultIndex,
            localVaultIndex,
            amountToWithdraw,
            expiredReservationIndexes,
        );

        await withdrawTx.wait();
        console.log('Liquidity withdrawn successfully');

        return {
            success: true,
        };
    } catch (error) {
        console.error('Error in withdrawLiquidity:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
