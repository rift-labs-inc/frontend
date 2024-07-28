import { BigNumber, BigNumberish, ethers } from 'ethers';
import { DepositVault } from '../types';
import { useStore } from '../store';
import { sepolia } from 'viem/chains';

// export const contractChainID = 1; // Ethereum Mainnet
export const contractChainID = 11155111; // Sepolia
export const rpcURL = 'https://ethereum-sepolia.blockpi.network/v1/rpc/public';
export const riftExchangeContractAddress = '0xc8ca5D13913d2D2686Aea5906888458E9EE7a7cE';
export const wethAddress = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';
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

// CONTRACT FUNCTIONS

const WETH_ABI = [
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

export async function approveWETH(
    signer: ethers.Signer,
    wethAddress: string,
    spenderAddress: string,
    amount: ethers.BigNumberish,
) {
    const wethContract = new ethers.Contract(wethAddress, WETH_ABI, signer);

    try {
        const tx = await wethContract.approve(spenderAddress, amount);
        await tx.wait();
        console.log('WETH approval successful');
        return true;
    } catch (error) {
        console.error('Error approving WETH:', error);
        return false;
    }
}

export async function depositLiquidity(
    signer: ethers.Signer,
    riftExchangeAbi: ethers.ContractInterface,
    riftExchangeContract: string,
    wethAddress: string,
    btcPayoutLockingScript: string,
    btcExchangeRate: BigNumberish,
    vaultIndexToOverwrite: number,
    depositAmount: BigNumberish,
    vaultIndexWithSameExchangeRate: number,
): Promise<{ success: boolean; error?: string }> {
    // [0] create contract instances
    const wethContract = new ethers.Contract(wethAddress, WETH_ABI, signer);
    const riftExchangeContractInstance = new ethers.Contract(riftExchangeContract, riftExchangeAbi, signer);

    try {
        // check if the user has enough approved WETH
        const allowance = await wethContract.allowance(await signer.getAddress(), riftExchangeContract);
        console.log('allowance:', allowance.toString());
        console.log('depositAmount:', depositAmount.toString());
        console.log('bitcoinExchangeRate:', btcExchangeRate.toString());
        console.log('bitcoinPayoutLockingScript:', btcPayoutLockingScript);

        if (BigNumber.from(allowance).lt(BigNumber.from(depositAmount))) {
            // [1] approve exact amount of WETH
            console.log('Approving deposit WETH...');
            const approveTx = await wethContract.approve(riftExchangeContract, depositAmount);
            await approveTx.wait();
            console.log('WETH approval successful');
        }

        // [2] deposit liquidity
        console.log('Depositing liquidity...');
        console.log('btcPayoutLockingScript:', btcPayoutLockingScript);
        console.log('btcExchangeRate:', btcExchangeRate);
        console.log('vaultIndexToOverwrite:', vaultIndexToOverwrite);
        console.log('depositAmount:', depositAmount.toString());
        console.log('vaultIndexWithSameExchangeRate:', vaultIndexWithSameExchangeRate);

        const depositTx = await riftExchangeContractInstance.depositLiquidity(
            btcPayoutLockingScript,
            btcExchangeRate,
            vaultIndexToOverwrite,
            depositAmount.toString(),
            vaultIndexWithSameExchangeRate,
        );

        await depositTx.wait();
        console.log('Liquidity deposited successfully');

        return {
            success: true,
        };
    } catch (error) {
        console.error('Error in depositLiquidity:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
