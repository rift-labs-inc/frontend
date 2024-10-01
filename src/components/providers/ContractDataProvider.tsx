import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useStore } from '../../store';
import { useDepositVaults } from '../../hooks/contract/useDepositVaults';
import { useAccount } from 'wagmi';
import { formatUnits } from 'ethers/lib/utils';
import { checkIfNewDepositsArePaused, getTokenBalance } from '../../utils/contractReadFunctions';
import { ERC20ABI } from '../../utils/constants';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { getPrices } from '../../utils/fetchUniswapPrices';

interface ContractDataContextType {
    allDepositVaults: any;
    userActiveDepositVaults: any;
    userCompletedDepositVaults: any;
    allSwapReservations: any;
    loading: boolean;
    error: any;
    refreshAllDepositData: () => Promise<void>;
    refreshConnectedUserBalance: () => Promise<void>;
}

const ContractDataContext = createContext<ContractDataContextType | undefined>(undefined);

export function ContractDataProvider({ children }: { children: ReactNode }) {
    const { address, isConnected } = useAccount();
    const ethersRpcProvider = useStore.getState().ethersRpcProvider;
    const setEthersRpcProvider = useStore((state) => state.setEthersRpcProvider);
    const setUserEthAddress = useStore((state) => state.setUserEthAddress);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const setBitcoinPriceUSD = useStore((state) => state.setBitcoinPriceUSD);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const updateExchangeRateInTokenPerBTC = useStore((state) => state.updateExchangeRateInTokenPerBTC);
    const updateConnectedUserBalanceRaw = useStore((state) => state.updateConnectedUserBalanceRaw);
    const updateConnectedUserBalanceFormatted = useStore((state) => state.updateConnectedUserBalanceFormatted);
    const setAreNewDepositsPaused = useStore((state) => state.setAreNewDepositsPaused);

    // Set ethers provider when selectedInputAsset changes
    useEffect(() => {
        if ((selectedInputAsset?.contractRpcURL && window.ethereum) || !ethersRpcProvider) {
            const provider = new ethers.providers.StaticJsonRpcProvider(selectedInputAsset.contractRpcURL, { chainId: selectedInputAsset.chainDetails.id, name: selectedInputAsset.chainDetails.name });
            if (!provider) return;
            console.log('new ethers provider set', provider);
            setEthersRpcProvider(provider);
        }
    }, [selectedInputAsset?.contractRpcURL, address, isConnected]);

    // Reference to store the interval ID
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSelectedAssetUserBalance = async () => {
        if (!address || !selectedInputAsset || !ethersRpcProvider) return;

        const balance = await getTokenBalance(ethersRpcProvider, selectedInputAsset.tokenAddress, address, ERC20ABI);
        updateConnectedUserBalanceRaw(selectedInputAsset.name, balance);

        const formattedBalance = formatUnits(balance, useStore.getState().validAssets[selectedInputAsset.name].decimals);
        updateConnectedUserBalanceFormatted(selectedInputAsset.name, formattedBalance.toString());
    };

    const refreshConnectedUserBalance = async () => {
        await fetchSelectedAssetUserBalance();
    };

    // Fetch price data, user balance, and check for new deposits paused
    useEffect(() => {
        const fetchPriceData = async () => {
            try {
                const [btcPriceUSD, usdtPriceUSDBufferedTo8Decimals] = await getPrices();

                const usdtPriceUSD = formatUnits(usdtPriceUSDBufferedTo8Decimals, 8);
                const btcToUsdtRate = parseFloat(btcPriceUSD) / parseFloat(usdtPriceUSD);

                setBitcoinPriceUSD(parseFloat(btcPriceUSD));
                updateExchangeRateInTokenPerBTC('USDT', parseFloat(btcToUsdtRate.toFixed(2)));
            } catch (e) {
                console.error(e);
                return;
            }
        };

        const checkIfNewDepositsArePausedFromContract = async () => {
            if (!ethersRpcProvider || !selectedInputAsset) return;

            const areNewDepositsPausedBool = await checkIfNewDepositsArePaused(ethersRpcProvider, riftExchangeABI.abi, selectedInputAsset.riftExchangeContractAddress);
            setAreNewDepositsPaused(areNewDepositsPausedBool);
        };

        if (address) {
            setUserEthAddress(address);
            if (selectedInputAsset && window.ethereum) {
                fetchSelectedAssetUserBalance();
            }
        }

        fetchPriceData();
        fetchSelectedAssetUserBalance();
        checkIfNewDepositsArePausedFromContract();

        // Set up an interval to fetch data every 5 seconds
        if (!intervalRef.current) {
            console.log('bruh setting interval');
            intervalRef.current = setInterval(() => {
                console.log('bruh interval!!!!!!');
                fetchPriceData();
                fetchSelectedAssetUserBalance();
                checkIfNewDepositsArePausedFromContract();
            }, 5000);
        }
    }, [
        selectedInputAsset?.tokenAddress,
        address,
        isConnected,
        setBitcoinPriceUSD,
        updateExchangeRateInTokenPerBTC,
        setUserEthAddress,
        updateConnectedUserBalanceRaw,
        updateConnectedUserBalanceFormatted,
        setAreNewDepositsPaused,
        ethersRpcProvider,
        selectedInputAsset,
    ]);

    // Fetch deposit vaults
    const { allFetchedDepositVaults, userActiveDepositVaults, userCompletedDepositVaults, allFetchedSwapReservations, loading, error, refreshAllDepositData } = useDepositVaults();

    const isLoading = loading || bitcoinPriceUSD === 0;

    const value = {
        allDepositVaults: allFetchedDepositVaults,
        userActiveDepositVaults: userActiveDepositVaults,
        userCompletedDepositVaults: userCompletedDepositVaults,
        allSwapReservations: allFetchedSwapReservations,
        loading: isLoading,
        error,
        refreshAllDepositData,
        refreshConnectedUserBalance,
    };

    return <ContractDataContext.Provider value={value}>{children}</ContractDataContext.Provider>;
}

export function useContractData() {
    const context = useContext(ContractDataContext);
    if (context === undefined) {
        throw new Error('useContractData must be used within a ContractDataProvider');
    }
    return context;
}
