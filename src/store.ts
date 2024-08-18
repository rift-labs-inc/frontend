import { create } from 'zustand';
import { useEffect } from 'react';
import { DepositVault, ReserveLiquidityParams, SwapReservation } from './types';
import { BigNumber, ethers } from 'ethers';
import { USDT_Icon, ETH_Icon, ETH_Logo } from './components/other/SVGs';
import { erc20Abi } from 'viem';
import { ERC20ABI } from './utils/constants';
import { DepositAsset } from './types';

type Store = {
    validDepositAssets: Record<string, DepositAsset>;
    setValidDepositAssets: (assets: Record<string, DepositAsset>) => void;
    updateValidDepositAsset: (assetKey: string, updates: Partial<DepositAsset>) => void;
    updateExchangeRateInTokenPerBTC: (assetKey: string, newRate: number) => void;
    updateExchangeRateInSmallestTokenUnitPerSat: (assetKey: string, newRate: BigNumber) => void;
    updatePriceUSD: (assetKey: string, newPrice: number) => void;
    allDepositVaults: any;
    setAllDepositVaults: (allDepositVaults: DepositVault[]) => void;
    ethersProvider: ethers.providers.Provider | null;
    setEthersProvider: (provider: ethers.providers.Provider) => void;
    myActiveDepositVaults: DepositVault[];
    setMyActiveDepositVaults: (myActiveDepositVaults: DepositVault[]) => void;
    myCompletedDepositVaults: DepositVault[];
    setMyCompletedDepositVaults: (myCompletedDepositVaults: DepositVault[]) => void;
    bitcoinPriceUSD: number;
    setBitcoinPriceUSD: (price: number) => void;
    ethPriceUSD: number;
    setEthPriceUSD: (price: number) => void;
    wrappedEthPriceUSD: number;
    setWrappedEthPriceUSD: (price: number) => void;
    btcToEthExchangeRate: number;
    setBtcToEthExchangeRate: (rate: number) => void;
    swapFlowState: '0-not-started' | '1-reserve-liquidity' | '2-send-bitcoin' | '3-receive-eth' | '4-completed';
    setSwapFlowState: (
        state: '0-not-started' | '1-reserve-liquidity' | '2-send-bitcoin' | '3-receive-eth' | '4-completed',
    ) => void;
    btcInputSwapAmount: string;
    setBtcInputSwapAmount: (amount: string) => void;
    tokenOutputSwapAmount: string;
    setTokenOutputSwapAmount: (amount: string) => void;
    selectedVaultToManage: DepositVault | null;
    setSelectedVaultToManage: (vault: DepositVault | null) => void;
    allSwapReservations: SwapReservation[];
    setAllSwapReservations: (reservations: SwapReservation[]) => void;
    showManageDepositVaultsScreen: boolean;
    setShowManageDepositVaultsScreen: (show: boolean) => void;
    totalAvailableLiquidity: BigNumber;
    setTotalAvailableLiquidity: (liquidity: BigNumber) => void;
    totalExpiredReservations: number;
    setTotalExpiredReservations: (totalExpiredReservations: number) => void;
    lowestFeeReservationParams: ReserveLiquidityParams | null;
    setLowestFeeReservationParams: (reservation: ReserveLiquidityParams | null) => void;
    userEthAddress: string;
    setUserEthAddress: (address: string) => void;
    showManageReservationScreen: boolean;
    setShowManageReservationScreen: (show: boolean) => void;
    selectedDepositAsset: DepositAsset;
    setSelectedDepositAsset: (asset: DepositAsset) => void;
    selectedSwappingAsset: DepositAsset;
    setSelectedSwappingAsset: (asset: DepositAsset) => void;
};

export const useStore = create<Store>((set) => {
    const validDepositAssets: Record<string, DepositAsset> = {
        USDT: {
            name: 'USDT',
            tokenAddress: '0x4f9182DBcCf9C6518b1D67181F4E5a6d3D223C0E',
            decimals: 6,
            riftExchangeContractAddress: '0xa9B6eC059f312875de79705ac85c39B0Aa2fFc20',
            contractChainID: 11155111,
            contractRpcURL: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
            abi: ERC20ABI,
            icon_svg: USDT_Icon,
            bg_color: '#125641',
            border_color: '#26A17B',
            dark_bg_color: '#08221A',
            light_text_color: '#327661',
            exchangeRateInTokenPerBTC: null,
            exchangeRateInSmallestTokenUnitPerSat: null, // always 18 decimals
            priceUSD: null,
        },
        WETH: {
            name: 'WETH',
            tokenAddress: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
            decimals: 18,
            riftExchangeContractAddress: '0xe6167f469152293b045838d69F9687a7Ee30aaf3',
            contractChainID: 11155111,
            contractRpcURL: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
            abi: ERC20ABI,
            icon_svg: ETH_Logo,
            bg_color: '#2E40B7',
            border_color: '#627EEA',
            dark_bg_color: '#161A33',
            light_text_color: '#5b63a5',
            exchangeRateInTokenPerBTC: null,
            exchangeRateInSmallestTokenUnitPerSat: null, // always 18 decimals
            priceUSD: null,
        },
    };

    return {
        validDepositAssets,
        setValidDepositAssets: (assets) => set({ validDepositAssets: assets }),
        updateValidDepositAsset: (assetKey, updates) =>
            set((state) => ({
                validDepositAssets: {
                    ...state.validDepositAssets,
                    [assetKey]: { ...state.validDepositAssets[assetKey], ...updates },
                },
            })),
        updateExchangeRateInTokenPerBTC: (assetKey, newRate) =>
            set((state) => ({
                validDepositAssets: {
                    ...state.validDepositAssets,
                    [assetKey]: { ...state.validDepositAssets[assetKey], exchangeRateInTokenPerBTC: newRate },
                },
            })),
        updateExchangeRateInSmallestTokenUnitPerSat: (assetKey, newRate) =>
            set((state) => ({
                validDepositAssets: {
                    ...state.validDepositAssets,
                    [assetKey]: { ...state.validDepositAssets[assetKey], exchangeRateInSmallestTokenUnitPerSat: newRate },
                },
            })),
        updatePriceUSD: (assetKey, newPrice) =>
            set((state) => ({
                validDepositAssets: {
                    ...state.validDepositAssets,
                    [assetKey]: { ...state.validDepositAssets[assetKey], priceUSD: newPrice },
                },
            })),
        allDepositVaults: {},
        setAllDepositVaults: (allDepositVaults) => set({ allDepositVaults }),
        ethersProvider: null,
        setEthersProvider: (ethersProvider) => set({ ethersProvider }),
        myActiveDepositVaults: [],
        setMyActiveDepositVaults: (myActiveDepositVaults) => set({ myActiveDepositVaults }),
        myCompletedDepositVaults: [],
        setMyCompletedDepositVaults: (myCompletedDepositVaults) => set({ myCompletedDepositVaults }),
        bitcoinPriceUSD: 0,
        setBitcoinPriceUSD: (bitcoinPriceUSD) => set({ bitcoinPriceUSD }),
        ethPriceUSD: 0,
        setEthPriceUSD: (ethPriceUSD) => set({ ethPriceUSD }),
        wrappedEthPriceUSD: 0,
        setWrappedEthPriceUSD: (wrappedEthPriceUSD) => set({ wrappedEthPriceUSD }),
        btcToEthExchangeRate: 0,
        setBtcToEthExchangeRate: (btcToEthExchangeRate) => set({ btcToEthExchangeRate }),
        swapFlowState: '0-not-started',
        setSwapFlowState: (swapFlowState) => set({ swapFlowState }),
        btcInputSwapAmount: '',
        setBtcInputSwapAmount: (btcInputSwapAmount) => set({ btcInputSwapAmount }),
        tokenOutputSwapAmount: '',
        setTokenOutputSwapAmount: (tokenOutputSwapAmount) => set({ tokenOutputSwapAmount }),
        selectedVaultToManage: null,
        setSelectedVaultToManage: (selectedVaultToManage) => set({ selectedVaultToManage }),
        allSwapReservations: [],
        setAllSwapReservations: (allSwapReservations) => set({ allSwapReservations }),
        showManageDepositVaultsScreen: false,
        setShowManageDepositVaultsScreen: (showManageDepositVaultsScreen) => set({ showManageDepositVaultsScreen }),
        totalAvailableLiquidity: BigNumber.from(0),
        setTotalAvailableLiquidity: (totalAvailableLiquidity) => set({ totalAvailableLiquidity }),
        totalExpiredReservations: 0,
        setTotalExpiredReservations: (totalExpiredReservations) => set({ totalExpiredReservations }),
        lowestFeeReservationParams: null,
        setLowestFeeReservationParams: (lowestFeeReservationParams) => set({ lowestFeeReservationParams }),
        userEthAddress: '',
        setUserEthAddress: (userEthAddress) => set({ userEthAddress }),
        showManageReservationScreen: false,
        setShowManageReservationScreen: (showManageReservationScreen) => set({ showManageReservationScreen }),
        selectedDepositAsset: validDepositAssets.USDT,
        setSelectedDepositAsset: (selectedDepositAsset) => set({ selectedDepositAsset }),
        selectedSwappingAsset: validDepositAssets.USDT,
        setSelectedSwappingAsset: (selectedSwappingAsset) => set({ selectedSwappingAsset }),
    };
});
