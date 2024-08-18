import React, { createContext, useContext, ReactNode } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useStore } from '../../store';
import { useSwapReservations } from '../../hooks/contract/useSwapReservations';
import { useDepositVaults } from '../../hooks/contract/useDepositVaults';
import { useAccount } from 'wagmi';

interface ContractDataContextType {
    allDepositVaults: any;
    allSwapReservations: any;
    loading: boolean;
    error: any;
}

const ContractDataContext = createContext<ContractDataContextType | undefined>(undefined);

export function ContractDataProvider({ children }: { children: ReactNode }) {
    const ethersProvider = useStore((state) => state.ethersProvider);
    const setEthersProvider = useStore((state) => state.setEthersProvider);
    const { address, isConnected } = useAccount();
    const setUserEthAddress = useStore((state) => state.setUserEthAddress);
    const selectedDepositAsset = useStore((state) => state.selectedDepositAsset); // default USDT right now

    React.useEffect(() => {
        setEthersProvider(new ethers.providers.JsonRpcProvider(selectedDepositAsset.contractRpcURL)); // TODO: update this to pull contract data from all valid deposit assets
    }, []);

    React.useEffect(() => {
        if (address) {
            setUserEthAddress(address);
            console.log('address:', address);
        }
    }, [address]);

    const setBitcoinPriceUSD = useStore((state) => state.setBitcoinPriceUSD);
    const updateExchangeRateInSmallestTokenUnitPerSat = useStore((state) => state.updateExchangeRateInSmallestTokenUnitPerSat);
    const updateExchangeRateInTokenPerBTC = useStore((state) => state.updateExchangeRateInTokenPerBTC);
    const updatePriceUSD = useStore((state) => state.updatePriceUSD);

    // fetch price data - TODO: get this data from uniswap also TODO: make this so it fetches the price of all valid deposit assets, and updates the exchange rates on the asset itself
    React.useEffect(() => {
        const fetchPriceData = async () => {
            try {
                const response = await fetch(
                    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd',
                );
                const data = await response.json();
                if (data.bitcoin && data.bitcoin.usd) {
                    setBitcoinPriceUSD(data.bitcoin.usd); // Bitcoin price in USD
                }
                if (data.tether && data.tether.usd) {
                    // USDT price in USD (should be close to 1)
                    console.log('USDT price:', data.tether.usd);
                    try {
                        updatePriceUSD('USDT', data.tether.usd);
                    } catch (error) {
                        console.error('Failed to update USDT price:', error);
                    }
                }

                // Calculate BTC to USDT exchange rate (in USDT buffered to 18 decimals per sat)
                if (data.bitcoin && data.bitcoin.usd && data.tether && data.tether.usd) {
                    const btcToUsdtRate = data.bitcoin.usd / data.tether.usd;
                    console.log('BTC to USDT exchange rate:', btcToUsdtRate);
                    console.log('BEFORE UPDATE', useStore.getState().validDepositAssets['USDT'].exchangeRateInTokenPerBTC);
                    updateExchangeRateInTokenPerBTC('USDT', parseFloat(btcToUsdtRate.toFixed(2)));
                    console.log('AFTER UPDATE', useStore.getState().validDepositAssets['USDT'].exchangeRateInTokenPerBTC);
                    // updateExchangeRate('USDT', BigNumber.from(btcToUsdtRate));
                    // console.log(
                    //     'USDT exchange rate in store:',
                    //     BigNumber.from(useStore.getState().validDepositAssets['USDT'].exchangeRate).toNumber(),
                    // );
                }
            } catch (error) {
                console.error('Failed to fetch prices:', error);
            }
        };

        fetchPriceData();

        // Set up an interval to fetch prices every 60 seconds
        const intervalId = setInterval(fetchPriceData, 60000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    // fetch deposit vaults
    const {
        allDepositVaults,
        userDepositVaults,
        loading: vaultsLoading,
        error: vaultsError,
        refreshUserDepositData,
    } = useDepositVaults(ethersProvider, selectedDepositAsset.riftExchangeContractAddress); // TODO: update this to pull contract data from all valid deposit assets

    // fetch swap reservations
    const {
        allSwapReservations,
        loading: reservationsLoading,
        error: reservationsError,
    } = useSwapReservations(ethersProvider, selectedDepositAsset.riftExchangeContractAddress); // TODO: update this to pull contract data from all valid deposit assets

    const loading = vaultsLoading || reservationsLoading || vaultsLoading;
    const error = vaultsError || reservationsError || vaultsError;

    const value = {
        allDepositVaults,
        allSwapReservations,
        loading,
        error,
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
