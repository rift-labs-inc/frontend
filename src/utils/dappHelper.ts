import { BigNumber, BigNumberish, ethers } from 'ethers';
import { DepositVault, ReservationState, SwapReservation } from '../types';
import { useStore } from '../store';
import { sepolia } from 'viem/chains';
import * as bitcoin from 'bitcoinjs-lib';

const SATS_PER_BTC = 100000000; // 10^8

// HELPER FUCTIONS
export function weiToEth(wei: BigNumber): BigNumberish {
    return ethers.utils.formatEther(wei);
}

export function ethToWei(eth: string): BigNumber {
    return ethers.utils.parseEther(eth);
}

export function satsToBtc(sats: number): number {
    return sats / SATS_PER_BTC;
}

export function btcToSats(btc: number): BigNumber {
    return BigNumber.from(SATS_PER_BTC * btc);
}

export function bufferTo18Decimals(amount, tokenDecimals) {
    const bigAmount = BigNumber.from(amount);
    if (tokenDecimals < 18) {
        return bigAmount.mul(BigNumber.from(10).pow(18 - tokenDecimals));
    }
    return bigAmount;
}

export function unBufferTo18Decimals(amount, tokenDecimals) {
    const bigAmount = BigNumber.from(amount);
    if (tokenDecimals < 18) {
        return bigAmount.div(BigNumber.from(10).pow(18 - tokenDecimals));
    }
    return bigAmount;
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
    // const vaultIndexToOverwrite = allDepositVaults.findIndex((vault) => BigNumber.from(vault.unreservedBalance).eq(0));
    // return vaultIndexToOverwrite;
    return -1;
}

export function findVaultIndexWithSameExchangeRate(): number {
    // TODO - implement this
    // const vaultIndexWithSameExchangeRate = allDepositVaults.findIndex((vault) => BigNumber.from(vault.btcExchangeRate).eq(allDepositVaults[0].btcExchangeRate));
    // return vaultIndexWithSameExchangeRate;
    return -1;
}

export function convertToBitcoinLockingScript(address: string): string {
    // TODO - validate and test all address types with alpine
    try {
        let script: Buffer;

        // Handle Bech32 addresses (including P2WPKH, P2WSH, and P2TR)
        if (address.toLowerCase().startsWith('bc1')) {
            const { data, version } = bitcoin.address.fromBech32(address);
            if (version === 0) {
                if (data.length === 20) {
                    // P2WPKH
                    script = bitcoin.script.compile([bitcoin.opcodes.OP_0, data]);
                } else if (data.length === 32) {
                    // P2WSH
                    script = bitcoin.script.compile([bitcoin.opcodes.OP_0, data]);
                }
            } else if (version === 1 && data.length === 32) {
                // P2TR (Taproot)
                script = bitcoin.script.compile([bitcoin.opcodes.OP_1, data]);
            }
        } else {
            // Handle legacy addresses (P2PKH and P2SH)
            const { version, hash } = bitcoin.address.fromBase58Check(address);

            // P2PKH
            if (version === bitcoin.networks.bitcoin.pubKeyHash) {
                script = bitcoin.script.compile([
                    bitcoin.opcodes.OP_DUP,
                    bitcoin.opcodes.OP_HASH160,
                    hash,
                    bitcoin.opcodes.OP_EQUALVERIFY,
                    bitcoin.opcodes.OP_CHECKSIG,
                ]);
            }

            // P2SH
            else if (version === bitcoin.networks.bitcoin.scriptHash) {
                script = bitcoin.script.compile([bitcoin.opcodes.OP_HASH160, hash, bitcoin.opcodes.OP_EQUAL]);
            }
        }

        if (!script) {
            throw new Error('Unsupported address type');
        }

        console.log('locking script:', script);
        return '0x' + script.toString('hex');
    } catch (error) {
        console.error('Error converting address to locking script:', error);
        throw error; // Re-throw the error for proper handling in the calling code
    }
}

export function calculateFillPercentage(vault: DepositVault) {
    const fillPercentageBigNumber = BigNumber.from(vault.initialBalance)
        .sub(BigNumber.from(vault.unreservedBalance))
        .div(BigNumber.from(vault.initialBalance))
        .mul(100);

    const fillPercentage = fillPercentageBigNumber.toNumber();
    return Math.min(Math.max(fillPercentage, 0), 100); // Ensure it's between 0 and 100
}

export function calculateLowestFeeReservation(
    depositVaults: DepositVault[],
    inputAmountInSats: BigNumber,
    maxLpOutputs: number,
): { vaultIndexes: number[]; amountsToReserve: BigNumber[] } {
    const vaultIndexes: number[] = [];
    const amountsToReserve: BigNumber[] = [];

    try {
        const sortedVaults = [...depositVaults]
            .map((vault, index) => ({ ...vault, index }))
            .sort((a, b) => BigNumber.from(b.btcExchangeRate).sub(BigNumber.from(a.btcExchangeRate)).toNumber());

        let remainingAmountInSats = inputAmountInSats;

        for (const vault of sortedVaults) {
            if (vaultIndexes.length >= maxLpOutputs || remainingAmountInSats.lte(0)) break;

            const exchangeRate = BigNumber.from(vault.btcExchangeRate); // wei per sat
            const availableAmountInWei = BigNumber.from(vault.calculatedTrueUnreservedBalance);
            const availableAmountInSats = availableAmountInWei.div(exchangeRate);

            const amountToReserveInSats = remainingAmountInSats.lt(availableAmountInSats)
                ? remainingAmountInSats
                : availableAmountInSats;

            if (amountToReserveInSats.gt(0)) {
                const amountToReserveInWei = amountToReserveInSats.mul(exchangeRate);
                vaultIndexes.push(vault.index!);
                amountsToReserve.push(amountToReserveInWei);
                remainingAmountInSats = remainingAmountInSats.sub(amountToReserveInSats);
            }
        }
    } catch (error) {
        console.log('error', error);
    }

    return {
        vaultIndexes,
        amountsToReserve,
    };
}
