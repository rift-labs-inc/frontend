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
import { bitcoinDecimals, maxSwapOutputs } from '../../utils/constants';
import { AssetTag2 } from '../other/AssetTag2';
import { useAccount } from 'wagmi';
import { connectorsForWallets, useConnectModal } from '@rainbow-me/rainbowkit';
import { DepositConfirmation } from '../deposit/DepositConfirmation';

export const DepositUI = () => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const btcInputSwapAmount = useStore((state) => state.btcInputSwapAmount);
    const setBtcInputSwapAmount = useStore((state) => state.setBtcInputSwapAmount);
    const usdtDepositAmount = useStore((state) => state.usdtDepositAmount);
    const setUsdtDepositAmount = useStore((state) => state.setUsdtDepositAmount);
    const allDepositVaults = useStore((state) => state.allDepositVaults);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const setLowestFeeReservationParams = useStore((state) => state.setLowestFeeReservationParams);
    const userEthAddress = useStore((state) => state.userEthAddress);
    const [isLiquidityExceeded, setIsLiquidityExceeded] = useState(false);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const setSelectedInputAsset = useStore((state) => state.setSelectedInputAsset);
    const usdtPriceUSD = useStore.getState().validAssets[selectedInputAsset.name].priceUSD;
    const [availableLiquidity, setAvailableLiquidity] = useState(BigNumber.from(0));
    const [usdtExchangeRatePerBTC, setUsdtExchangeRatePerBTC] = useState(0);
    const depositMode = useStore((state) => state.depositMode);
    const setDepositMode = useStore((state) => state.setDepositMode);
    const validAssets = useStore((state) => state.validAssets);
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const depositFlowState = useStore((state) => state.depositFlowState);
    const setDepositFlowState = useStore((state) => state.setDepositFlowState);
    const setSwapFlowState = useStore((state) => state.setSwapFlowState);
    const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);
    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;
    const [userUsdtBalance, setUserUsdtBalance] = useState('0.00');

    // update token price and available liquidity
    useEffect(() => {
        console.log('Selected Input Asset:', selectedInputAsset);
        console.log('Valid Assets:', validAssets);

        if (selectedInputAsset && validAssets[selectedInputAsset.name]) {
            console.log(
                'Exchange Rate in Token per BTC:',
                validAssets[selectedInputAsset.name].exchangeRateInTokenPerBTC,
            );

            const totalAvailableLiquidity = validAssets[selectedInputAsset.name]?.totalAvailableLiquidity;
            console.log('Total Available Liquidity:', totalAvailableLiquidity?.toString());
            setAvailableLiquidity(totalAvailableLiquidity ?? BigNumber.from(0));
            setUsdtExchangeRatePerBTC(validAssets[selectedInputAsset.name].exchangeRateInTokenPerBTC);
            setUserUsdtBalance(validAssets[selectedInputAsset.name].connectedUserBalanceFormatted);
        }
    }, [selectedInputAsset, validAssets]);

    const checkLiquidityExceeded = (amount: number) => {
        return amount > parseFloat(userUsdtBalance);
    };

    const initiateDeposit = async () => {
        if (!isConnected) {
            setIsWaitingForConnection(true);
            openConnectModal();
            return;
        }

        setDepositFlowState('1-confirm-deposit');
    };

    const handleBtcOutputChange = (e) => {
        console.log('e.target.value:', e.target.value);
        const btcValue = validateBtcInput(e.target.value);
        console.log('btcValue:', btcValue);

        if (btcValue !== null) {
            setBtcInputSwapAmount(btcValue);
            let btcOutputAmount =
                btcValue && parseFloat(btcValue) > 0
                    ? parseFloat(btcValue) *
                      useStore.getState().validAssets[selectedInputAsset.name].exchangeRateInTokenPerBTC
                    : 0;
            // TODO: subtract premium we calculate from the eth value
            // btcOutputAmount -= calculatePremium;
            setUsdtDepositAmount(formatOutput(btcOutputAmount)); // Correctly format output
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

    const formatOutput = (number) => {
        if (!number) return '';
        const roundedNumber = Number(number).toFixed(selectedInputAsset.decimals);
        return roundedNumber.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, ''); // Remove trailing zeros and pointless decimal
    };

    const handleUsdtInputChange = (e, amount = null) => {
        const maxDecimals = useStore.getState().validAssets[selectedInputAsset.name].decimals;
        const usdtValue = amount !== null ? amount : e.target.value;

        const validateUsdtInputChange = (value: string) => {
            if (value === '') return true;
            const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
            return regex.test(value);
        };

        if (validateUsdtInputChange(usdtValue)) {
            setUsdtDepositAmount(usdtValue);
            const btcValue =
                usdtValue && parseFloat(usdtValue) > 0
                    ? parseFloat(usdtValue) /
                      useStore.getState().validAssets[selectedInputAsset.name].exchangeRateInTokenPerBTC
                    : 0;
            setBtcInputSwapAmount(formatOutput(btcValue));

            // Immediately check and log liquidity status
            if (isConnected) {
                setIsLiquidityExceeded(checkLiquidityExceeded(usdtValue));
            } else {
                setIsLiquidityExceeded(false);
            }
        }
    };

    // DEPOSIT INPUTS UI
    return (
        <>
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
                    {depositFlowState === '1-confirm-deposit' ? (
                        <DepositConfirmation />
                    ) : (
                        <>
                            <Flex w='100%' flexDir='column' position='relative'>
                                {/* USDT Input */}
                                <Flex
                                    px='10px'
                                    bg={selectedInputAsset.dark_bg_color}
                                    w='100%'
                                    h='105px'
                                    border='2px solid'
                                    borderColor={selectedInputAsset.bg_color}
                                    borderRadius={'10px'}>
                                    <Flex direction={'column'} py='10px' px='5px'>
                                        <Text
                                            color={!usdtDepositAmount ? colors.offWhite : colors.textGray}
                                            fontSize={'13px'}
                                            letterSpacing={'-1px'}
                                            fontWeight={'normal'}
                                            fontFamily={'Aux'}>
                                            You Deposit
                                        </Text>
                                        <Input
                                            value={usdtDepositAmount}
                                            onChange={handleUsdtInputChange}
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
                                                        : !usdtDepositAmount
                                                        ? colors.offWhite
                                                        : colors.textGray
                                                }
                                                fontSize={'13px'}
                                                mt='2px'
                                                ml='1px'
                                                mr='8px'
                                                letterSpacing={'-1.5px'}
                                                fontWeight={'normal'}
                                                fontFamily={'Aux'}>
                                                {isLiquidityExceeded
                                                    ? `Exceeds available liquidity - `
                                                    : usdtPriceUSD
                                                    ? usdtDepositAmount
                                                        ? (usdtPriceUSD * parseFloat(usdtDepositAmount)).toLocaleString(
                                                              'en-US',
                                                              {
                                                                  style: 'currency',
                                                                  currency: 'USD',
                                                              },
                                                          )
                                                        : '$0.00'
                                                    : '$0.00'}{' '}
                                            </Text>
                                            {!isLiquidityExceeded && isConnected && (
                                                <>
                                                    <Spacer />
                                                    <Text
                                                        align={'right'}
                                                        color={
                                                            isLiquidityExceeded
                                                                ? selectedInputAsset.border_color_light
                                                                : !usdtDepositAmount
                                                                ? colors.offWhite
                                                                : colors.textGray
                                                        }
                                                        fontSize={'13px'}
                                                        onClick={() => handleUsdtInputChange(-1, userUsdtBalance)}
                                                        _hover={{ textDecoration: 'underline' }}
                                                        mt='2px'
                                                        mr='6px'
                                                        letterSpacing={'-1.5px'}
                                                        fontWeight={'normal'}
                                                        fontFamily={'Aux'}>
                                                        {parseFloat(userUsdtBalance).toFixed(2)}{' '}
                                                        {selectedInputAsset.name}
                                                    </Text>
                                                </>
                                            )}
                                            {isConnected && (
                                                <Text
                                                    fontSize={'13px'}
                                                    mt='2px'
                                                    mr='-116px'
                                                    zIndex={'10'}
                                                    color={selectedInputAsset.border_color_light}
                                                    cursor='pointer'
                                                    onClick={() => handleUsdtInputChange(null, userUsdtBalance)}
                                                    _hover={{ textDecoration: 'underline' }}
                                                    letterSpacing={'-1.5px'}
                                                    fontWeight={'normal'}
                                                    fontFamily={'Aux'}>
                                                    {isLiquidityExceeded
                                                        ? `${parseFloat(userUsdtBalance).toFixed(2)} ${
                                                              selectedInputAsset.name
                                                          } Max`
                                                        : 'Max'}
                                                </Text>
                                            )}
                                        </Flex>
                                    </Flex>
                                    <Spacer />
                                    <Flex mt='9px' mr='6px'>
                                        <AssetTag2 assetName='USDT' />
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
                                    onClick={() => setDepositMode(false)}
                                    position={'absolute'}
                                    bg='#161616'
                                    border='2px solid #323232'
                                    top='50%'
                                    left='50%'
                                    transform='translate(-50%, -50%)'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='20px'
                                        height='20px'
                                        viewBox='0 0 20 20'>
                                        <path
                                            fill='#909090'
                                            fillRule='evenodd'
                                            d='M2.24 6.8a.75.75 0 0 0 1.06-.04l1.95-2.1v8.59a.75.75 0 0 0 1.5 0V4.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L2.2 5.74a.75.75 0 0 0 .04 1.06m8 6.4a.75.75 0 0 0-.04 1.06l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75a.75.75 0 0 0-1.5 0v8.59l-1.95-2.1a.75.75 0 0 0-1.06-.04'
                                            clipRule='evenodd'
                                        />
                                    </svg>
                                </Flex>
                                {/* BTC Output */}
                                <Flex
                                    mt={'5px'}
                                    px='10px'
                                    bg='#2E1C0C'
                                    w='100%'
                                    h='105px'
                                    border='2px solid #78491F'
                                    borderRadius={'10px'}>
                                    <Flex direction={'column'} py='10px' px='5px'>
                                        <Text
                                            color={!btcInputSwapAmount ? colors.offWhite : colors.textGray}
                                            fontSize={'13px'}
                                            letterSpacing={'-1px'}
                                            fontWeight={'normal'}
                                            fontFamily={'Aux'}>
                                            You Recieve
                                        </Text>
                                        <Input
                                            value={btcInputSwapAmount}
                                            onChange={handleBtcOutputChange}
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
                                                    ? (bitcoinPriceUSD * parseFloat(btcInputSwapAmount)).toLocaleString(
                                                          'en-US',
                                                          {
                                                              style: 'currency',
                                                              currency: 'USD',
                                                          },
                                                      )
                                                    : '$0.00'
                                                : '$0.00'}
                                        </Text>
                                    </Flex>
                                    <Spacer />
                                    <Flex mt='9px' mr='6px'>
                                        <AssetTag2 assetName='BTC' />
                                    </Flex>
                                </Flex>
                            </Flex>{' '}
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
                                    {selectedInputAsset.name}{' '}
                                    {/* TODO: implemnt above where its based on the selected asset */}
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
                                bg={usdtDepositAmount ? colors.purpleBackground : colors.purpleBackgroundDisabled}
                                _hover={{ bg: colors.purpleHover }}
                                w='100%'
                                mt='15px'
                                transition={'0.2s'}
                                h='45px'
                                onClick={usdtDepositAmount ? () => initiateDeposit() : null}
                                fontSize={'15px'}
                                align={'center'}
                                userSelect={'none'}
                                cursor={'pointer'}
                                borderRadius={'10px'}
                                justify={'center'}
                                border={usdtDepositAmount ? '3px solid #445BCB' : '3px solid #3242a8'}>
                                <Text
                                    color={usdtDepositAmount ? colors.offWhite : colors.darkerGray}
                                    fontFamily='Nostromo'>
                                    {isConnected ? 'Create Sell Order' : 'Connect Wallet'}
                                </Text>
                            </Flex>
                        </>
                    )}
                </Flex>
            </Flex>
        </>
    );
};
