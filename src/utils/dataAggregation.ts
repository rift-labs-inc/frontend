import { ethers, BigNumberish } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { LiqudityProvider } from '../types';
import { DepositVault } from '../types';

// CONTRACT FUNCTIONS

async function getDepositVaultsLength(
    provider: ethers.providers.Provider,
    abi: ethers.ContractInterface,
    rift_exchange_contract: string,
): Promise<number> {
    const contract = new ethers.Contract(rift_exchange_contract, abi, provider);

    const length = await contract.getDepositVaultsLength();
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

async function getDepositVaults(
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

function decodeDepositVaults(data: string): DepositVault[] {
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

export { getDepositVaults, getDepositVaultsLength };
