import { ethers, BigNumberish } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';

async function getDepositVaultsLength(contractAddress: string, provider: ethers.providers.Provider): Promise<number> {
    const abi = ['function getDepositVaultsLength() public view returns (uint256)'];

    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
        const length = await contract.getDepositVaultsLength();
        return length.toNumber();
    } catch (error) {
        console.error('Error calling getDepositVaultsLength:', error);
        throw error;
    }
}

interface DepositVault {
    initialBalance: BigNumberish;
    unreservedBalance: BigNumberish;
    btcExchangeRate: BigNumberish;
    btcPayoutLockingScript: string;
}

async function getDepositVaults(
    provider: ethers.providers.Provider,
    bytecode: string,
    abi: ethers.ContractInterface,
    rift_exchange_contract: string,
) {
    const factory = new ethers.ContractFactory(abi, bytecode);

    const length = await getDepositVaultsLength(rift_exchange_contract, provider);

    // TODO: Implement pagination
    const deployTransaction = factory.getDeployTransaction(0, length, rift_exchange_contract);

    const retryEthCall = async <T>(fn: () => Promise<T>): Promise<T> => {
        // Implement retry logic here
        return fn();
    };

    const result = await retryEthCall(() => provider.call({ data: deployTransaction.data as string }));

    const iface = new ethers.utils.Interface(abi as JsonFragment[]);

    console.log('result', result);
    // const decodedResult = iface.decodeFunctionResult('constructor', result) as [ethers.BigNumber, string][];
}

export { getDepositVaults, getDepositVaultsLength };
