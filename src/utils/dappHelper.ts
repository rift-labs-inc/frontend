import { BigNumber, BigNumberish, ethers, FixedNumber } from 'ethers';
import { DepositVault, ReservationState, SwapReservation } from '../types';
import { useStore } from '../store';
import { sepolia } from 'viem/chains';
import * as bitcoin from 'bitcoinjs-lib';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { bitcoinDecimals, maxSwapOutputs, SATS_PER_BTC } from './constants';
import { format } from 'path';

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
    // return 80;
    const fillPercentageBigNumber = BigNumber.from(vault.initialBalance)
        .sub(BigNumber.from(vault.unreservedBalanceFromContract))
        .div(BigNumber.from(vault.initialBalance))
        .mul(100);

    const fillPercentage = fillPercentageBigNumber.toNumber();
    return Math.min(Math.max(fillPercentage, 0), 100);
}

export function calculateBestVaultsForBitcoinInput(depositVaults, bitcoinAmountInSats, maxLpOutputs = maxSwapOutputs) {
    // [0] validate inputs
    console.log('testing, depositVaults:', depositVaults);

    if (!depositVaults || depositVaults.length === 0 || bitcoinAmountInSats.lte(0)) {
        return null;
    }

    // [1] preprocess deposit vaults
    const filteredVaults = depositVaults.filter(
        (vault) => vault.trueUnreservedBalance && BigNumber.from(vault.trueUnreservedBalance).gt(0),
    );
    if (filteredVaults.length === 0) return null;

    // [2] sort vaults based on exchange rate (high -> low)
    const sortedVaults = filteredVaults.sort((a, b) => b.btcExchangeRate.sub(a.btcExchangeRate).toNumber());
    console.log('sortedVaults:', sortedVaults);

    // [3] setup variables to track results
    let totalBitcoinAmountInSatsUsed = BigNumber.from(0);
    let totalμUsdtSwapOutput = BigNumber.from(0);
    let vaultIndexes = [];
    let amountsInμUsdtToReserve = [];
    let amountsInSatsToBePaid = [];
    let btcPayoutLockingScripts = [];
    let btcExchangeRates = [];
    let remainingVaults = maxLpOutputs;

    // [4] iterate through the sorted vaults and calculate optimal combo
    for (let i = 0; i < sortedVaults.length; i++) {
        if (remainingVaults <= 0 || bitcoinAmountInSats.lte(0)) break;
        const vault = sortedVaults[i];

        // [0] calculate amount of USDT to take from current vault based on remaining bitcoin amount
        const bufferedμUSDTStillNeeded = vault.btcExchangeRate.mul(bitcoinAmountInSats);
        const μUsdtStillNeeded = unBufferFrom18Decimals(bufferedμUSDTStillNeeded, vault.depositAsset.decimals);
        const usdtStillNeeded = formatUnits(μUsdtStillNeeded, vault.depositAsset.decimals);

        // [1] if we need more USDT than is in the vault, take all of it otherwise take remaining amount needed
        const μUsdtToTakeFromVault = μUsdtStillNeeded.gt(vault.trueUnreservedBalance)
            ? vault.trueUnreservedBalance
            : parseUnits(usdtStillNeeded, vault.depositAsset.decimals);
        const bufferedμUSDTToTakeFromVault = bufferTo18Decimals(μUsdtToTakeFromVault, vault.depositAsset.decimals);

        // // [2] update tracked amounts
        totalμUsdtSwapOutput = totalμUsdtSwapOutput.add(μUsdtToTakeFromVault);

        const fixedNumberBufferedμUSDTToTakeFromVault = FixedNumber.from(bufferedμUSDTToTakeFromVault);
        const fixedNumberExchangeRate = FixedNumber.from(vault.btcExchangeRate);

        const satsUsed = Math.round(
            fixedNumberBufferedμUSDTToTakeFromVault.divUnsafe(fixedNumberExchangeRate).toUnsafeFloat(),
        );

        totalBitcoinAmountInSatsUsed = totalBitcoinAmountInSatsUsed.add(satsUsed);
        vaultIndexes.push(vault.index); // Store the index of the vault used
        amountsInμUsdtToReserve.push(μUsdtToTakeFromVault); // Store the amount of μUSDT used from this vault
        amountsInSatsToBePaid.push(satsUsed); // Store the amount of sats used from this vault
        btcPayoutLockingScripts.push(vault.btcPayoutLockingScript); // Store the BTC payout locking script
        btcExchangeRates.push(vault.btcExchangeRate); // Store the BTC exchange rate
        bitcoinAmountInSats = bitcoinAmountInSats.sub(satsUsed);
        remainingVaults--;
    }

    // [5] calculate the total swap exchange rate in microusdtbuffered to 18 decimals per sat
    let totalSwapExchangeRate;
    if (totalBitcoinAmountInSatsUsed.gt(0)) {
        // Calculate total exchange rate if sats were used
        totalSwapExchangeRate = bufferTo18Decimals(totalμUsdtSwapOutput, depositVaults[0].depositAsset.decimals).div(
            totalBitcoinAmountInSatsUsed,
        );
    } else {
        // No sats used, so exchange rate calculation is not applicable
        totalSwapExchangeRate = BigNumber.from(0);
    }

    //TODO: handle over maxLpOutputs case

    // [6] return results
    return {
        totalBitcoinAmountInSatsUsed,
        totalμUsdtSwapOutput,
        vaultIndexes,
        amountsInμUsdtToReserve,
        amountsInSatsToBePaid,
        btcPayoutLockingScripts,
        btcExchangeRates,
        totalSwapExchangeRate,
    };
}

export function createReservationUrl(orderNonce: string, reservationId: string): string {
    const combined = `${orderNonce}:${reservationId}`;
    return btoa(combined);
}

export function decodeReservationUrl(url: string): { orderNonce: string; reservationId: string } {
    const decoded = atob(url);
    const [orderNonce, reservationId] = decoded.split(':');

    return { orderNonce, reservationId };
}
