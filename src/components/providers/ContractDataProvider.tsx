import React, { createContext, useContext, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useStore } from '../../store';
import { useSwapReservations } from '../../hooks/contract/useSwapReservations';
import { contractRpcURL, riftExchangeContractAddress } from '../../utils/constants';
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

    React.useEffect(() => {
        setEthersProvider(new ethers.providers.JsonRpcProvider(contractRpcURL));
    }, []);

    React.useEffect(() => {
        if (address) {
            setUserEthAddress(address);
            console.log('address:', address);
        }
    }, [address]);

    const setAvailableAssets = useStore((state) => state.setAvailableAssets);
    const [depositVaultsLength, setDepositVaultsLength] = React.useState(null);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const setBitcoinPriceUSD = useStore((state) => state.setBitcoinPriceUSD);
    const ethPriceUSD = useStore((state) => state.ethPriceUSD);
    const setEthPriceUSD = useStore((state) => state.setEthPriceUSD);
    const wrappedEthPriceUSD = useStore((state) => state.wrappedEthPriceUSD);
    const setWrappedEthPriceUSD = useStore((state) => state.setWrappedEthPriceUSD);
    const btcToEthExchangeRate = useStore((state) => state.btcToEthExchangeRate);
    const setBtcToEthExchangeRate = useStore((state) => state.setBtcToEthExchangeRate);

    // fetch price data - TODO: get this data from uniswap
    React.useEffect(() => {
        const fetchPriceData = async () => {
            try {
                const response = await fetch(
                    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,weth&vs_currencies=usd,eth',
                );
                const data = await response.json();
                if (data.bitcoin && data.bitcoin.usd) {
                    setBitcoinPriceUSD(data.bitcoin.usd); // Bitcoin price in USD
                }
                if (data.ethereum && data.ethereum.usd) {
                    setEthPriceUSD(data.ethereum.usd); // Ethereum price in USD
                }
                if (data.weth && data.weth.usd) {
                    setWrappedEthPriceUSD(data.weth.usd); // Wrapped Ethereum price in USD
                }
                if (data.bitcoin && data.bitcoin.eth) {
                    setBtcToEthExchangeRate(data.bitcoin.eth); // exchange rate of Bitcoin in Ethereum
                    console.log('data.bitcoin.eth:', data.bitcoin.eth);
                }
            } catch (error) {
                console.error('Failed to fetch prices and exchange rate:', error);
            }
        };

        fetchPriceData();
    }, []);

    // fetch deposit vaults
    const {
        allDepositVaults,
        userDepositVaults,
        loading: vaultsLoading,
        error: vaultsError,
        refreshUserDepositData,
    } = useDepositVaults(ethersProvider, riftExchangeContractAddress);

    // fetch swap reservations
    const {
        allSwapReservations,
        loading: reservationsLoading,
        error: reservationsError,
    } = useSwapReservations(ethersProvider, riftExchangeContractAddress);

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
