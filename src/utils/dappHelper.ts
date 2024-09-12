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

export function calculateBtcOutputAmountFromExchangeRate(depositAmountFromContract, depositAssetDecimals, exchangeRateFromContract) {
    // [0] buffer deposit amount to 18 decimals
    const depositAmountInSmallestTokenUnitsBufferedTo18Decimals = bufferTo18Decimals(depositAmountFromContract, depositAssetDecimals);

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
    const exchangeRateInSmallestTokenUnitPerBtc = unBufferFrom18Decimals(exchangeRateInSmallestTokenUnitBufferedTo18DecimalsPerBtc, depositAssetDecimals);

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
        if (scriptBuffer.length === 23 && scriptBuffer[0] === bitcoin.opcodes.OP_HASH160 && scriptBuffer[1] === 0x14 && scriptBuffer[22] === bitcoin.opcodes.OP_EQUAL) {
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
                script = bitcoin.script.compile([bitcoin.opcodes.OP_DUP, bitcoin.opcodes.OP_HASH160, hash, bitcoin.opcodes.OP_EQUALVERIFY, bitcoin.opcodes.OP_CHECKSIG]);
            }

            // P2SH
            else if (version === bitcoin.networks.bitcoin.scriptHash) {
                script = bitcoin.script.compile([bitcoin.opcodes.OP_HASH160, hash, bitcoin.opcodes.OP_EQUAL]);
            }
        }

        if (!script) {
            throw new Error('Unsupported address type');
        }

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

export function calculateBestVaultsForBitcoinInput(depositVaults, satsToSpend, maxLpOutputs = maxSwapOutputs) {
    console.log('satsToSpend:', satsToSpend.toString());

    // [0] validate inputs
    if (!Array.isArray(depositVaults) || depositVaults.length === 0 || satsToSpend.lte(0)) {
        return null;
    }

    // [2] sort vaults based on exchange rate (high -> low)
    const sortedVaults = depositVaults?.sort((a, b) => b.btcExchangeRate.sub(a.btcExchangeRate).toNumber());

    // [3] setup variables to track results
    let totalSatsUsed = BigNumber.from(0);
    let totalMicroUsdtSwapOutput = BigNumber.from(0);

    // [4] setup arrays to track results (each index corresponds to the same vault)
    let vaultIndexes = [];
    let amountsInMicroUsdtToReserve = [];
    let amountsInSatsToBePaid = [];
    let btcPayoutLockingScripts = [];
    let btcExchangeRates = [];
    let totalLpOutputsUsed = 0;

    // [5] iterate through the sorted vaults and calculate optimal combo
    for (let i = 0; i < sortedVaults.length; i++) {
        // [0] break if we have reached the max number of LP outputs or have no more sats to spend
        if (totalLpOutputsUsed >= maxLpOutputs || satsToSpend.lte(0)) break;

        // [1] calculate amount of USDT to take from current vault based on remaining input sats
        const vault = sortedVaults[i];
        const bufferedMicroUSDTStillNeeded = vault.btcExchangeRate.mul(satsToSpend);
        const MicroUsdtStillNeeded = unBufferFrom18Decimals(bufferedMicroUSDTStillNeeded, vault.depositAsset.decimals);

        // [2] if we need more USDT than is in the vault, take all of it otherwise take remaining amount needed
        const MicroUsdtToTakeFromVault = MicroUsdtStillNeeded.gt(vault.trueUnreservedBalance) ? vault.trueUnreservedBalance : MicroUsdtStillNeeded;
        const bufferedMicroUSDTToTakeFromVault = bufferTo18Decimals(MicroUsdtToTakeFromVault, vault.depositAsset.decimals);
        const fixedNumberBufferedMicroUSDTToTakeFromVault = FixedNumber.from(bufferedMicroUSDTToTakeFromVault);
        const fixedNumberExchangeRate = FixedNumber.from(vault.btcExchangeRate.toString());
        const satsUsed = Math.floor(fixedNumberBufferedMicroUSDTToTakeFromVault.divUnsafe(fixedNumberExchangeRate).toUnsafeFloat());

        // [3] update tracked amounts, but skip vaults with 0 sats or 0 micro USDT
        if (MicroUsdtToTakeFromVault.gt(0) && satsUsed > 0) {
            totalMicroUsdtSwapOutput = totalMicroUsdtSwapOutput.add(MicroUsdtToTakeFromVault);
            totalSatsUsed = totalSatsUsed.add(satsUsed);
            vaultIndexes.push(vault.index); // Store the index of the vault used
            amountsInMicroUsdtToReserve.push(MicroUsdtToTakeFromVault); // Store the amount of MicroUSDT used from this vault
            amountsInSatsToBePaid.push(satsUsed); // Store the amount of sats used from this vault
            btcPayoutLockingScripts.push(vault.btcPayoutLockingScript); // Store the BTC payout locking script
            btcExchangeRates.push(vault.btcExchangeRate); // Store the BTC exchange rate
            satsToSpend = satsToSpend.sub(satsUsed);
            totalLpOutputsUsed++;
        }
    }

    // [6] calculate the total swap exchange rate in microusdtbuffered to 18 decimals per sat
    let totalSwapExchangeRate;
    if (totalSatsUsed.gt(0)) {
        totalSwapExchangeRate = bufferTo18Decimals(totalMicroUsdtSwapOutput, depositVaults[0].depositAsset.decimals).div(totalSatsUsed);
    } else {
        totalSwapExchangeRate = BigNumber.from(0);
    }

    //TODO: handle over maxLpOutputs case?

    // [7] return results
    return {
        totalSatsUsed,
        totalMicroUsdtSwapOutput,
        vaultIndexes,
        amountsInMicroUsdtToReserve,
        amountsInSatsToBePaid,
        btcPayoutLockingScripts,
        btcExchangeRates,
        totalSwapExchangeRate,
    };
}

export function calculateBestVaultsForUsdtOutput(depositVaults, microUsdtOutputAmount, maxLpOutputs = maxSwapOutputs) {
    // [0] validate inputs
    if (!Array.isArray(depositVaults) || depositVaults.length === 0 || microUsdtOutputAmount.lte(0)) {
        return null;
    }

    // [2] sort vaults based on exchange rate (high -> low)
    const sortedVaults = depositVaults?.sort((a, b) => b.btcExchangeRate.sub(a.btcExchangeRate).toNumber());

    // [3] setup variables to track results
    let totalSatsUsed = BigNumber.from(0);
    let remainingUsdtToAchieve = BigNumber.from(microUsdtOutputAmount);

    // [4] setup arrays to track results (each index corresponds to the same vault)
    let vaultIndexes = [];
    let amountsInMicroUsdtToReserve = [];
    let amountsInSatsToBePaid = [];
    let btcPayoutLockingScripts = [];
    let btcExchangeRates = [];
    let totalLpOutputsUsed = 0;

    // [5] iterate through the sorted vaults and calculate optimal combo
    for (let i = 0; i < sortedVaults.length; i++) {
        if (totalLpOutputsUsed >= maxLpOutputs || remainingUsdtToAchieve.lte(0)) break;

        const vault = sortedVaults[i];
        const microUsdtAvailable = BigNumber.from(vault.trueUnreservedBalance);

        // [1] calculate the amount of μUSDT to take from the current vault
        const microUsdtToTake = microUsdtAvailable.lt(remainingUsdtToAchieve) ? microUsdtAvailable : remainingUsdtToAchieve;
        const bufferedMicroUsdtToTake = bufferTo18Decimals(microUsdtToTake, vault.depositAsset.decimals);

        // [2] calculate the equivalent sats needed for the μUSDT taken
        const fixedNumberBufferedMicroUsdtToTake = FixedNumber.from(bufferedMicroUsdtToTake.toString());
        const fixedNumberExchangeRate = FixedNumber.from(vault.btcExchangeRate.toString());
        const satsNeeded = Math.floor(fixedNumberBufferedMicroUsdtToTake.divUnsafe(fixedNumberExchangeRate).toUnsafeFloat());

        // [3] update tracked amounts, but skip vaults with 0 sats or 0 micro USDT
        if (microUsdtToTake.gt(0) && satsNeeded > 0) {
            totalSatsUsed = totalSatsUsed.add(satsNeeded);
            remainingUsdtToAchieve = remainingUsdtToAchieve.sub(microUsdtToTake);

            // Store results
            vaultIndexes.push(vault.index);
            amountsInMicroUsdtToReserve.push(microUsdtToTake.toString());
            amountsInSatsToBePaid.push(satsNeeded);
            btcPayoutLockingScripts.push(vault.btcPayoutLockingScript);
            btcExchangeRates.push(vault.btcExchangeRate.toString());
            totalLpOutputsUsed++;
        }
    }

    // [6] calculate the total swap exchange rate in microusdtbuffered to 18 decimals per sat
    let totalSwapExchangeRate;
    if (totalSatsUsed.gt(0)) {
        totalSwapExchangeRate = bufferTo18Decimals(BigNumber.from(microUsdtOutputAmount), depositVaults[0].depositAsset.decimals).div(totalSatsUsed);
    } else {
        totalSwapExchangeRate = BigNumber.from(0);
    }

    //TODO: handle over maxLpOutputs case?

    // [7] return results
    return {
        totalSatsUsed,
        totalMicroUsdtOutput: microUsdtOutputAmount, // Note we use the input as total output since we're aiming for this target
        vaultIndexes,
        amountsInMicroUsdtToReserve,
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
