import { HDKey } from '@scure/bip32';
import BigNumber from 'bignumber.js';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { ec as EC } from 'elliptic';
import { MEMPOOL_HOST } from './constants';

export interface Fees {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
}

interface BitcoinWallet {
    address: string;
    unlockScript: string;
    publicKey: string;
    hdKey: HDKey;
}

export interface LiquidityProvider {
    amount: string;
    btcExchangeRate: string;
    lockingScriptHex: string;
}

export async function getRiftSwapFees(numLpOutputs) {
    // dummy wallet for estimating swap fees with multiple lp outputs
    const mnemonic = 'ladder crystal wool wheat fossil large unable firm vicious index index outer';
    let wallet = buildWalletFromMnemonic(mnemonic);

    return await estimateRiftPaymentTransactionFees(numLpOutputs, wallet, MEMPOOL_HOST);
}

export function buildWalletFromMnemonic(mnemonic: string): BitcoinWallet {
    const network = bitcoin.networks.bitcoin;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = HDKey.fromMasterSeed(seed);
    const child = root.derive("m/84'/0'/0'/0/0");
    const publicKey = Buffer.from(child.publicKey);
    const { address } = bitcoin.payments.p2wpkh({ pubkey: publicKey, network });
    const unlockScript = bitcoin.payments.p2wpkh({ pubkey: publicKey, network }).output!.toString('hex');
    return {
        address,
        unlockScript,
        publicKey: publicKey.toString('hex'),
        hdKey: child,
    };
}

export async function estimateRiftPaymentTransactionFees(liquidityProviderCount: number, wallet: BitcoinWallet, mempoolApiHostname: string) {
    let dummy_lp = {
        amount: '1000',
        btcExchangeRate: '1',
        lockingScriptHex: '001463dff5f8da08ca226ba01f59722c62ad9b9b3eaa',
    };
    let liquidityProviders = Array.from({ length: liquidityProviderCount }, () => dummy_lp);
    let arbitrary_bytes_32_hex = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    let { txSerialized } = await buildRiftPaymentTransaction(
        arbitrary_bytes_32_hex,
        liquidityProviders,
        arbitrary_bytes_32_hex,
        0,
        wallet,
        liquidityProviders.reduce((sum, lp) => sum + weiToSatoshi(lp.amount, lp.btcExchangeRate), 0) + 1,
        0,
    );

    const txn = bitcoin.Transaction.fromHex(txSerialized);
    // standard byte size for nonsegwit, minimized byte weight applied for segwit
    let virtualSize = txn.virtualSize();

    let feeRateQuote = await getBtcFeeRates(mempoolApiHostname);

    let amount = liquidityProviders.reduce((sum, lp) => sum + weiToSatoshi(lp.amount, lp.btcExchangeRate), 0);

    if (!feeRateQuote) {
        return {
            fastFeeAmount: feeRateQuote?.fastestFee ? feeRateQuote.fastestFee * virtualSize : 550,
        };
    }      
}

async function buildRiftPaymentTransaction(
    orderNonceHex: string,
    liquidityProviders: LiquidityProvider[],
    inTxidHex: string,
    inTxvout: number,
    wallet: BitcoinWallet,
    vinSats: number,
    feeSats: number,
): Promise<{
    txSerializedNoSegwit: string;
    txid: string;
    txSerialized: string;
}> {
    try {
        const network = bitcoin.networks.bitcoin;

        const totalLpSumBtc = liquidityProviders.reduce((sum, lp) => sum + weiToSatoshi(lp.amount, lp.btcExchangeRate), 0);

        const lpOutputs = liquidityProviders.map((lp) => {
            return {
                value: weiToSatoshi(lp.amount, lp.btcExchangeRate),
                script: Buffer.from(normalizeHexStr(lp.lockingScriptHex), 'hex'),
            };
        });

        if (vinSats - totalLpSumBtc - feeSats < 0) {
            throw new Error('Insufficient funds');
        }

        const inscription = {
            value: 0,
            script: Buffer.concat([Buffer.from('6a20', 'hex'), Buffer.from(normalizeHexStr(orderNonceHex), 'hex')]),
        };

        const psbt = new bitcoin.Psbt({ network });
        psbt.addInput({
            hash: normalizeHexStr(inTxidHex),
            index: inTxvout,
            sequence: 0xfffffffd,
            witnessUtxo: {
                script: bitcoin.payments.p2wpkh({
                    pubkey: Buffer.from(wallet.publicKey, 'hex'),
                    network,
                }).output!,
                value: vinSats,
            },
        });
        [...lpOutputs, inscription].forEach((output) => {
            psbt.addOutput(output);
        });
        psbt.signInput(0, {
            publicKey: Buffer.from(wallet.publicKey, 'hex'),
            sign: (hash: Buffer) => Buffer.from(wallet.hdKey.sign(hash)),
        });

        psbt.finalizeAllInputs();

        const tx = psbt.extractTransaction();
        const txid = tx.getId();
        const txHex = normalizeHexStr(tx.toBuffer().toString('hex'));
        return {
            txSerializedNoSegwit: reserializeNoSegwit(txHex),
            txid,
            txSerialized: txHex,
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
}

function reserializeNoSegwit(serializedTxn: string): string {
    const txn = bitcoin.Transaction.fromHex(serializedTxn);
    const txnWithoutWitness = new bitcoin.Transaction();
    txnWithoutWitness.version = txn.version;
    txn.ins.forEach((input) => {
        txnWithoutWitness.addInput(input.hash, input.index, input.sequence, input.script);
    });
    txn.outs.forEach((output) => {
        txnWithoutWitness.addOutput(output.script, output.value);
    });
    txnWithoutWitness.locktime = txn.locktime;
    return txnWithoutWitness.toHex();
}

function weiToSatoshi(weiAmount: string, weiSatsExchangeRate: string): number {
    BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
    return new BigNumber(weiAmount).div(weiSatsExchangeRate).integerValue().toNumber();
}

function normalizeHexStr(hex: string): string {
    return hex.startsWith('0x') ? hex.slice(2) : hex;
}

let cachedFees: Fees | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 10000;

export async function getBtcFeeRates(hostname: string): Promise<Fees> {
    const currentTime = Date.now();

    // If we have cached data and it's less than 10 seconds old, return it
    if (cachedFees && currentTime - lastFetchTime < CACHE_DURATION) {
        return cachedFees;
    }

    const endpoint = `${hostname}/api/v1/fees/recommended`;
    try {
        
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Fees = await response.json();

        // Update the cache and last fetch time
        cachedFees = data;
        lastFetchTime = currentTime;

        return data;
    } catch (error) {
        console.error('Error fetching Fees:', error);
    }
}
