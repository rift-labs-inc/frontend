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

export const PausedSwapUI = () => {
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
                                    disabled={true}
                                    // onChange={handleBtcInputChange}
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
                            </Flex>
                        </Flex>
                        <Spacer />
                        <Flex mr='6px'>
                            <WebAssetTag asset='BTC' cursor='pointer' />
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
                                    // onChange={handleUsdtOutputChange}
                                    disabled={true}
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
                            </Flex>
                        </Flex>
                        <Spacer />
                        <Flex mr='6px'>
                            <WebAssetTag asset='USDT' cursor='pointer' />
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
                    fontSize={'15px'}
                    align={'center'}
                    userSelect={'none'}
                    cursor={'pointer'}
                    borderRadius={'10px'}
                    justify={'center'}
                    border={usdtOutputSwapAmount && btcInputSwapAmount ? '3px solid #445BCB' : '3px solid #3242a8'}>
                    <Text userSelect={'none'} color={usdtOutputSwapAmount && btcInputSwapAmount ? colors.offWhite : colors.darkerGray} fontFamily='Nostromo'>
                        NEW SWAPS ARE DISABLED FOR TESTING
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};
