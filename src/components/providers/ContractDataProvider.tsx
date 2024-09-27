import React, { createContext, useContext, ReactNode, useMemo, useEffect, useRef } from 'react';
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
}

const ContractDataContext = createContext<ContractDataContextType | undefined>(undefined);

export function ContractDataProvider({ children }: { children: ReactNode }) {
    const { address, isConnected } = useAccount();
    const ethersRpcProvider = useStore((state) => state.ethersRpcProvider);
    const setEthersRpcProvider = useStore((state) => state.setEthersRpcProvider);
    const setUserEthAddress = useStore((state) => state.setUserEthAddress);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const setBitcoinPriceUSD = useStore((state) => state.setBitcoinPriceUSD);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const updateExchangeRateInTokenPerBTC = useStore((state) => state.updateExchangeRateInTokenPerBTC);
    const updateConnectedUserBalanceRaw = useStore((state) => state.updateConnectedUserBalanceRaw);
    const updateConnectedUserBalanceFormatted = useStore((state) => state.updateConnectedUserBalanceFormatted);
    const setAreNewDepositsPaused = useStore((state) => state.setAreNewDepositsPaused);

    // Memoize selectedInputAsset to prevent unnecessary re-renders
    const memoizedSelectedInputAsset = useMemo(() => selectedInputAsset, [selectedInputAsset?.tokenAddress, selectedInputAsset?.contractRpcURL]);

    // Set ethers provider when selectedInputAsset changes
    useEffect(() => {
        if (memoizedSelectedInputAsset?.contractRpcURL && window.ethereum) {
            setEthersRpcProvider(new ethers.providers.JsonRpcProvider(memoizedSelectedInputAsset.contractRpcURL));
        }
    }, [memoizedSelectedInputAsset?.contractRpcURL, address, isConnected]);

    // Reference to store the interval ID
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch price data, user balance, and check for new deposits paused
    useEffect(() => {
        const fetchPriceData = async () => {
            const [btcPriceUSD, usdtPriceUSDBufferedTo8Decimals] = await getPrices();
            const usdtPriceUSD = formatUnits(usdtPriceUSDBufferedTo8Decimals, 8);
            const btcToUsdtRate = parseFloat(btcPriceUSD) / parseFloat(usdtPriceUSD);

            setBitcoinPriceUSD(parseFloat(btcPriceUSD));
            updateExchangeRateInTokenPerBTC('USDT', parseFloat(btcToUsdtRate.toFixed(2)));
        };

        const fetchSelectedAssetUserBalance = async () => {
            if (!address || !memoizedSelectedInputAsset || !ethersRpcProvider) return;

            const balance = await getTokenBalance(ethersRpcProvider, memoizedSelectedInputAsset.tokenAddress, address, ERC20ABI);
            updateConnectedUserBalanceRaw(memoizedSelectedInputAsset.name, balance);

            const formattedBalance = formatUnits(balance, useStore.getState().validAssets[memoizedSelectedInputAsset.name].decimals);
            updateConnectedUserBalanceFormatted(memoizedSelectedInputAsset.name, formattedBalance.toString());
        };

        const checkIfNewDepositsArePausedFromContract = async () => {
            if (!ethersRpcProvider || !memoizedSelectedInputAsset) return;

            const areNewDepositsPausedBool = await checkIfNewDepositsArePaused(ethersRpcProvider, riftExchangeABI.abi, memoizedSelectedInputAsset.riftExchangeContractAddress);
            setAreNewDepositsPaused(areNewDepositsPausedBool);
        };

        if (address) {
            setUserEthAddress(address);
            if (memoizedSelectedInputAsset && window.ethereum) {
                fetchSelectedAssetUserBalance();
            }
        }

        // Clear existing interval to prevent multiple intervals
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set up an interval to fetch data every 5 seconds
        intervalRef.current = setInterval(() => {
            fetchPriceData();
            fetchSelectedAssetUserBalance();
            checkIfNewDepositsArePausedFromContract();
        }, 5000);

        // Cleanup interval on unmount or dependency change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [
        memoizedSelectedInputAsset?.tokenAddress,
        address,
        isConnected,
        setBitcoinPriceUSD,
        updateExchangeRateInTokenPerBTC,
        setUserEthAddress,
        updateConnectedUserBalanceRaw,
        updateConnectedUserBalanceFormatted,
        setAreNewDepositsPaused,
        ethersRpcProvider,
        memoizedSelectedInputAsset,
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
