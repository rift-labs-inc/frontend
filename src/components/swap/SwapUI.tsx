import {
    Tabs,
    TabList,
    Tooltip,
    TabPanels,
    Tab,
    Button,
    Flex,
    Text,
    useColorModeValue,
    Box,
    Spacer,
    Input,
} from '@chakra-ui/react';
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
    ethToWei,
    formatAmountToString,
    formatBtcExchangeRate,
    unBufferFrom18Decimals,
    weiToEth,
} from '../../utils/dappHelper';
import { ProxyWalletLiquidityProvider, ReservationState, ReserveLiquidityParams, SwapReservation } from '../../types';
import { bitcoinDecimals, maxSwapOutputs } from '../../utils/constants';
import { AssetTag } from '../other/AssetTag';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import WebAssetTag from '../other/WebAssetTag';
import { getSwapReservations } from '../../utils/contractReadFunctions';

export const SwapUI = () => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
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

    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;
    const setUsdtDepositAmount = useStore((state) => state.setUsdtDepositAmount);
    const setBtcOutputAmount = useStore((state) => state.setBtcOutputAmount);
    const validAssets = useStore((state) => state.validAssets);
    const [proxyWalletSwapFastFee, setProxyWalletSwapFastFee] = useState(0);

    useEffect(() => {
        if (selectedInputAsset && validAssets[selectedInputAsset.name]) {
            const totalAvailableLiquidity = validAssets[selectedInputAsset.name]?.totalAvailableLiquidity;
            setAvailableLiquidity(totalAvailableLiquidity ?? BigNumber.from(0));
            setAvailableLiquidityInUSDT(
                Number(formatUnits(totalAvailableLiquidity, selectedInputAsset.decimals)).toFixed(2).toString(),
            );
        }
    }, [selectedInputAsset, validAssets]);

    const checkLiquidityExceeded = useCallback(
        (amount: string | null) => {
            const roundedUsdtAmount = Number(amount).toFixed(selectedInputAsset.decimals);
            const usdtAmountSmallestUnits = parseUnits(roundedUsdtAmount, selectedInputAsset.decimals);
            setIsLiquidityExceeded(BigNumber.from(usdtAmountSmallestUnits).gt(availableLiquidity));
        },
        [availableLiquidity],
    );

    const fetchProxyWalletSwapFee = async (numOutputs) => {
        if (window.rift) {
            try {
                const proxyWalletSwapFee = await window.rift.getRiftSwapFees({ lps: numOutputs });
                console.log('proxyWalletSwapFee:', proxyWalletSwapFee);
                setProxyWalletSwapFastFee(proxyWalletSwapFee.fastFeeAmount);
                return proxyWalletSwapFee.fastFeeAmount;
            } catch (err) {
                console.log('Error fetching wallet information.');
                console.error(err);
            }
        } else {
            console.log('Rift wallet not detected or getProxyWallet not available.');
        }
    };

    // calculate ideal reservation
    const calculateIdealReservationBitcoinInput = async (amountBtcSwapInput, inputType) => {
        if (!amountBtcSwapInput) return;
        const isBitcoinInput = inputType === 'btc' ? true : false;
        const amountSatsSwapInput = isBitcoinInput
            ? parseUnits(amountBtcSwapInput, bitcoinDecimals)
            : parseUnits(amountBtcSwapInput, selectedInputAsset.decimals);
        let idealReservationDetails =
            isBitcoinInput && allDepositVaults.length > 0
                ? calculateBestVaultsForBitcoinInput(allDepositVaults, amountSatsSwapInput)
                : null;

        console.log('true idealReservationDetails:', idealReservationDetails);

        // set exchange rate & usdt output based on retulst of the above function
        if (idealReservationDetails?.totalμUsdtSwapOutput) {
            // calculate the btc fee and subtract it from the "input", then rerun calculateBestVaultsForBitcoinInput

            const proxyWalletSwapFeeInSats = await fetchProxyWalletSwapFee(idealReservationDetails.vaultIndexes.length);
            console.log('please - proxy wallet fee in sats', proxyWalletSwapFeeInSats);

            // call the function again with the new amount
            console.log('please old amountSatsSwapInput', amountSatsSwapInput.toString());
            const newAmountSatsSwapInput = idealReservationDetails.totalBitcoinAmountInSatsUsed.sub(
                BigNumber.from(proxyWalletSwapFeeInSats),
            );
            console.log('please new amountSatsSwapInput:', newAmountSatsSwapInput.toString());

            console.log('please OLD totalμUsdtSwapOutput:', idealReservationDetails.totalμUsdtSwapOutput.toString());
            idealReservationDetails = isBitcoinInput
                ? calculateBestVaultsForBitcoinInput(allDepositVaults, newAmountSatsSwapInput)
                : null;
            console.log('please NEW totalμUsdtSwapOutput:', idealReservationDetails?.totalμUsdtSwapOutput?.toString());

            setUsdtOutputSwapAmount(
                formatAmountToString(
                    selectedInputAsset,
                    formatUnits(
                        idealReservationDetails.totalμUsdtSwapOutput ?? BigNumber.from(0),
                        selectedInputAsset.decimals,
                    ),
                ),
            );
            setUsdtDepositAmount(
                formatAmountToString(
                    selectedInputAsset,
                    formatUnits(
                        idealReservationDetails.totalμUsdtSwapOutput ?? BigNumber.from(0),
                        selectedInputAsset.decimals,
                    ),
                ),
            );

            setUsdtExchangeRatePerBTC(
                parseFloat(
                    parseFloat(
                        formatBtcExchangeRate(
                            idealReservationDetails.totalSwapExchangeRate,
                            selectedInputAsset.decimals,
                        ),
                    ).toFixed(2),
                ),
            );
            const reserveLiquidityParams: ReserveLiquidityParams = {
                totalSwapAmountInSats: BigNumber.from(idealReservationDetails?.totalBitcoinAmountInSatsUsed).toNumber(),
                vaultIndexesToReserve: idealReservationDetails.vaultIndexes,
                amountsInμUsdtToReserve: idealReservationDetails.amountsInμUsdtToReserve,
                amountsInSatsToBePaid: idealReservationDetails.amountsInSatsToBePaid,
                btcPayoutLockingScripts: idealReservationDetails.btcPayoutLockingScripts,
                btcExchangeRates: idealReservationDetails.btcExchangeRates,
                ethPayoutAddress: '', // this is set when user inputs their eth payout address
                expiredSwapReservationIndexes: [], // TODO: calculate later
            };

            console.log('please RESERVATION PARAMs:', reserveLiquidityParams);

            setLowestFeeReservationParams(reserveLiquidityParams);
        } else {
            setUsdtOutputSwapAmount('');
            setUsdtDepositAmount('');
            setLowestFeeReservationParams(null);
        }
    };

    // ----------------- BITCOIN INPUT ----------------- //

    const handleBtcInputChange = (e) => {
        const btcValue = validateBtcInput(e.target.value);

        if (btcValue !== null) {
            setBtcInputSwapAmount(btcValue);
            setBtcOutputAmount(btcValue);
            let usdtValue =
                btcValue && parseFloat(btcValue) > 0
                    ? parseFloat(btcValue) *
                      useStore.getState().validAssets[selectedInputAsset.name].exchangeRateInTokenPerBTC
                    : 0;
            calculateIdealReservationBitcoinInput(btcValue, 'btc');
        }
    };

    const validateBtcInput = (value) => {
        if (value === '') return '';
        const regex = /^\d*\.?\d*$/;
        if (!regex.test(value)) return null;
        const parts = value.split('.');
        if (parts.length > 1 && parts[1].length > bitcoinDecimals) {
            return parts[0] + '.' + parts[1].slice(0, bitcoinDecimals);
        }
        return value;
    };

    // ----------------- USDT OUTPUT ----------------- //

    const handleUsdtOutputChange = (e, amount = null) => {
        const maxDecimals = useStore.getState().validAssets[selectedInputAsset.name].decimals;
        const usdtValue = amount !== null ? amount : e.target.value;

        const validateUsdtOutputChange = (value: string) => {
            if (value === '') return true;
            const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
            return regex.test(value);
        };

        if (validateUsdtOutputChange(usdtValue)) {
            setUsdtOutputSwapAmount(usdtValue);
            setUsdtDepositAmount(usdtValue);
            const btcValue =
                usdtValue && parseFloat(usdtValue) > 0
                    ? parseFloat(usdtValue) /
                      useStore.getState().validAssets[selectedInputAsset.name].exchangeRateInTokenPerBTC
                    : 0;

            // calculateIdealReservation(usdtValue, 'usdt'); TODO: implemnt usdt output of function
        }
    };

    // INITIAL SWAP UI
    return (
        <Flex
            direction='column'
            align='center'
            py='25px'
            borderRadius='20px'
            {...backgroundColor}
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
                                color={!btcInputSwapAmount ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                You Send
                            </Text>
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
                                color={colors.offWhite}
                                _active={{ border: 'none', boxShadow: 'none' }}
                                _focus={{ border: 'none', boxShadow: 'none' }}
                                _selected={{ border: 'none', boxShadow: 'none' }}
                                fontSize='40px'
                                placeholder='0.0'
                                _placeholder={{ color: '#805530' }}
                            />
                            <Text
                                color={!btcInputSwapAmount ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                mt='2px'
                                ml='1px'
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                {bitcoinPriceUSD
                                    ? btcInputSwapAmount
                                        ? (bitcoinPriceUSD * parseFloat(btcInputSwapAmount)).toLocaleString('en-US', {
                                              style: 'currency',
                                              currency: 'USD',
                                          })
                                        : '$0.00'
                                    : '$0.00'}
                            </Text>
                        </Flex>
                        <Spacer />
                        <Flex mr='6px'>
                            <WebAssetTag asset='BTC' onDropDown={() => setCurrencyModalTitle('send')} />
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
                                color={!usdtOutputSwapAmount ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}
                                userSelect='none'>
                                You Receive
                            </Text>
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
                                color={isLiquidityExceeded ? colors.red : colors.offWhite}
                                _active={{ border: 'none', boxShadow: 'none' }}
                                _focus={{ border: 'none', boxShadow: 'none' }}
                                _selected={{ border: 'none', boxShadow: 'none' }}
                                fontSize='40px'
                                placeholder='0.0'
                                _placeholder={{ color: selectedInputAsset.light_text_color }}
                            />
                            <Flex>
                                <Text
                                    color={
                                        isLiquidityExceeded
                                            ? colors.redHover
                                            : !usdtOutputSwapAmount
                                            ? colors.offWhite
                                            : colors.textGray
                                    }
                                    fontSize={'13px'}
                                    mt='2px'
                                    ml='1px'
                                    mr={isLiquidityExceeded ? '8px' : '0px'}
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    {isLiquidityExceeded
                                        ? `Exceeds available liquidity -`
                                        : usdtPriceUSD
                                        ? usdtOutputSwapAmount
                                            ? (usdtPriceUSD * parseFloat(usdtOutputSwapAmount)).toLocaleString(
                                                  'en-US',
                                                  {
                                                      style: 'currency',
                                                      currency: 'USD',
                                                  },
                                              )
                                            : '$0.00'
                                        : '$0.00'}
                                </Text>
                                {isLiquidityExceeded && (
                                    <Text
                                        fontSize={'13px'}
                                        mt='2px'
                                        mr='-116px'
                                        zIndex={'10'}
                                        color={selectedInputAsset.border_color_light}
                                        cursor='pointer'
                                        onClick={() => handleUsdtOutputChange(null, availableLiquidityInUSDT)}
                                        _hover={{ textDecoration: 'underline' }}
                                        letterSpacing={'-1.5px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        {isLiquidityExceeded
                                            ? `${parseFloat(availableLiquidityInUSDT).toFixed(2)} ${
                                                  selectedInputAsset.name
                                              } Max`
                                            : 'Max'}
                                    </Text>
                                )}
                            </Flex>
                        </Flex>
                        <Spacer />
                        <Flex mr='6px'>
                            <WebAssetTag asset='USDT' onDropDown={() => setCurrencyModalTitle('receipt')} />
                        </Flex>
                    </Flex>
                </Flex>
                {/* Rate/Liquidity Details */}
                <Flex mt='12px'>
                    <Text
                        color={colors.textGray}
                        fontSize={'13px'}
                        ml='3px'
                        letterSpacing={'-1.5px'}
                        fontWeight={'normal'}
                        fontFamily={'Aux'}>
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
                    <Flex
                        ml='-3px'
                        color={colors.textGray}
                        fontSize={'13px'}
                        mr='3px'
                        letterSpacing={'-1.5px'}
                        fontWeight={'normal'}
                        fontFamily={'Aux'}>
                        <Tooltip
                            fontFamily={'Aux'}
                            letterSpacing={'-0.5px'}
                            color={colors.offWhite}
                            bg={'#121212'}
                            fontSize={'12px'}
                            label='Exchange rate includes the hypernode, protocol, and LP Fees. There are no additional or hidden fees.'
                            aria-label='A tooltip'>
                            <Flex ml='8px' mt='-2px' cursor={'pointer'} userSelect={'none'}>
                                <Text
                                    color={colors.textGray}
                                    fontSize={'13px'}
                                    mr='8px'
                                    mt='1px'
                                    letterSpacing={'-1.5px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    Including Fees
                                </Text>
                                <InfoSVG width='13' />
                            </Flex>
                        </Tooltip>
                    </Flex>
                </Flex>
                {/* Exchange Button */}
                <Flex
                    bg={usdtOutputSwapAmount ? colors.purpleBackground : colors.purpleBackgroundDisabled}
                    _hover={{ bg: colors.purpleHover }}
                    w='100%'
                    mt='15px'
                    transition={'0.2s'}
                    h='45px'
                    onClick={usdtOutputSwapAmount ? () => setSwapFlowState('1-reserve-liquidity') : null}
                    fontSize={'15px'}
                    align={'center'}
                    userSelect={'none'}
                    cursor={'pointer'}
                    borderRadius={'10px'}
                    justify={'center'}
                    border={usdtOutputSwapAmount ? '3px solid #445BCB' : '3px solid #3242a8'}>
                    <Text color={usdtOutputSwapAmount ? colors.offWhite : colors.darkerGray} fontFamily='Nostromo'>
                        Exchange
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};
