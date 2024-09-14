import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useStore } from '../../store';
import { useSwapReservations } from '../../hooks/contract/useSwapReservations';
import { useDepositVaults } from '../../hooks/contract/useDepositVaults';
import { useAccount } from 'wagmi';
import { formatUnits } from 'ethers/lib/utils';
import { getLiquidityProvider, getTokenBalance } from '../../utils/contractReadFunctions';
import { ERC20ABI } from '../../utils/constants';

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
    const updateExchangeRateInSmallestTokenUnitPerSat = useStore((state) => state.updateExchangeRateInSmallestTokenUnitPerSat);
    const updateExchangeRateInTokenPerBTC = useStore((state) => state.updateExchangeRateInTokenPerBTC);
    const updatePriceUSD = useStore((state) => state.updatePriceUSD);
    const updateConnectedUserBalanceRaw = useStore((state) => state.updateConnectedUserBalanceRaw);
    const updateConnectedUserBalanceFormatted = useStore((state) => state.updateConnectedUserBalanceFormatted);

    // set ethers provider
    useEffect(() => {
        // TODO: update this to pull contract data from all valid deposit assets
        if (selectedInputAsset?.contractRpcURL && window.ethereum) {
            setEthersRpcProvider(new ethers.providers.JsonRpcProvider(selectedInputAsset.contractRpcURL));
        }
    }, [selectedInputAsset.contractRpcURL, address, isConnected]);

    // fetch price data, user address, & selected asset balance
    useEffect(() => {
        const fetchPriceData = async () => {
            // TESTING VALUES - TODO: get this data from uniswap
            const btcPriceUSD = 59624.35;
            const usdtPriceUSD = 1;
            const btcToUsdtRate = btcPriceUSD / usdtPriceUSD;

            setBitcoinPriceUSD(btcPriceUSD);
            updateExchangeRateInTokenPerBTC('USDT', parseFloat(btcToUsdtRate.toFixed(2)));
        };
        fetchPriceData();

        const fetchSelectedAssetUserBalance = async (address) => {
            if (!address || !selectedInputAsset || !ethersRpcProvider) return;
            const balance = await getTokenBalance(ethersRpcProvider, selectedInputAsset.tokenAddress, address, ERC20ABI);

            updateConnectedUserBalanceRaw(selectedInputAsset.name, balance);
            const formattedBalance = formatUnits(balance, useStore.getState().validAssets[selectedInputAsset.name].decimals);
            updateConnectedUserBalanceFormatted(selectedInputAsset.name, formattedBalance.toString());
        };

        if (address) {
            setUserEthAddress(address);
            if (selectedInputAsset && window.ethereum) {
                fetchSelectedAssetUserBalance(address);
            }
        }

        // Set up an interval to fetch prices every 30 seconds
        const intervalId = setInterval(fetchPriceData && fetchSelectedAssetUserBalance, 30000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, [selectedInputAsset, address, isConnected]);

    // fetch deposit vaults
    const { allFetchedDepositVaults, userActiveDepositVaults, userCompletedDepositVaults, allFetchedSwapReservations, loading, error, refreshAllDepositData } = useDepositVaults();

    const value = {
        allDepositVaults: allFetchedDepositVaults,
        userActiveDepositVaults: userActiveDepositVaults,
        userCompletedDepositVaults: userCompletedDepositVaults,
        allSwapReservations: allFetchedSwapReservations,
        loading,
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
