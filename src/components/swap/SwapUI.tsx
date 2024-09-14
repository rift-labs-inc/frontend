import { Tabs, TabList, Tooltip, TabPanels, Tab, Button, Flex, Text, useColorModeValue, Box, Spacer, Input, Spinner, Skeleton } from '@chakra-ui/react';
import useWindowSize from '../../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../utils/colors';
import { useStore } from '../../store';
import { BTCSVG, ETHSVG, InfoSVG } from '../other/SVGs';
import { BigNumber } from 'ethers';
import { formatUnits, parseEther, parseUnits } from 'ethers/lib/utils';
import {
    btcToSats,
    bufferTo18Decimals,
    calculateBestVaultsForBitcoinInput,
    calculateBestVaultsForUsdtOutput,
    ethToWei,
    formatAmountToString,
    formatBtcExchangeRate,
    unBufferFrom18Decimals,
    weiToEth,
} from '../../utils/dappHelper';
import { ProxyWalletLiquidityProvider, ReservationState, ReserveLiquidityParams, SwapReservation } from '../../types';
import {
    bitcoin_bg_color,
    bitcoin_dark_bg_color,
    bitcoinDecimals,
    maxSwapOutputs,
    opaqueBackgroundColor,
    protocolFeeDenominator,
    protocolFeePercentage,
    maxSwapLimitInMicroUSDT,
} from '../../utils/constants';
import { AssetTag } from '../other/AssetTag';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import WebAssetTag from '../other/WebAssetTag';
import { getSwapReservations } from '../../utils/contractReadFunctions';
import { useContractData } from '../providers/ContractDataProvider';
import { parse } from 'path';
import { toastError, toastInfo, toastLoad, toastSuccess } from '../../hooks/toast';
import { getRiftSwapFees } from '../../utils/btcFeeCalc';

export const SwapUI = () => {
    const { isMobile } = useWindowSize();
    const router = useRouter();
    const fontSize = isMobile ? '20px' : '20px';
    const btcInputSwapAmount = useStore((state) => state.btcInputSwapAmount);
    const setBtcInputSwapAmount = useStore((state) => state.setBtcInputSwapAmount);
    const usdtOutputSwapAmount = useStore((state) => state.usdtOutputSwapAmount);
    const setUsdtOutputSwapAmount = useStore((state) => state.setUsdtOutputSwapAmount);
    const allDepositVaults = useStore((state) => state.allDepositVaults);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);
    const setLowestFeeReservationParams = useStore((state) => state.setLowestFeeReservationParams);
    const userEthAddress = useStore((state) => state.userEthAddress);
    const [isLiquidityExceeded, setIsLiquidityExceeded] = useState(false);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const setSelectedInputAsset = useStore((state) => state.setSelectedInputAsset);
    const usdtPriceUSD = useStore.getState().validAssets[selectedInputAsset.name].priceUSD;
    const [availableLiquidity, setAvailableLiquidity] = useState(BigNumber.from(0));
    const [maxBtcInputExceeded, setMaxBtcInputExceeded] = useState('');
    const [availableLiquidityInUSDT, setAvailableLiquidityInUSDT] = useState('');
    const [usdtExchangeRatePerBTC, setUsdtExchangeRatePerBTC] = useState(0);
    const depositMode = useStore((state) => state.depositMode);
    const setDepositMode = useStore((state) => state.setDepositMode);
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const setSwapFlowState = useStore((state) => state.setSwapFlowState);
    const depositFlowState = useStore((state) => state.depositFlowState);
    const setDepositFlowState = useStore((state) => state.setDepositFlowState);
    const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);
    const setCurrencyModalTitle = useStore((state) => state.setCurrencyModalTitle);
    const [overpayingBtcInput, setOverpayingBtcInput] = useState(false);
    const [isBelowMinUsdtOutput, setIsBelowMinUsdtOutput] = useState(false);
    const [isBelowMinBtcInput, setIsBelowMinBtcInput] = useState(false);
    const [minBtcInputAmount, setMinBtcInputAmount] = useState('');
    const { refreshAllDepositData, loading } = useContractData();
    // const loading = true;
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;
    const setUsdtDepositAmount = useStore((state) => state.setUsdtDepositAmount);
    const setBtcOutputAmount = useStore((state) => state.setBtcOutputAmount);
    const validAssets = useStore((state) => state.validAssets);
    const [proxyWalletSwapFastFee, setProxyWalletSwapFastFee] = useState(0);
    const reservationFeeAmountMicroUsdt = useStore((state) => state.reservationFeeAmountMicroUsdt);
    const setReservationFeeAmountMicroUsdt = useStore((state) => state.setReservationFeeAmountMicroUsdt);
    const [dots, setDots] = useState('');
    const [isNoLiquidityAvailable, setIsNoLiquidityAvailable] = useState(false);
    const [isAboveMaxSwapLimitBtcInput, setIsAboveMaxSwapLimitBtcInput] = useState(false);
    const [isAboveMaxSwapLimitUsdtOutput, setIsAboveMaxSwapLimitUsdtOutput] = useState(false);
    const [fastestProxyWalletFeeInSats, setFastestProxyWalletFeeInSats] = useState(500);

    // TODO: populate exchagne rate if btc input and usdt output are already set and you press the back button
    // useEffect(() => {
    //     if (btcInputSwapAmount && usdtOutputSwapAmount) {
    //         setUsdtExchangeRatePerBTC(parseFloat(parseFloat(formatBtcExchangeRate(lowestFeeReservationParams?.totalSwapExchangeRate, selectedInputAsset.decimals)).toFixed(2)));
    //     }
    // }, []);

    // if usdtswapoutput exists, recalate it
    useEffect(() => {
        if (usdtOutputSwapAmount) {
            console.log('HELP:', usdtOutputSwapAmount);
            handleUsdtOutputChange(null, usdtOutputSwapAmount);
        }
    }, []);

    // loading dots effect
    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setDots((prev) => (prev === '...' ? '' : prev + '.'));
            }, 350);
            return () => clearInterval(interval);
        }
    }, [loading]);

    // set available liquidity
    useEffect(() => {
        if (selectedInputAsset && validAssets[selectedInputAsset.name]) {
            const totalAvailableLiquidity = validAssets[selectedInputAsset.name]?.totalAvailableLiquidity;
            setAvailableLiquidity(totalAvailableLiquidity ?? BigNumber.from(0));
            setAvailableLiquidityInUSDT(Number(formatUnits(totalAvailableLiquidity, selectedInputAsset.decimals)).toFixed(2).toString());
        }
    }, [selectedInputAsset, validAssets]);

    // function to continuously call refreshAllDepositData
    useEffect(() => {
        const continuouslyRefreshUserDepositData = () => {
            if (isConnected && address) {
                refreshAllDepositData();
            }
        };

        if (isConnected && address) {
            continuouslyRefreshUserDepositData();
            const intervalId = setInterval(continuouslyRefreshUserDepositData, 2000);
            return () => clearInterval(intervalId);
        }
    }, [isConnected, address]);

    // function to continuously calculate the minimum BTC input
    useEffect(() => {
        const continuouslyCalculateMinReservation = () => {
            if (allDepositVaults) {
                calcuateMinimumReservationSatsInputAmount();
            }
        };

        if (allDepositVaults) {
            continuouslyCalculateMinReservation();
            const intervalId = setInterval(continuouslyCalculateMinReservation, 5000);
            return () => clearInterval(intervalId);
        }
    }, [allDepositVaults]);

    const checkAmountBelowMinUsdtOutput = useCallback(
        (amount: string | null): boolean => {
            if (!amount || amount == '.') return false;

            const isBelowMin = Number(amount) < 1;
            setIsBelowMinUsdtOutput(isBelowMin);
            return isBelowMin;
        },
        [selectedInputAsset.decimals],
    );

    useEffect(() => {
        const continuouslyCalculateProxyWalletFee = () => {
            getRiftSwapFees(1).then((fees) => {
                console.log('HELPPP fastest fee in sats:', fees.fastFeeAmount);
                setFastestProxyWalletFeeInSats(fees.fastFeeAmount);
            });
        };

        continuouslyCalculateProxyWalletFee();
        const intervalId = setInterval(continuouslyCalculateProxyWalletFee, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // calculate ideal reservation for bitcoin input
    const calculateIdealReservationBitcoinInput = async (amountBtcSwapInput) => {
        // ensure there is liquidity available
        setOverpayingBtcInput(false);

        if (allDepositVaults.length === 0 || availableLiquidity.lt(BigNumber.from(1000000))) {
            setIsNoLiquidityAvailable(true);
        }

        // [0] ensure deposit vaults exist and swap input is valid (convert to sats)
        if (!amountBtcSwapInput || amountBtcSwapInput == '.' || allDepositVaults.length === 0) {
            setIsAboveMaxSwapLimitBtcInput(false);
            setUsdtOutputSwapAmount('');
            setUsdtDepositAmount('');
            setLowestFeeReservationParams(null);
            return;
        } else {
            setIsNoLiquidityAvailable(false);
        }
        const amountSatsSwapInput = parseUnits(amountBtcSwapInput, bitcoinDecimals);

        // [1] calculate INITIAL best vault combo given input value
        let idealReservationDetails = calculateBestVaultsForBitcoinInput(allDepositVaults, amountSatsSwapInput);
        console.log('INITIAL idealReservationDetails:', idealReservationDetails);

        // [2] ensure there is a valid initial reservation output
        if (!idealReservationDetails?.totalMicroUsdtSwapOutput) {
            setUsdtOutputSwapAmount('');
            setUsdtDepositAmount('');
            setLowestFeeReservationParams(null);
            return;
        }

        // [3] calculate the proxy wallet fee using number of LP outputs, then subtract fee from the "input"
        const proxyWalletSwapFeeInSats = fastestProxyWalletFeeInSats;
        const newAmountSatsSwapInput = amountSatsSwapInput.sub(BigNumber.from(proxyWalletSwapFeeInSats));

        console.log('typed sats input amount', amountSatsSwapInput.toString());
        console.log('-proxy wallet fee in sats', proxyWalletSwapFeeInSats);
        console.log('new amountSatsSwapInput:', newAmountSatsSwapInput.toString());

        // if new amount sats swap input is less than the typed amount + fees, set overpaying flag
        if (amountSatsSwapInput.sub(BigNumber.from(proxyWalletSwapFeeInSats)).gt(idealReservationDetails.totalSatsUsed)) {
            //  check if output is above max swap limit
            console.log('ABOVE MAX SWAP LIMIT', idealReservationDetails?.totalMicroUsdtSwapOutput);
            if (idealReservationDetails.totalMicroUsdtSwapOutput.gt(BigNumber.from(maxSwapLimitInMicroUSDT))) {
                console.log('ABOVE MAX SWAP LIMIT', idealReservationDetails?.totalMicroUsdtSwapOutput);
                setIsAboveMaxSwapLimitBtcInput(true);
                setUsdtOutputSwapAmount('');
                setUsdtDepositAmount('');
                setUsdtExchangeRatePerBTC(null);
                setLowestFeeReservationParams(null);
                return;
            }
            setOverpayingBtcInput(true);
            setMaxBtcInputExceeded(formatUnits(idealReservationDetails.totalSatsUsed.add(proxyWalletSwapFastFee), bitcoinDecimals).toString());
            setUsdtDepositAmount('');
            setUsdtOutputSwapAmount('');
            setUsdtExchangeRatePerBTC(null);
            setLowestFeeReservationParams(null);
            return;
        } else {
            setOverpayingBtcInput(false);
        }

        // check if sats to spend is less than 0 (meaning fees are too high)
        console.log('newAmountSatsSwapInput:', newAmountSatsSwapInput.toString());
        if (newAmountSatsSwapInput.lt(BigNumber.from(1))) {
            console.log('NEGATIVE SATS below min btc input');
            setIsBelowMinBtcInput(true);
            setUsdtOutputSwapAmount('');
            setUsdtDepositAmount('');
            setUsdtExchangeRatePerBTC(null);
            setLowestFeeReservationParams(null);
            return;
        }

        // [4] re-run vault combo calculation with new input amount
        const newIdealReservationDetails = calculateBestVaultsForBitcoinInput(allDepositVaults, newAmountSatsSwapInput);
        console.log('NEW idealReservationDetails:', newIdealReservationDetails);

        // check if output is above max swap limit
        console.log('newIdealReservationDetails?.totalMicroUsdtSwapOutput:', newIdealReservationDetails?.totalMicroUsdtSwapOutput);
        if (newIdealReservationDetails.totalMicroUsdtSwapOutput.gt(BigNumber.from(maxSwapLimitInMicroUSDT))) {
            console.log('ABOVE MAX SWAP LIMIT', newIdealReservationDetails?.totalMicroUsdtSwapOutput);
            setIsAboveMaxSwapLimitBtcInput(true);
            setUsdtOutputSwapAmount('');
            setUsdtDepositAmount('');
            setUsdtExchangeRatePerBTC(null);
            setLowestFeeReservationParams(null);
            return;
        } else {
            setIsAboveMaxSwapLimitBtcInput(false);
        }

        // check if output is less than 1 usdt
        if (parseFloat(formatUnits(newIdealReservationDetails.totalMicroUsdtSwapOutput, selectedInputAsset.decimals)) < 1) {
            console.log('BELOW MIN 1 USDT OUTPUT', newIdealReservationDetails?.totalMicroUsdtSwapOutput);
            setIsBelowMinBtcInput(true);
            setUsdtOutputSwapAmount('');
            setUsdtDepositAmount('');
            setUsdtExchangeRatePerBTC(null);
            setLowestFeeReservationParams(null);
            return;
        } else {
            setIsBelowMinBtcInput(false);
        }

        // set new exchange rate & usdt output based on new ideal reservation
        if (newIdealReservationDetails) {
            // account for the prover, releaser, and protocol fees
            const protocolFee = BigNumber.from(idealReservationDetails.totalMicroUsdtSwapOutput).mul(protocolFeePercentage).div(protocolFeeDenominator);
            console.log('PROTOCOL FEE:', protocolFee.toString());
            const reservationFee = selectedInputAsset.releaserFee.add(selectedInputAsset.proverFee).add(protocolFee);
            console.log('TOTAL reservation fee:', reservationFee.toString());
            setReservationFeeAmountMicroUsdt(reservationFee.toString());

            setUsdtOutputSwapAmount(
                formatAmountToString(selectedInputAsset, formatUnits(newIdealReservationDetails?.totalMicroUsdtSwapOutput ?? BigNumber.from(0), selectedInputAsset.decimals)),
            );
            setUsdtDepositAmount(
                formatAmountToString(selectedInputAsset, formatUnits(newIdealReservationDetails?.totalMicroUsdtSwapOutput ?? BigNumber.from(0), selectedInputAsset.decimals)),
            );

            setUsdtExchangeRatePerBTC(parseFloat(parseFloat(formatBtcExchangeRate(newIdealReservationDetails?.totalSwapExchangeRate, selectedInputAsset.decimals)).toFixed(2)));
            const reserveLiquidityParams: ReserveLiquidityParams = {
                swapAmountInSats: BigNumber.from(newIdealReservationDetails?.totalSatsUsed).toNumber(),
                vaultIndexesToReserve: newIdealReservationDetails.vaultIndexes,
                amountsInMicroUsdtToReserve: newIdealReservationDetails.amountsInMicroUsdtToReserve,
                amountsInSatsToBePaid: newIdealReservationDetails.amountsInSatsToBePaid,
                btcPayoutLockingScripts: newIdealReservationDetails.btcPayoutLockingScripts,
                btcExchangeRates: newIdealReservationDetails.btcExchangeRates,
                ethPayoutAddress: '', // this is set when user inputs their eth payout address
                totalSatsInputInlcudingProxyFee: amountSatsSwapInput,
                expiredSwapReservationIndexes: [], // TODO: calculate later
            };

            setLowestFeeReservationParams(reserveLiquidityParams);
        } else {
            setUsdtOutputSwapAmount('');
            setUsdtDepositAmount('');
            setUsdtExchangeRatePerBTC(null);
            setLowestFeeReservationParams(null);
        }
    };

    // calculate minimum sats input amount for 1 usdt output
    const calcuateMinimumReservationSatsInputAmount = async () => {
        const minReservation = calculateBestVaultsForUsdtOutput(allDepositVaults, parseUnits('1', selectedInputAsset.decimals)); // min 1 usdt output
        if (!minReservation) return;
        const minProxyFee = fastestProxyWalletFeeInSats;
        if (!minProxyFee) return;
        const updatedMinReservationSatsInputAmount = minReservation.totalSatsUsed.add(BigNumber.from(minProxyFee));
        const minReservationBtcInputAmount = formatUnits(updatedMinReservationSatsInputAmount.add(BigNumber.from(1)), bitcoinDecimals).toString();
        setMinBtcInputAmount(minReservationBtcInputAmount);
        return minReservationBtcInputAmount;
    };

    // calculate ideal reservation for usdt output
    const calculateIdealReservationUsdtOutput = async (amountUsdtSwapOutput) => {
        // ensure there is liquidity available
        if (allDepositVaults.length === 0 || availableLiquidity.lt(BigNumber.from(1000000))) {
            setIsNoLiquidityAvailable(true);
        }

        const amountBufferedTo6Decimals = Number(amountUsdtSwapOutput).toFixed(selectedInputAsset.decimals);
        const microUsdtAmount = parseUnits(amountBufferedTo6Decimals, selectedInputAsset.decimals);
        const isExceeded = BigNumber.from(microUsdtAmount).gt(validAssets[selectedInputAsset.name]?.totalAvailableLiquidity);
        setIsLiquidityExceeded(isExceeded);

        if (isExceeded) {
            setBtcInputSwapAmount('');
            setBtcOutputAmount('');
            setLowestFeeReservationParams(null);
        }

        // [0] ensure deposit vaults exist and swap input is valid (convert to sats)
        if (!amountUsdtSwapOutput || amountUsdtSwapOutput == '.' || allDepositVaults.length === 0) {
            setBtcInputSwapAmount('');
            setBtcOutputAmount('');
            setLowestFeeReservationParams(null);
            return;
        } else {
            setIsNoLiquidityAvailable(false);
            setIsAboveMaxSwapLimitBtcInput(false);
        }
        const amountMicroUsdtSwapOutput = parseUnits(amountUsdtSwapOutput, selectedInputAsset.decimals);

        // [1] calculate INITIAL best vault combo given input value
        let idealReservationDetails = calculateBestVaultsForUsdtOutput(allDepositVaults, amountMicroUsdtSwapOutput);
        console.log('INITIAL idealReservationDetails:', idealReservationDetails);

        // // [2] ensure there is a valid initial reservation output
        if (!idealReservationDetails?.totalSatsUsed) {
            setBtcInputSwapAmount('');
            setBtcOutputAmount('');
            setLowestFeeReservationParams(null);
            return;
        }

        // [3] calculate the proxy wallet fee using number of LP outputs, then subtract fee from the "input"
        const proxyWalletSwapFeeInSats = fastestProxyWalletFeeInSats;
        const newAmountSatsSwapInput = idealReservationDetails.totalSatsUsed.add(BigNumber.from(proxyWalletSwapFeeInSats));
        console.log('og calculated sats input amount', idealReservationDetails.totalSatsUsed.toString());
        console.log('+ proxy wallet fee in sats', proxyWalletSwapFeeInSats);
        console.log('new amountSatsSwapInput:', newAmountSatsSwapInput.toString());

        // set new exchange rate & usdt output based on new ideal reservation
        if (idealReservationDetails) {
            // account for the prover, releaser, and protocol fees
            const protocolFee = BigNumber.from(idealReservationDetails.totalMicroUsdtOutput).mul(protocolFeePercentage).div(protocolFeeDenominator);
            console.log('PROTOCOL FEE:', protocolFee.toString());
            const reservationFee = selectedInputAsset.releaserFee.add(selectedInputAsset.proverFee).add(protocolFee);
            console.log('TOTAL reservation fee:', reservationFee.toString());
            setReservationFeeAmountMicroUsdt(reservationFee.toString());

            setBtcInputSwapAmount(formatUnits(newAmountSatsSwapInput, bitcoinDecimals).toString());
            setBtcOutputAmount(formatUnits(newAmountSatsSwapInput, bitcoinDecimals).toString());
            setUsdtExchangeRatePerBTC(parseFloat(parseFloat(formatBtcExchangeRate(idealReservationDetails?.totalSwapExchangeRate, selectedInputAsset.decimals)).toFixed(2)));
            const reserveLiquidityParams: ReserveLiquidityParams = {
                swapAmountInSats: BigNumber.from(idealReservationDetails?.totalSatsUsed).toNumber(),
                vaultIndexesToReserve: idealReservationDetails.vaultIndexes,
                amountsInMicroUsdtToReserve: idealReservationDetails.amountsInMicroUsdtToReserve,
                amountsInSatsToBePaid: idealReservationDetails.amountsInSatsToBePaid,
                btcPayoutLockingScripts: idealReservationDetails.btcPayoutLockingScripts,
                btcExchangeRates: idealReservationDetails.btcExchangeRates,
                ethPayoutAddress: '', // this is set when user inputs their eth payout address
                totalSatsInputInlcudingProxyFee: newAmountSatsSwapInput,
                expiredSwapReservationIndexes: [], // TODO: calculate later
            };

            setLowestFeeReservationParams(reserveLiquidityParams);
            return reserveLiquidityParams;
        } else {
            setBtcInputSwapAmount('');
            setBtcOutputAmount('');
            setLowestFeeReservationParams(null);
        }
    };

    // ----------------- BITCOIN INPUT ----------------- //

    const handleBtcInputChange = (e, amount = null) => {
        const btcValue = amount !== null ? amount : e.target.value;
        setIsBelowMinUsdtOutput(false);
        setIsLiquidityExceeded(false);
        setIsAboveMaxSwapLimitUsdtOutput(false);
        if (parseFloat(btcValue) === 0 || !btcValue) {
            setUsdtExchangeRatePerBTC(null);
        }
        if (validateBtcInput(btcValue)) {
            setBtcInputSwapAmount(btcValue);
            setBtcOutputAmount(btcValue);
            calculateIdealReservationBitcoinInput(btcValue);
        }
    };

    const validateBtcInput = (value) => {
        if (value === '') return true; // Allow empty input for backspacing
        if (value === '.') return false; // Prevent leading decimal point

        // match only digits and an optional decimal point with up to 8 digits after it
        const regex = /^\d*\.?\d{0,8}$/;
        if (!regex.test(value)) return null;

        // split by decimal point
        const parts = value.split('.');

        // ensure no more than one leading zero before the decimal point, but allow a single "0."
        if (parts[0].length > 1 && parts[0][0] === '0') {
            parts[0] = parts[0].replace(/^0+/, '') || '0'; // Strip leading zeros, but allow '0'
        }

        // limit to 8 digits after the decimal point
        if (parts.length > 1 && parts[1].length > bitcoinDecimals) {
            parts[1] = parts[1].slice(0, bitcoinDecimals);
        }

        // return the validated value, allowing a trailing decimal if needed
        return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0] + (value.endsWith('.') ? '.' : '');
    };

    // ----------------- USDT OUTPUT ----------------- //

    const handleUsdtOutputChange = async (e, amount = null) => {
        const usdtValue = amount !== null ? amount : e.target.value;
        setIsBelowMinBtcInput(false);
        if (parseFloat(usdtValue) === 0 || !usdtValue) {
            setUsdtExchangeRatePerBTC(null);
            setIsAboveMaxSwapLimitUsdtOutput(false);
        }

        if (validateUsdtOutputChange(usdtValue)) {
            // check if output is above max swap limit
            if (parseFloat(usdtValue) > parseFloat(formatUnits(maxSwapLimitInMicroUSDT, selectedInputAsset.decimals))) {
                setIsAboveMaxSwapLimitUsdtOutput(true);
                setBtcInputSwapAmount('');
                setBtcOutputAmount('');
                setUsdtOutputSwapAmount(usdtValue);
                setUsdtDepositAmount(usdtValue);
                setLowestFeeReservationParams(null);
                return;
            } else {
                setIsAboveMaxSwapLimitUsdtOutput(false);
            }

            const isBelowMin = checkAmountBelowMinUsdtOutput(usdtValue);
            if (isBelowMin) {
                setIsBelowMinUsdtOutput(true);
                setBtcInputSwapAmount('');
                setBtcOutputAmount('');
                setLowestFeeReservationParams(null);
            } else {
                setIsBelowMinUsdtOutput(false);
            }

            setOverpayingBtcInput(false);

            setUsdtOutputSwapAmount(usdtValue);
            setUsdtDepositAmount(usdtValue);
            let reserveLiquidityParams = null;
            if (!isBelowMin) {
                reserveLiquidityParams = await calculateIdealReservationUsdtOutput(usdtValue);
            } else {
                setBtcInputSwapAmount('');
                setBtcOutputAmount('');
                setLowestFeeReservationParams(null);
            }
        }
    };

    const validateUsdtOutputChange = (value: string) => {
        const maxDecimals = useStore.getState().validAssets[selectedInputAsset.name].decimals;

        if (value === '.') return false;

        const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
        return regex.test(value);
    };

    // INITIAL SWAP UI
    return (
        <Flex
            direction='column'
            align='center'
            py='25px'
            w={'580px'}
            borderRadius='20px'
            {...opaqueBackgroundColor}
            borderBottom={borderColor}
            borderLeft={borderColor}
            borderTop={borderColor}
            borderRight={borderColor}>
            <Flex w='90%' direction={'column'}>
                <Flex w='100%' flexDir='column' position='relative'>
                    {/* BTC Input */}
                    <Flex px='10px' bg='#2E1C0C' w='100%' h='105px' border='2px solid #78491F' borderRadius={'10px'}>
                        <Flex direction={'column'} py='10px' px='5px'>
                            <Text
                                color={loading ? colors.offerWhite : !btcInputSwapAmount ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                {loading ? `Loading contract data${dots}` : 'You Send'}
                            </Text>
                            {loading ? (
                                <Skeleton height='54px' pt='40px' mt='5px' mb='0.5px' w='200px' borderRadius='5px' startColor={'#795436'} endColor={'#6C4525'} />
                            ) : (
                                <Input
                                    value={btcInputSwapAmount}
                                    onChange={handleBtcInputChange}
                                    fontFamily={'Aux'}
                                    border='none'
                                    mt='2px'
                                    mr='-150px'
                                    ml='-5px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={overpayingBtcInput || isBelowMinBtcInput || isAboveMaxSwapLimitBtcInput ? colors.red : colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='40px'
                                    placeholder='0.0'
                                    _placeholder={{ color: '#805530' }}
                                />
                            )}
                            <Flex>
                                {!loading && (
                                    <Text
                                        color={
                                            overpayingBtcInput || isBelowMinBtcInput || isAboveMaxSwapLimitBtcInput
                                                ? colors.redHover
                                                : !btcInputSwapAmount
                                                ? colors.offWhite
                                                : colors.textGray
                                        }
                                        fontSize={'13px'}
                                        mt='2px'
                                        ml='1px'
                                        letterSpacing={'-1px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        {overpayingBtcInput
                                            ? `Exceeds available liquidity - `
                                            : isBelowMinBtcInput
                                            ? `Below minimum required - `
                                            : isAboveMaxSwapLimitBtcInput
                                            ? `Exceeds maximum swap output - `
                                            : bitcoinPriceUSD
                                            ? btcInputSwapAmount
                                                ? (bitcoinPriceUSD * parseFloat(btcInputSwapAmount)).toLocaleString('en-US', {
                                                      style: 'currency',
                                                      currency: 'USD',
                                                  })
                                                : '$0.00'
                                            : '$0.00'}
                                    </Text>
                                )}
                                {/* USDT FEE ESTIMATE */}
                                {parseFloat(btcInputSwapAmount) != 0 &&
                                    btcInputSwapAmount &&
                                    !isAboveMaxSwapLimitBtcInput &&
                                    reservationFeeAmountMicroUsdt &&
                                    !overpayingBtcInput &&
                                    !isBelowMinBtcInput && (
                                        <Text
                                            ml='8px'
                                            fontSize={'13px'}
                                            mt='2px'
                                            mr='-116px'
                                            zIndex={'10'}
                                            color={colors.textGray}
                                            letterSpacing={'-1.5px'}
                                            fontWeight={'normal'}
                                            fontFamily={'Aux'}>
                                            {`+ $${parseFloat(formatUnits(reservationFeeAmountMicroUsdt, selectedInputAsset.decimals)).toFixed(2)} USDT`}
                                        </Text>
                                    )}

                                {isAboveMaxSwapLimitBtcInput && (
                                    <Text
                                        ml='8px'
                                        fontSize={'13px'}
                                        mt='2px'
                                        mr='-116px'
                                        zIndex={'10'}
                                        color={selectedInputAsset.border_color_light}
                                        cursor='pointer'
                                        onClick={() => handleUsdtOutputChange(null, '20')}
                                        _hover={{ textDecoration: 'underline' }}
                                        letterSpacing={'-1.5px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        {`20 USDT Max`}
                                    </Text>
                                )}
                                {overpayingBtcInput && (
                                    <Text
                                        ml='8px'
                                        fontSize={'13px'}
                                        mt='2px'
                                        mr='-116px'
                                        zIndex={'10'}
                                        color={selectedInputAsset.border_color_light}
                                        cursor='pointer'
                                        onClick={() => handleUsdtOutputChange(null, formatUnits(availableLiquidity, selectedInputAsset.decimals).toString())}
                                        _hover={{ textDecoration: 'underline' }}
                                        letterSpacing={'-1.5px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        {`${parseFloat(maxBtcInputExceeded).toFixed(8)} BTC Max`} {/* Max available BTC */}
                                    </Text>
                                )}
                                {isBelowMinBtcInput && (
                                    <Text
                                        ml='8px'
                                        fontSize={'13px'}
                                        mt='2px'
                                        mr='-116px'
                                        zIndex={'10'}
                                        color={selectedInputAsset.border_color_light}
                                        cursor='pointer'
                                        onClick={() => handleUsdtOutputChange(null, '1.0')}
                                        _hover={{ textDecoration: 'underline' }}
                                        letterSpacing={'-1.5px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        {`${parseFloat(minBtcInputAmount).toFixed(8)} BTC Min`} {/* Min 1 USDT output worth of sats input */}
                                    </Text>
                                )}
                            </Flex>
                        </Flex>
                        <Spacer />
                        <Flex mr='6px'>
                            <WebAssetTag asset='BTC' cursor='pointer' onDropDown={() => setCurrencyModalTitle('send')} />
                        </Flex>
                    </Flex>

                    {/* Switch Button */}
                    <Flex
                        w='32px'
                        h='32px'
                        borderRadius={'20%'}
                        alignSelf={'center'}
                        align={'center'}
                        justify={'center'}
                        cursor={'pointer'}
                        _hover={{ bg: '#333' }}
                        onClick={() => setDepositMode(true)}
                        position={'absolute'}
                        bg='#161616'
                        border='2px solid #323232'
                        top='50%'
                        left='50%'
                        transform='translate(-50%, -50%)'>
                        <svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 20 20'>
                            <path
                                fill='#909090'
                                fillRule='evenodd'
                                d='M2.24 6.8a.75.75 0 0 0 1.06-.04l1.95-2.1v8.59a.75.75 0 0 0 1.5 0V4.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L2.2 5.74a.75.75 0 0 0 .04 1.06m8 6.4a.75.75 0 0 0-.04 1.06l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75a.75.75 0 0 0-1.5 0v8.59l-1.95-2.1a.75.75 0 0 0-1.06-.04'
                                clipRule='evenodd'
                            />
                        </svg>
                    </Flex>

                    {/* USDT Output */}
                    <Flex
                        mt='5px'
                        px='10px'
                        bg={selectedInputAsset.dark_bg_color}
                        w='100%'
                        h='105px'
                        border='2px solid'
                        borderColor={selectedInputAsset.bg_color}
                        borderRadius={'10px'}>
                        <Flex direction={'column'} py='10px' px='5px'>
                            <Text
                                color={loading ? colors.offerWhite : !usdtOutputSwapAmount ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}
                                userSelect='none'>
                                {loading ? `Loading contract data${dots}` : 'You Receive'}
                            </Text>
                            {loading ? (
                                <Skeleton height='54px' pt='40px' mt='5px' mb='0.5px' w='200px' borderRadius='5px' startColor={'#2E5F50'} endColor={'#0F4534'} />
                            ) : (
                                <Input
                                    value={usdtOutputSwapAmount}
                                    onChange={handleUsdtOutputChange}
                                    fontFamily={'Aux'}
                                    border='none'
                                    mt='2px'
                                    mr='-150px'
                                    ml='-5px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={isLiquidityExceeded || isBelowMinUsdtOutput || isAboveMaxSwapLimitUsdtOutput ? colors.red : colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='40px'
                                    placeholder='0.0'
                                    _placeholder={{ color: selectedInputAsset.light_text_color }}
                                />
                            )}
                            <Flex>
                                {!loading && (
                                    <Text
                                        color={
                                            isLiquidityExceeded || isBelowMinUsdtOutput || isNoLiquidityAvailable || isAboveMaxSwapLimitUsdtOutput
                                                ? colors.redHover
                                                : !usdtOutputSwapAmount
                                                ? colors.offWhite
                                                : colors.textGray
                                        }
                                        fontSize={'13px'}
                                        mt='2px'
                                        ml='1px'
                                        mr={isLiquidityExceeded || isBelowMinUsdtOutput || isNoLiquidityAvailable ? '8px' : '0px'}
                                        letterSpacing={'-1px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        {isNoLiquidityAvailable
                                            ? `No USDT liquidity available -`
                                            : isLiquidityExceeded
                                            ? `Exceeds available liquidity -`
                                            : isBelowMinUsdtOutput
                                            ? `Minimum 1 USDT required -`
                                            : isAboveMaxSwapLimitUsdtOutput
                                            ? `Exceeds maximum swap limit -`
                                            : usdtPriceUSD
                                            ? usdtOutputSwapAmount
                                                ? (usdtPriceUSD * parseFloat(usdtOutputSwapAmount)).toLocaleString('en-US', {
                                                      style: 'currency',
                                                      currency: 'USD',
                                                  })
                                                : '$0.00'
                                            : '$0.00'}
                                    </Text>
                                )}

                                {(isLiquidityExceeded || isBelowMinUsdtOutput) && !isNoLiquidityAvailable && (
                                    <Text
                                        fontSize={'13px'}
                                        mt='2px'
                                        mr='-116px'
                                        zIndex={'10'}
                                        color={selectedInputAsset.border_color_light}
                                        cursor='pointer'
                                        onClick={() =>
                                            handleUsdtOutputChange(
                                                null,
                                                isLiquidityExceeded ? formatUnits(availableLiquidity, selectedInputAsset.decimals).toString() : '1.00', // Set to minimum value of 1 USDT
                                            )
                                        }
                                        _hover={{ textDecoration: 'underline' }}
                                        letterSpacing={'-1.5px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        {isLiquidityExceeded
                                            ? `${parseFloat(availableLiquidityInUSDT).toFixed(2)} ${selectedInputAsset.name} Max`
                                            : isBelowMinUsdtOutput
                                            ? `1 ${selectedInputAsset.name}`
                                            : 'Max'}
                                    </Text>
                                )}

                                {isAboveMaxSwapLimitUsdtOutput && (
                                    <Text
                                        ml='8px'
                                        fontSize={'13px'}
                                        mt='2px'
                                        mr='-116px'
                                        zIndex={'10'}
                                        color={selectedInputAsset.border_color_light}
                                        cursor='pointer'
                                        onClick={() => handleUsdtOutputChange(null, '20')}
                                        _hover={{ textDecoration: 'underline' }}
                                        letterSpacing={'-1.5px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        {`20 USDT Max`}
                                    </Text>
                                )}

                                {isNoLiquidityAvailable && (
                                    <Text
                                        fontSize={'13px'}
                                        mt='2px'
                                        mr='-116px'
                                        zIndex={'10'}
                                        color={selectedInputAsset.border_color_light}
                                        cursor='pointer'
                                        onClick={() => {
                                            setBtcInputSwapAmount('');
                                            setBtcOutputAmount('');
                                            setUsdtOutputSwapAmount('');
                                            setUsdtDepositAmount('');
                                            setDepositMode(true);
                                        }}
                                        _hover={{ textDecoration: 'underline' }}
                                        letterSpacing={'-1.5px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        Provide Liquidity
                                    </Text>
                                )}
                            </Flex>
                        </Flex>
                        <Spacer />
                        <Flex mr='6px'>
                            <WebAssetTag
                                asset='USDT'
                                cursor='pointer'
                                onDropDown={() => {
                                    console.log('CALLING');
                                    setCurrencyModalTitle('recieve');
                                }}
                            />
                        </Flex>
                    </Flex>
                </Flex>
                {/* Rate/Liquidity Details */}
                <Flex mt='12px'>
                    <Text color={colors.textGray} fontSize={'13px'} ml='3px' letterSpacing={'-1.5px'} fontWeight={'normal'} fontFamily={'Aux'}>
                        1 BTC ≈{' '}
                        {usdtExchangeRatePerBTC
                            ? usdtExchangeRatePerBTC.toLocaleString('en-US', {
                                  maximumFractionDigits: 4,
                              })
                            : 'N/A'}{' '}
                        {selectedInputAsset.name} {/* TODO: implemnt above where its based on the selected asset */}
                        <Box
                            as='span'
                            color={colors.textGray}
                            _hover={{
                                cursor: 'pointer',
                                //open popup about fee info
                            }}
                            letterSpacing={'-1.5px'}
                            style={{
                                textDecoration: 'underline',
                                textUnderlineOffset: '6px',
                            }}></Box>
                    </Text>
                    <Spacer />
                    <Flex color={colors.textGray} fontSize={'13px'} mr='3px' letterSpacing={'-1.5px'} fontWeight={'normal'} fontFamily={'Aux'}>
                        <Tooltip
                            fontFamily={'Aux'}
                            letterSpacing={'-0.5px'}
                            color={colors.offWhite}
                            bg={'#121212'}
                            fontSize={'12px'}
                            label='Exchange rate includes the hypernode, protocol, and reservation fees. There are no additional or hidden fees.'
                            aria-label='A tooltip'>
                            <Flex pr='3px' mt='-2px' cursor={'pointer'} userSelect={'none'}>
                                <Text color={colors.textGray} fontSize={'13px'} mr='8px' mt='1px' letterSpacing={'-1.5px'} fontWeight={'normal'} fontFamily={'Aux'}>
                                    Includes Fees
                                </Text>
                                <InfoSVG width='13px' />
                            </Flex>
                        </Tooltip>
                    </Flex>
                </Flex>
                {/* Exchange Button */}
                <Flex
                    bg={usdtOutputSwapAmount && btcInputSwapAmount ? colors.purpleBackground : colors.purpleBackgroundDisabled}
                    _hover={{ bg: colors.purpleHover }}
                    w='100%'
                    mt='15px'
                    transition={'0.2s'}
                    h='45px'
                    onClick={
                        isMobile
                            ? () => toastInfo({ title: 'Hop on your laptop', description: 'This app is too cool for small screens' })
                            : usdtOutputSwapAmount && btcInputSwapAmount
                            ? () => setSwapFlowState('1-reserve-liquidity')
                            : null
                    }
                    fontSize={'15px'}
                    align={'center'}
                    userSelect={'none'}
                    cursor={'pointer'}
                    borderRadius={'10px'}
                    justify={'center'}
                    border={usdtOutputSwapAmount && btcInputSwapAmount ? '3px solid #445BCB' : '3px solid #3242a8'}>
                    <Text color={usdtOutputSwapAmount && btcInputSwapAmount ? colors.offWhite : colors.darkerGray} fontFamily='Nostromo'>
                        Exchange
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};
