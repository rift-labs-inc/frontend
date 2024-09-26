import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useStore } from '../../store';
import { useSwapReservations } from '../../hooks/contract/useSwapReservations';
import { useDepositVaults } from '../../hooks/contract/useDepositVaults';
import { useAccount } from 'wagmi';
import { formatUnits } from 'ethers/lib/utils';
import { checkIfNewDepositsArePaused, getLiquidityProvider, getTokenBalance } from '../../utils/contractReadFunctions';
import { ERC20ABI } from '../../utils/constants';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { getLatestAnswerFromChainlinkUsdtPriceOracle, getWBTCPrice } from '../../utils/fetchUniswapPrices';

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
    const updateExchangeRateInSmallestTokenUnitPerSat = useStore((state) => state.updateExchangeRateInSmallestTokenUnitPerSat);
    const updateExchangeRateInTokenPerBTC = useStore((state) => state.updateExchangeRateInTokenPerBTC);
    const updatePriceUSD = useStore((state) => state.updatePriceUSD);
    const updateConnectedUserBalanceRaw = useStore((state) => state.updateConnectedUserBalanceRaw);
    const updateConnectedUserBalanceFormatted = useStore((state) => state.updateConnectedUserBalanceFormatted);
    const setAreNewDepositsPaused = useStore((state) => state.setAreNewDepositsPaused);
    const setIsGasFeeTooHigh = useStore((state) => state.setIsGasFeeTooHigh);

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
            const usdtPriceUSDBufferedTo8Decimals = await getLatestAnswerFromChainlinkUsdtPriceOracle();
            const usdtPriceUSD = formatUnits(usdtPriceUSDBufferedTo8Decimals, 8);
            const btcPriceUSD = await getWBTCPrice();
            const btcToUsdtRate = parseFloat(btcPriceUSD) / parseFloat(usdtPriceUSD);

            setBitcoinPriceUSD(parseFloat(btcPriceUSD));
            updateExchangeRateInTokenPerBTC('USDT', parseFloat(btcToUsdtRate.toFixed(2)));
        };

        const fetchSelectedAssetUserBalance = async () => {
            if (!address || !selectedInputAsset || !ethersRpcProvider) return;
            const balance = await getTokenBalance(ethersRpcProvider, selectedInputAsset.tokenAddress, address, ERC20ABI);
            updateConnectedUserBalanceRaw(selectedInputAsset.name, balance);
            const formattedBalance = formatUnits(balance, useStore.getState().validAssets[selectedInputAsset.name].decimals);
            updateConnectedUserBalanceFormatted(selectedInputAsset.name, formattedBalance.toString());
        };

        const checkIfNewDepositsArePausedFromContract = async () => {
            if (!ethersRpcProvider || !selectedInputAsset) return;
            const areNewDepositsPausedBool = await checkIfNewDepositsArePaused(ethersRpcProvider, riftExchangeABI.abi, selectedInputAsset.riftExchangeContractAddress);
            setAreNewDepositsPaused(areNewDepositsPausedBool);
        };

        const checkIfGasFeesAreTooHigh = async () => {
            if (!ethersRpcProvider) return;
            const lastestBlock = await ethersRpcProvider.getBlock('latest');
            const gasPrice = lastestBlock.baseFeePerGas;
            const gasPriceInGwei = formatUnits(gasPrice, 'gwei');
            console.log('godly gasPriceInGwei:', gasPriceInGwei);
            if (parseFloat(gasPriceInGwei) > 12) {
                console.log('GODLY GAS FEE TOO HIGH');
                setIsGasFeeTooHigh(true);
            } else {
                setIsGasFeeTooHigh(false);
            }
        };

        if (address) {
            setUserEthAddress(address);
            if (selectedInputAsset && window.ethereum) {
                fetchSelectedAssetUserBalance();
            }
        }

        // set up an interval to fetch every 5 seconds
        const intervalId = setInterval(() => {
            fetchPriceData();
            fetchSelectedAssetUserBalance();
            checkIfNewDepositsArePausedFromContract();
            checkIfGasFeesAreTooHigh();
        }, 5000);

        // setup another interval to fetch price everysecond
        const priceIntervalId = setInterval(() => {
            if (bitcoinPriceUSD === 0) {
                // set loading to true
                fetchPriceData();
            } else {
                // set loading to false
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
            clearInterval(priceIntervalId);
        };
    }, [selectedInputAsset, address, isConnected]);

    // fetch deposit vaults
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
