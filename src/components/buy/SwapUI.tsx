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
import { parseEther } from 'ethers/lib/utils';
import { btcToSats, calculateLowestFeeReservation, ethToWei, weiToEth } from '../../utils/dappHelper';
import { ReservationState, ReserveLiquidityParams, SwapReservation } from '../../types';
import { maxSwapOutputs } from '../../utils/constants';
import { AssetTag } from '../other/AssetTag';

export const SwapUI = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const btcInputSwapAmount = useStore((state) => state.btcInputSwapAmount);
    const setBtcInputSwapAmount = useStore((state) => state.setBtcInputSwapAmount);
    const tokenOutputSwapAmount = useStore((state) => state.tokenOutputSwapAmount);
    const setTokenOutputSwapAmount = useStore((state) => state.setTokenOutputSwapAmount);
    const totalAvailableLiquidity = useStore((state) => state.totalAvailableLiquidity);
    const allDepositVaults = useStore((state) => state.allDepositVaults);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const ethPriceUSD = useStore((state) => state.ethPriceUSD);
    const btcToEthExchangeRate = useStore((state) => state.btcToEthExchangeRate);
    const setSwapFlowState = useStore((state) => state.setSwapFlowState);
    const setLowestFeeReservationParams = useStore((state) => state.setLowestFeeReservationParams);
    const userEthAddress = useStore((state) => state.userEthAddress);
    const [isLiquidityExceeded, setIsLiquidityExceeded] = useState(false);
    const selectedDepositAsset = useStore((state) => state.selectedDepositAsset);
    const setSelectedDepositAsset = useStore((state) => state.setSelectedDepositAsset);

    const checkLiquidityExceeded = useCallback(
        (amount: string | null) => {
            try {
                const ethOutputInWei = !amount ? BigNumber.from(0) : ethToWei(amount);
                return BigNumber.from(ethOutputInWei).gt(totalAvailableLiquidity);
            } catch (error) {
                console.error('Error in checkLiquidityExceeded:', error);
                return false; // or handle the error as appropriate for your use case
            }
        },
        [totalAvailableLiquidity],
    );

    // calculate ideal reservation
    useEffect(() => {
        const exceeded = checkLiquidityExceeded(tokenOutputSwapAmount);
        setIsLiquidityExceeded(exceeded);

        if (tokenOutputSwapAmount && !exceeded) {
            const ethOutputInWei = ethToWei(tokenOutputSwapAmount);
            const reservationPart = calculateLowestFeeReservation(
                allDepositVaults,
                BigNumber.from(ethOutputInWei),
                maxSwapOutputs,
            );

            const reserveLiquidityParams: ReserveLiquidityParams = {
                inputSwapAmountInSats: Number(btcToSats(Number(btcInputSwapAmount))),
                vaultIndexesToReserve: reservationPart.vaultIndexes,
                amountsToReserve: reservationPart.amountsToReserve,
                ethPayoutAddress: '', // this is set when user inputs their eth payout address
                expiredSwapReservationIndexes: [], // TODO: calculated later
            };

            console.log('RESERVATION PARAMs:', reserveLiquidityParams);

            setLowestFeeReservationParams(reserveLiquidityParams);
        } else {
            setLowestFeeReservationParams(null);
        }
    }, [tokenOutputSwapAmount, checkLiquidityExceeded, allDepositVaults, setLowestFeeReservationParams]);

    const validateSwapInput = (value) => {
        if (value === '') return true;
        const regex = /^\d*\.?\d*$/;
        return regex.test(value);
    };

    const formatDecimalInput = (value) => {
        if (!value) return value;
        const parts = value.split('.');
        if (parts.length > 1 && parts[1].length > 7) {
            return parts[0] + '.' + parts[1].slice(0, 7);
        }
        return value;
    };

    const formatOutput = (number) => {
        if (!number) return '';
        const roundedNumber = Number(number).toFixed(7); // Use toFixed to temporarily round to 7 decimal places
        return roundedNumber.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, ''); // Remove trailing zeros and pointless decimal
    };

    const handleBtcChange = (e) => {
        const btcValue = formatDecimalInput(e.target.value);
        if (validateSwapInput(btcValue)) {
            setBtcInputSwapAmount(btcValue);
            let ethValue = btcValue && parseFloat(btcValue) > 0 ? parseFloat(btcValue) * btcToEthExchangeRate : 0;
            // subtract premium we calculate from the eth value
            // ethValue -= calculatePremium;
            setTokenOutputSwapAmount(formatOutput(ethValue)); // Correctly format output
        }
    };

    const handleEthSwapChange = (e) => {
        const ethValue = formatDecimalInput(e.target.value);
        if (validateSwapInput(ethValue)) {
            setTokenOutputSwapAmount(ethValue);
            const btcValue = ethValue && parseFloat(ethValue) > 0 ? parseFloat(ethValue) / btcToEthExchangeRate : 0;
            setBtcInputSwapAmount(formatOutput(btcValue));

            // Immediately check and log liquidity status
            const exceeded = checkLiquidityExceeded(ethValue);
            console.log('LIQUIDITY EXCEEDED (immediate)?:', exceeded);
        }
    };

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;

    return (
        <Flex width='600px' mt='30px' direction={'column'} overflow='hidden'>
            {/* Content */}
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
                    {/* Inputs */}
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
                                    onChange={handleBtcChange}
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
                            <Flex mt='1px' mr='6px'>
                                <AssetTag assetName='BTC' />
                            </Flex>
                        </Flex>

                        {/* Switch Button */}
                        <Flex
                            w='30px'
                            h='30px'
                            borderRadius={'20%'}
                            alignSelf={'center'}
                            align={'center'}
                            justify={'center'}
                            cursor={'pointer'}
                            _hover={{ bg: '#232323' }}
                            onClick={() => handleNavigation('/sell')}
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
                        {/* Token Output */}
                        <Flex
                            mt='5px'
                            px='10px'
                            bg={selectedDepositAsset.dark_bg_color}
                            w='100%'
                            h='105px'
                            border='2px solid'
                            borderColor={selectedDepositAsset.bg_color}
                            borderRadius={'10px'}>
                            <Flex direction={'column'} py='10px' px='5px'>
                                <Text
                                    color={!tokenOutputSwapAmount ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    You Receive
                                </Text>
                                <Input
                                    value={tokenOutputSwapAmount}
                                    onChange={handleEthSwapChange}
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
                                    _placeholder={{ color: selectedDepositAsset.light_text_color }}
                                />
                                <Text
                                    color={
                                        isLiquidityExceeded
                                            ? colors.redHover
                                            : !tokenOutputSwapAmount
                                            ? colors.offWhite
                                            : colors.textGray
                                    }
                                    fontSize={'13px'}
                                    mt='2px'
                                    ml='1px'
                                    letterSpacing={'-1.5px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    {isLiquidityExceeded
                                        ? `Exceeds Available Liquidity - ${Number(weiToEth(totalAvailableLiquidity)).toFixed(
                                              4,
                                          )} ETH Max`
                                        : ethPriceUSD
                                        ? tokenOutputSwapAmount
                                            ? (ethPriceUSD * parseFloat(tokenOutputSwapAmount)).toLocaleString('en-US', {
                                                  style: 'currency',
                                                  currency: 'USD',
                                              })
                                            : '$0.00'
                                        : '$0.00'}
                                </Text>
                            </Flex>
                            <Spacer />
                            <Flex mt='1px' mr='6px'>
                                <AssetTag assetName='USDT' />
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
                            {selectedDepositAsset.exchangeRateInTokenPerBTC
                                ? BigNumber.from(
                                      useStore.getState().validDepositAssets[selectedDepositAsset.name].exchangeRateInTokenPerBTC,
                                  )
                                      .toNumber()
                                      .toLocaleString('en-US', {
                                          maximumFractionDigits: 4,
                                      })
                                : 'N/A'}{' '}
                            {selectedDepositAsset.name} {/* TODO: implemnt above where its based on the selected asset */}
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
                        bg={tokenOutputSwapAmount ? colors.purpleBackground : colors.purpleBackgroundDisabled}
                        _hover={{ bg: colors.purpleHover }}
                        w='100%'
                        mt='15px'
                        transition={'0.2s'}
                        h='45px'
                        onClick={tokenOutputSwapAmount ? () => setSwapFlowState('1-reserve-liquidity') : null}
                        fontSize={'15px'}
                        align={'center'}
                        userSelect={'none'}
                        cursor={'pointer'}
                        borderRadius={'10px'}
                        justify={'center'}
                        border={tokenOutputSwapAmount ? '3px solid #445BCB' : '3px solid #3242a8'}>
                        <Text color={tokenOutputSwapAmount ? colors.offWhite : colors.darkerGray} fontFamily='Nostromo'>
                            Exchange
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};
