import { BigNumber, BigNumberish, ethers } from 'ethers';
import { DepositVault, ReservationState, SwapReservation } from '../types';
import { useStore } from '../store';
import { sepolia } from 'viem/chains';
import * as bitcoin from 'bitcoinjs-lib';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { bitcoinDecimals, SATS_PER_BTC } from './constants';

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

export function unBufferFrom18Decimals(amount, tokenDecimals) {
    const bigAmount = BigNumber.from(amount);
    if (tokenDecimals < 18) {
        return bigAmount.div(BigNumber.from(10).pow(18 - tokenDecimals));
    }
    return bigAmount;
}

export function calculateBtcOutputAmountFromExchangeRate(
    depositAmountFromContract,
    depositAssetDecimals,
    exchangeRateFromContract,
) {
    // [0] buffer deposit amount to 18 decimals
    const depositAmountInSmallestTokenUnitsBufferedTo18Decimals = bufferTo18Decimals(
        depositAmountFromContract,
        depositAssetDecimals,
    );

    console.log(
        'bruh, depositAmountInSmallestTokenUnitsBufferedTo18Decimals:',
        BigNumber.from(depositAmountInSmallestTokenUnitsBufferedTo18Decimals).toString(),
    );
    console.log('bruh, depositAmountFromContract:', BigNumber.from(depositAmountFromContract).toString());
    console.log('bruh, depositAssetDecimals:', BigNumber.from(depositAssetDecimals).toString());
    console.log('bruh, exchangeRateFromContract:', BigNumber.from(exchangeRateFromContract).toString());

    // [1] divide by exchange rate (which is already in smallest token units buffered to 18 decimals per sat)
    const outputAmountInSats = depositAmountInSmallestTokenUnitsBufferedTo18Decimals.div(exchangeRateFromContract);

    // [2] convert output amount from sats to btc
    const outputAmountInBtc = formatUnits(outputAmountInSats, bitcoinDecimals);

    return String(outputAmountInBtc);
}

export function formatBtcExchangeRate(exchangeRateInSmallestTokenUnitBufferedTo18DecimalsPerSat, depositAssetDecimals) {
    // [0] convert to smallest token amount per btc
    const exchangeRateInSmallestTokenUnitBufferedTo18DecimalsPerBtc = parseUnits(
        BigNumber.from(exchangeRateInSmallestTokenUnitBufferedTo18DecimalsPerSat).toString(),
        bitcoinDecimals,
    );

    // [1] unbuffer from 18 decimals
    const exchangeRateInSmallestTokenUnitPerBtc = unBufferFrom18Decimals(
        exchangeRateInSmallestTokenUnitBufferedTo18DecimalsPerBtc,
        depositAssetDecimals,
    );

    // [2] convert to btc per smallest token amount
    const exchangeRateInStandardUnitsPerBtc = formatUnits(exchangeRateInSmallestTokenUnitPerBtc, depositAssetDecimals);

    return exchangeRateInStandardUnitsPerBtc;
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

export function convertLockingScriptToBitcoinAddress(lockingScript: string): string {
    // Remove '0x' prefix if present
    const script = lockingScript.startsWith('0x') ? lockingScript.slice(2) : lockingScript;
    const scriptBuffer = Buffer.from(script, 'hex');

    try {
        // P2PKH
        if (
            scriptBuffer.length === 25 &&
            scriptBuffer[0] === bitcoin.opcodes.OP_DUP &&
            scriptBuffer[1] === bitcoin.opcodes.OP_HASH160 &&
            scriptBuffer[2] === 0x14 &&
            scriptBuffer[23] === bitcoin.opcodes.OP_EQUALVERIFY &&
            scriptBuffer[24] === bitcoin.opcodes.OP_CHECKSIG
        ) {
            const pubKeyHash = scriptBuffer.slice(3, 23);
            return bitcoin.address.toBase58Check(pubKeyHash, bitcoin.networks.bitcoin.pubKeyHash);
        }

        // P2SH
        if (
            scriptBuffer.length === 23 &&
            scriptBuffer[0] === bitcoin.opcodes.OP_HASH160 &&
            scriptBuffer[1] === 0x14 &&
            scriptBuffer[22] === bitcoin.opcodes.OP_EQUAL
        ) {
            const scriptHash = scriptBuffer.slice(2, 22);
            return bitcoin.address.toBase58Check(scriptHash, bitcoin.networks.bitcoin.scriptHash);
        }

        // P2WPKH
        if (scriptBuffer.length === 22 && scriptBuffer[0] === bitcoin.opcodes.OP_0 && scriptBuffer[1] === 0x14) {
            const witnessProgram = scriptBuffer.slice(2);
            return bitcoin.address.toBech32(witnessProgram, 0, bitcoin.networks.bitcoin.bech32);
        }

        // P2WSH
        if (scriptBuffer.length === 34 && scriptBuffer[0] === bitcoin.opcodes.OP_0 && scriptBuffer[1] === 0x20) {
            const witnessProgram = scriptBuffer.slice(2);
            return bitcoin.address.toBech32(witnessProgram, 0, bitcoin.networks.bitcoin.bech32);
        }

        // P2TR (Taproot)
        if (scriptBuffer.length === 34 && scriptBuffer[0] === bitcoin.opcodes.OP_1 && scriptBuffer[1] === 0x20) {
            const witnessProgram = scriptBuffer.slice(2);
            return bitcoin.address.toBech32(witnessProgram, 1, bitcoin.networks.bitcoin.bech32);
        }

        throw new Error('Unsupported locking script type');
    } catch (error) {
        console.error('Error converting locking script to address:', error);
        throw error;
    }
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

export const formatAmountToString = (selectedInputAsset, number) => {
    if (!number) return '';
    const roundedNumber = Number(number).toFixed(selectedInputAsset.decimals);
    return roundedNumber.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, ''); // Remove trailing zeros and pointless decimal
};

export function calculateFillPercentage(vault: DepositVault) {
    const fillPercentageBigNumber = BigNumber.from(vault.initialBalance)
        .sub(BigNumber.from(vault.unreservedBalanceFromContract))
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
            const availableAmountInWei = BigNumber.from(vault.trueUnreservedBalance);
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
