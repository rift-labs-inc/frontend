import { ethers, BigNumberish, BigNumber } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { LiqudityProvider, ReservationState, SwapReservation } from '../types';
import { DepositVault, ValidAsset } from '../types';
import { useStore } from '../store';

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
        // console.log(`Raw deposit vault data for index ${index}:`, depositVault);

        if (!Array.isArray(depositVault) || depositVault.length < 4) {
            console.warn(`Deposit vault at index ${index} returned invalid data`);
            return null;
        }

        return {
            initialBalance: BigNumber.from(depositVault[0]),
            unreservedBalanceFromContract: BigNumber.from(depositVault[1]),
            btcExchangeRate: BigNumber.from(depositVault[2]),
            btcPayoutLockingScript: depositVault[3],
            depositAsset: useStore.getState().validAssets['USDT'], // TODO: get this from the contract you are reading from
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

export async function getTokenBalance(
    provider: ethers.providers.Provider | ethers.Signer,
    tokenAddress: string,
    accountAddress: string,
    abi: ethers.ContractInterface,
): Promise<BigNumber> {
    const contract = new ethers.Contract(tokenAddress, abi, provider);

    try {
        const balance: BigNumber = await contract.balanceOf(accountAddress);
        return balance;
    } catch (error) {
        console.error(`Error fetching token balance for address ${accountAddress}:`, error);
        throw error;
    }
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
        const [
            initialBalance,
            unreservedBalanceFromContract,
            withdrawnAmount,
            btcExchangeRate,
            btcPayoutLockingScript,
        ] = abiCoder.decode(['uint256', 'uint256', 'uint256', 'uint64', 'bytes22'], item);

        return {
            initialBalance,
            unreservedBalanceFromContract,
            withdrawnAmount,
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
    const factory = new ethers.ContractFactory(abi, bytecode);
    const deployTransaction = factory.getDeployTransaction(indexesArray, rift_exchange_contract);

    const retryEthCall = async <T>(fn: () => Promise<T>): Promise<T> => {
        return fn();
    };

    const result = await retryEthCall(() => provider.call({ data: deployTransaction.data as string }));
    try {
        const decodedResults = decodeSwapReservations(result);
        return decodedResults;
    } catch (err) {
        console.error('Error in getSwapReservations:', err);
        return [];
    }
}

function decodeSwapReservations(data: string): SwapReservation[] {
    const abiCoder = new ethers.utils.AbiCoder();
    const decodedArray = abiCoder.decode(['bytes[]'], data)[0];

    const swapReservations: SwapReservation[] = decodedArray.map((item: any) => {
        const decodedResults = abiCoder.decode(
            [
                `tuple(
            uint32 confirmationBlockHeight,
            uint32 reservationTimestamp,
            uint32 unlockTimestamp,
            uint8 state,
            address ethPayoutAddress,
            bytes32 lpReservationHash,
            bytes32 nonce,
            uint256 totalSwapAmount,
            int256 prepaidFeeAmount,
            uint256[] vaultIndexes,
            uint192[] amountsToReserve
        )`,
            ],
            item,
        );

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
        ] = decodedResults[0];

        return {
            confirmationBlockHeight,
            reservationTimestamp,
            unlockTimestamp,
            state: state as ReservationState,
            ethPayoutAddress,
            lpReservationHash,
            nonce: nonce,
            totalSwapAmount: totalSwapAmount,
            prepaidFeeAmount: prepaidFeeAmount,
            vaultIndexes: vaultIndexes,
            amountsToReserve: amountsToReserve,
        };
    });

    return swapReservations;
}
