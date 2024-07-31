import { ethers, BigNumberish, BigNumber } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { LiqudityProvider, ReservationState, SwapReservation } from '../types';
import { DepositVault } from '../types';

// CONTRACT FUNCTIONS

export async function getDepositVaultsLength(
    provider: ethers.providers.Provider,
    abi: ethers.ContractInterface,
    rift_exchange_contract: string,
): Promise<number> {
    const contract = new ethers.Contract(rift_exchange_contract, abi, provider);

    const length = await contract.getDepositVaultsLength();
    return length.toNumber();
}

export async function getDepositVaultByIndex(
    provider: ethers.providers.Provider,
    abi: ethers.ContractInterface,
    rift_exchange_contract: string,
    index: number,
): Promise<DepositVault | null> {
    const contract = new ethers.Contract(rift_exchange_contract, abi, provider);

    try {
        const depositVault = await contract.getDepositVault(index);
        console.log(`Raw deposit vault data for index ${index}:`, depositVault);

        if (!Array.isArray(depositVault) || depositVault.length < 4) {
            console.warn(`Deposit vault at index ${index} returned invalid data`);
            return null;
        }

        return {
            initialBalance: BigNumber.from(depositVault[0]),
            unreservedBalance: BigNumber.from(depositVault[1]),
            btcExchangeRate: BigNumber.from(depositVault[2]),
            btcPayoutLockingScript: depositVault[3],
            index: index,
        };
    } catch (error) {
        console.error(`Error fetching deposit vault at index ${index}:`, error);
        return null;
    }
}

export async function getSwapReservationsLength(
    provider: ethers.providers.Provider,
    abi: ethers.ContractInterface,
    rift_exchange_contract: string,
): Promise<number> {
    const contract = new ethers.Contract(rift_exchange_contract, abi, provider);

    const length = await contract.getReservationLength();
    return length.toNumber();
}

export async function getLiquidityProvider(
    provider: ethers.providers.Provider,
    abi: ethers.ContractInterface,
    riftExchangeContract: string,
    liquidityProviderAddress: string,
): Promise<LiqudityProvider> {
    const contract = new ethers.Contract(riftExchangeContract, abi, provider);
    return await contract.getLiquidityProvider(liquidityProviderAddress);
}

// MULTICALL

export async function getDepositVaults(
    provider: ethers.providers.Provider,
    bytecode: string,
    abi: ethers.ContractInterface,
    rift_exchange_contract: string,
    indexesArray: number[],
): Promise<DepositVault[]> {
    const factory = new ethers.ContractFactory(abi, bytecode);
    const deployTransaction = factory.getDeployTransaction(indexesArray, rift_exchange_contract);

    const retryEthCall = async <T>(fn: () => Promise<T>): Promise<T> => {
        return fn();
    };
    const result = await retryEthCall(() => provider.call({ data: deployTransaction.data as string }));

    const decodedResults = decodeDepositVaults(result);
    return decodedResults;
}

export function decodeDepositVaults(data: string): DepositVault[] {
    const abiCoder = new ethers.utils.AbiCoder();

    // decode the outer array
    const decodedArray = abiCoder.decode(['bytes[]'], data)[0];

    // decode each element in the array
    const depositVaults: DepositVault[] = decodedArray.map((item: string) => {
        const [initialBalance, unreservedBalance, btcExchangeRate, btcPayoutLockingScript] = abiCoder.decode(
            ['uint256', 'uint192', 'uint64', 'bytes22'],
            item,
        );

        return {
            initialBalance,
            unreservedBalance,
            btcExchangeRate,
            btcPayoutLockingScript: ethers.utils.hexlify(btcPayoutLockingScript),
        };
    });

    return depositVaults;
}

export async function getSwapReservations(
    provider: ethers.providers.Provider,
    bytecode: string,
    abi: ethers.ContractInterface,
    rift_exchange_contract: string,
    indexesArray: number[],
): Promise<SwapReservation[]> {
    console.log('getSwapReservations called with indexes:', indexesArray);
    const factory = new ethers.ContractFactory(abi, bytecode);
    const deployTransaction = factory.getDeployTransaction(indexesArray, rift_exchange_contract);

    const retryEthCall = async <T>(fn: () => Promise<T>): Promise<T> => {
        return fn();
    };
    const result = await retryEthCall(() => provider.call({ data: deployTransaction.data as string }));

    const decodedResults = decodeSwapReservations(result);
    return decodedResults;
}
export function decodeSwapReservations(data: string): SwapReservation[] {
    const abiCoder = new ethers.utils.AbiCoder();
    console.log('Raw data to decode:', data);

    try {
        // decode the outer array
        const decodedArray = abiCoder.decode(['bytes[]'], data)[0];
        console.log('Decoded outer array:', decodedArray);

        if (!Array.isArray(decodedArray) || decodedArray.length === 0) {
            console.warn('Decoded array is empty or not an array');
            return [];
        }

        // decode each element in the array
        const swapReservations: SwapReservation[] = decodedArray
            .map((item: string, index: number) => {
                try {
                    console.log(`Decoding item ${index}:`, item);

                    const [
                        confirmationBlockHeight,
                        reservationTimestamp,
                        unlockTimestamp,
                        state,
                        ethPayoutAddress,
                        lpReservationHash,
                        nonce,
                        totalSwapAmount,
                        prepaidFeeAmount,
                        vaultIndexes,
                        amountsToReserve,
                    ] = abiCoder.decode(
                        [
                            'uint32',
                            'uint32',
                            'uint32',
                            'uint8',
                            'address',
                            'bytes32',
                            'uint256',
                            'uint256',
                            'uint256',
                            'uint16[]',
                            'uint256[]',
                        ],
                        item,
                    );

                    const reservation: SwapReservation = {
                        confirmationBlockHeight,
                        reservationTimestamp,
                        unlockTimestamp,
                        state: state as ReservationState,
                        ethPayoutAddress,
                        lpReservationHash: ethers.utils.hexlify(lpReservationHash),
                        nonce: nonce.toString(),
                        totalSwapAmount,
                        prepaidFeeAmount,
                        vaultIndexes,
                        amountsToReserve,
                    };

                    console.log(`Successfully decoded item ${index}:`, reservation);
                    return reservation;
                } catch (error) {
                    console.error(`Error decoding item ${index}:`, error);
                    return null;
                }
            })
            .filter((reservation): reservation is SwapReservation => reservation !== null);

        console.log('Final decoded reservations:', swapReservations);
        return swapReservations;
    } catch (error) {
        console.error('Error in decodeSwapReservations:', error);
        return [];
    }
}
