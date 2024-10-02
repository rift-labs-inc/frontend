import { SwapStatus, CreateRiftSwapArgs, LiquidityProvider } from './types';

const DB_NAME = 'RiftDatabase';
const DB_VERSION = 1;
export const WALLET_STORE = 'wallets';
export const SWAP_STORE = 'swaps';

interface Wallet {
    address: string;
    privateKey: string;
    mnemonic: string;
    associatedOrderNonceHex: string;
}

export interface Swap extends CreateRiftSwapArgs {
    status: SwapStatus;
    id: string;
    paymentTxid: string;
}

async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore(WALLET_STORE, { keyPath: 'associatedOrderNonceHex' });
            db.createObjectStore(SWAP_STORE, { keyPath: 'id' });
        };
    });
}

export async function getFromStore<T>(storeName: string, key?: IDBValidKey): Promise<T> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = key ? store.get(key) : store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export async function setInStore(storeName: string, value: any): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const keyPath = store.keyPath;
        let request;

        if (typeof keyPath === 'string' && keyPath in value) {
            // If the store uses in-line keys and the value contains the key
            request = store.put(value);
        } else if (keyPath === null && 'id' in value) {
            // If the store uses out-of-line keys and the value has an 'id' property
            request = store.put(value, value.id);
        } else {
            reject(new Error('Invalid value for storage: missing key or id'));
            return;
        }

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function deleteFromStore(storeName: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function getWalletFromOrderNonce(orderNonceHex: string): Promise<Wallet | undefined> {
    return getFromStore<Wallet>(WALLET_STORE, orderNonceHex);
}

export async function getWallets(): Promise<Wallet[]> {
    return getFromStore<Wallet[]>(WALLET_STORE);
}

export async function addWallet(wallet: Wallet): Promise<void> {
    await setInStore(WALLET_STORE, wallet);
}

export async function getSwaps(): Promise<Swap[]> {
    return getFromStore<Swap[]>(SWAP_STORE);
}

export async function addSwap(args: CreateRiftSwapArgs): Promise<void> {
    const newSwap: Swap = {
        ...args,
        status: SwapStatus.WAITING_FOR_FUNDING_TRANSACTION,
        id: args.orderNonceHex,
        paymentTxid: '',
    };
    await setInStore(SWAP_STORE, newSwap);
}

export async function updateSwapStatus(id: string, status: SwapStatus, paymentTxid: string): Promise<void> {
    const swap = await getFromStore<Swap>(SWAP_STORE, id);
    if (swap) {
        swap.status = status;
        swap.paymentTxid = paymentTxid;
        await setInStore(SWAP_STORE, swap);
    }
}

export async function clearSwaps(): Promise<void> {
    await deleteFromStore(SWAP_STORE);
}
