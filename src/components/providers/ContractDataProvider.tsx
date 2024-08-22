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
    userDepositVaults: any;
    allSwapReservations: any;
    loading: boolean;
    error: any;
    refreshUserDepositData: () => Promise<void>;
}

const ContractDataContext = createContext<ContractDataContextType | undefined>(undefined);

export function ContractDataProvider({ children }: { children: ReactNode }) {
    const { address, isConnected } = useAccount();
    const ethersRpcProvider = useStore((state) => state.ethersRpcProvider);
    const setEthersRpcProvider = useStore((state) => state.setEthersRpcProvider);
    const setUserEthAddress = useStore((state) => state.setUserEthAddress);
    const selectedAsset = useStore((state) => state.selectedAsset);
    const setBitcoinPriceUSD = useStore((state) => state.setBitcoinPriceUSD);
    const updateExchangeRateInSmallestTokenUnitPerSat = useStore((state) => state.updateExchangeRateInSmallestTokenUnitPerSat);
    const updateExchangeRateInTokenPerBTC = useStore((state) => state.updateExchangeRateInTokenPerBTC);
    const updatePriceUSD = useStore((state) => state.updatePriceUSD);
    const updateConnectedUserBalanceRaw = useStore((state) => state.updateConnectedUserBalanceRaw);
    const updateConnectedUserBalanceFormatted = useStore((state) => state.updateConnectedUserBalanceFormatted);
    const updateTotalAvailableLiquidity = useStore((state) => state.updateTotalAvailableLiquidity);

    // set ethers provider
    useEffect(() => {
        // TODO: update this to pull contract data from all valid deposit assets
        if (selectedAsset?.contractRpcURL && window.ethereum) {
            setEthersRpcProvider(new ethers.providers.JsonRpcProvider(selectedAsset.contractRpcURL));
        }
    }, [selectedAsset.contractRpcURL, address, isConnected]);

    // fetch price data, user address, & selected asset balance
    useEffect(() => {
        const fetchPriceData = async () => {
            // TESTING VALUES - TODO: get this data from uniswap
            console.log('fetching price data...');
            const btcPriceUSD = 59072.43;
            const usdtPriceUSD = 1;
            const btcToUsdtRate = btcPriceUSD / usdtPriceUSD;

            setBitcoinPriceUSD(btcPriceUSD);
            updatePriceUSD('USDT', usdtPriceUSD);
            updateExchangeRateInTokenPerBTC('USDT', parseFloat(btcToUsdtRate.toFixed(2)));
        };
        fetchPriceData();

        const fetchSelectedAssetUserBalance = async (address) => {
            const balance = await getTokenBalance(ethersRpcProvider, selectedAsset.tokenAddress, address, ERC20ABI);

            updateConnectedUserBalanceRaw(selectedAsset.name, balance);
            const formattedBalance = formatUnits(balance, useStore.getState().validAssets[selectedAsset.name].decimals);
            console.log('formattedBalance:', formattedBalance.toString());
            updateConnectedUserBalanceFormatted(selectedAsset.name, formattedBalance.toString());
        };

        if (address) {
            setUserEthAddress(address);
            if (selectedAsset && window.ethereum) {
                fetchSelectedAssetUserBalance(address);
            }
        }

        // Set up an interval to fetch prices every 30 seconds
        const intervalId = setInterval(fetchPriceData, 30000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, [selectedAsset, address]);

    // fetch deposit vaults
    const {
        allFetchedDepositVaults,
        userFetchedDepositVaults,
        allFetchedSwapReservations,
        loading,
        error,
        refreshUserDepositData,
    } = useDepositVaults();

    const value = {
        allDepositVaults: allFetchedDepositVaults,
        userDepositVaults: userFetchedDepositVaults,
        allSwapReservations: allFetchedSwapReservations,
        loading,
        error,
        refreshUserDepositData,
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
