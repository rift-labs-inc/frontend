import { Box, Button, Flex, FlexProps, Spacer, Text, useClipboard, VStack } from '@chakra-ui/react';
import { colors } from '../utils/colors';
import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { IoMenu } from 'react-icons/io5';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectWalletButton } from './ConnectWalletButton';
import { FONT_FAMILIES } from '../utils/font';
import { useStore } from '../store';
import { weiToEth } from '../utils/dappHelper';
import { BigNumber, ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ValidAsset } from '../types';
import { formatUnits } from 'ethers/lib/utils';
import { isDismissWarning, onDismiss } from '../utils/warningHelper';
import GlowingShimmerText from './other/GlowingText';

export const Navbar = ({}) => {
    const { isMobile, isTablet, isSmallLaptop, windowSize } = useWindowSize();
    const router = useRouter();
    const fontSize = isMobile ? '20px' : '20px';
    const allSwapReservations = useStore((state) => state.allSwapReservations);
    const allDepositVaults = useStore((state) => state.allDepositVaults);
    const userActiveDepositVaults = useStore((state) => state.userActiveDepositVaults);
    const userCompletedDepositVaults = useStore((state) => state.userCompletedDepositVaults);
    const setTotalExpiredReservations = useStore((state) => state.setTotalExpiredReservations);
    const totalExpiredReservations = useStore((state) => state.totalExpiredReservations);
    const [showDeveloperMode, setShowDeveloperMode] = useState(false);
    const [isLocalhost, setIsLocalhost] = useState(false);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const validAssets = useStore((state) => state.validAssets);
    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);
    const [availableLiquidity, setAvailableLiquidity] = useState(BigNumber.from(0));
    const [formattedTotalAmount, setFormattedTotalAmount] = useState<string>('0');
    const reservationFeeAmountMicroUsdt = useStore((state) => state.reservationFeeAmountMicroUsdt);

    const [displayWarning, setDisplayWarning] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        setDisplayWarning(!isDismissWarning('dismissAlphaWarning'));
    }, []);

    useEffect(() => {
        const totalAvailableLiquidity = validAssets[selectedInputAsset.name]?.totalAvailableLiquidity;
        setAvailableLiquidity(totalAvailableLiquidity ?? BigNumber.from(0));
    }, [validAssets]);

    useEffect(() => {
        const hostname = window.location.hostname;
        setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
    }, []);

    useEffect(() => {
        if (!lowestFeeReservationParams) {
            return;
        }
        const totalAmount = lowestFeeReservationParams?.amountsInMicroUsdtToReserve.reduce((acc, curr) => BigNumber.from(acc).add(curr), ethers.BigNumber.from(0));
        setFormattedTotalAmount(formatUnits(totalAmount, selectedInputAsset.decimals));
    }, [lowestFeeReservationParams]);

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const navItem = (text: string, route: string) => {
        return (
            <Flex
                _hover={{ background: 'rgba(150, 150, 150, 0.2)' }}
                cursor='pointer'
                borderRadius='6px'
                px='10px'
                onClick={() => {
                    if (route === '/about') {
                        window.location.href = 'https://rift.exchange';
                    } else {
                        handleNavigation(route);
                    }
                }}
                py='2px'
                position='relative'
                alignItems='center'>
                <Text color={router.pathname == route ? colors.offWhite : '#ccc'} fontSize={isTablet ? '0.9rem' : '1.1rem'} fontFamily='Nostromo'>
                    {text}
                </Text>
                {router.pathname === route && (
                    <Flex
                        position={'absolute'}
                        // ml='1px'
                        top='29px'
                        // w={router.pathname === '/manage' ? '87px' : router.pathname === '/activity' ? '93px' : router.pathname === '/whitepaper' ? '134px' : '55px'}
                        w='calc(100% - 20px)'
                        height='2px'
                        bgGradient={`linear(90deg, #394AFF, #FF8F28)`}
                    />
                )}
            </Flex>
        );
    };

    const StatCard = ({ label, value, color = colors.RiftOrange }) => (
        <Box borderWidth='1px' borderColor={colors.textGray} borderRadius='10px' bg={colors.offBlack} p={'10px'} textAlign='center'>
            <Text color={colors.textGray} fontSize='10px' mb={1}>
                {label}
            </Text>
            <Text color={color} fontSize='14px' fontWeight='bold'>
                {value}
            </Text>
        </Box>
    );

    const getChainName = (id) => {
        switch (id) {
            case 11155111:
                return 'Sepolia';
            case 1:
                return 'ETH';
            default:
                return id;
        }
    };

    if (isMobile) return null;

    return (
        <Flex width='100%' direction={'column'} position='fixed' top={0} left={0} right={0} zIndex={1000}>
            <Flex bgGradient='linear(0deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8))' position='absolute' w='100%' h='130%'></Flex>
            {displayWarning == true && (
                <>
                    <Flex
                        bgGradient='linear(90deg, rgba(223, 111, 19, 1), rgba(39, 46, 221, 1))'
                        zIndex='2'
                        alignSelf={'center'}
                        align={'center'}
                        justify={'center'}
                        w='100%'
                        minH='40px'
                        position='relative'>
                        <GlowingShimmerText>The Rift early alpha is awaiting audits - swaps are limited to 20 USDT - use at your own risk</GlowingShimmerText>
                        <Flex
                            // h='100%'
                            h='38px'
                            w={isSmallLaptop ? '38px' : '100px'}
                            align='center'
                            borderRadius={'4px'}
                            justify={'center'}
                            position='absolute'
                            cursor={'pointer'}
                            right={isSmallLaptop ? '10px' : '10px'}
                            color={isSmallLaptop ? colors.textGray : colors.offWhite}
                            _hover={{ bg: colors.purpleButtonBG, color: colors.offWhite }}
                            onClick={() => {
                                onDismiss('dismissAlphaWarning');
                                setDisplayWarning(false);
                            }}>
                            <Text textShadow={'0px 0px 10px rgba(0, 0, 0, 0.5)'} fontFamily={FONT_FAMILIES.NOSTROMO} fontSize='16px'>
                                {isSmallLaptop ? 'X' : 'DISMISS'}
                            </Text>
                        </Flex>
                    </Flex>
                    <Flex
                        bgGradient='linear(-90deg, rgba(251, 142, 45, 0.5), rgba(69, 76, 251, 0.5))'
                        zIndex='2'
                        alignSelf={'center'}
                        align={'center'}
                        justify={'center'}
                        w='100%'
                        h='2px'
                        mb='-10px'
                    />
                </>
            )}

            <Flex direction='row' w='100%' px={'30px'} pt='25px'>
                <Flex gap='12px'>
                    {navItem('Swap', '/')}
                    {/* {navItem('Lending', '/lending')} */}
                    {/* {navItem('OTC', '/otc')} */}
                    {navItem('Manage', '/manage')}
                    {/* {navItem('Activity', '/activity')} */}
                    {navItem('About', '/about')}
                </Flex>
                <Spacer />
                {/* TODO: Remove below: */}
                <Flex direction='column' fontFamily={FONT_FAMILIES.AUX_MONO} align='center' fontSize='12px' position='absolute' top={0} left={0} right={0}>
                    {isLocalhost && (
                        <Button
                            position={'absolute'}
                            top={0}
                            w='20px'
                            mt='54px'
                            _hover={{ background: 'rgba(150, 150, 150, 0.2)' }}
                            color={colors.textGray}
                            bg={'none'}
                            onClick={() => {
                                setShowDeveloperMode(!showDeveloperMode);
                            }}></Button>
                    )}
                    {showDeveloperMode && (
                        <>
                            <Text my='10px'>Current Rift Contracts:</Text>
                            <VStack spacing={1} align='stretch' width='100%' maxWidth='600px'>
                                {Object.keys(useStore.getState().validAssets).map((key) => {
                                    const asset = useStore.getState().validAssets[key];
                                    return (
                                        <Flex key={asset.riftExchangeContractAddress} justify='space-between'>
                                            <Text>{asset.name}:</Text>
                                            <Text>{asset.riftExchangeContractAddress}</Text>
                                            <Text>Chain: {getChainName(asset.contractChainID)}</Text>
                                        </Flex>
                                    );
                                })}
                            </VStack>
                            <Flex direction='column' mt='240px' align='center' width='100%'>
                                <Text fontFamily={FONT_FAMILIES.NOSTROMO} fontSize='16px' fontWeight='normal' mb={4}>
                                    Vault Selection Algo VISUALIZER
                                </Text>

                                <Flex justify='center' wrap='wrap' gap={4} alignItems='center'>
                                    {lowestFeeReservationParams?.vaultIndexesToReserve?.map((index, i) => (
                                        <React.Fragment key={index}>
                                            <Box
                                                border='3px solid'
                                                borderColor={colors.purpleBorder}
                                                borderRadius='md'
                                                p={3}
                                                pt='10px'
                                                bg={colors.purpleBackground}
                                                width='250px'
                                                height='95px'
                                                display='flex'
                                                flexDirection='column'
                                                alignItems='center'
                                                justifyContent='space-between'
                                                boxShadow='md'>
                                                <Text fontSize='12px' color={colors.textGray} fontWeight='bold'>
                                                    Vault #{index}
                                                </Text>
                                                <Text fontFamily={FONT_FAMILIES.AUX_MONO} letterSpacing={'-2px'} fontSize='25px'>
                                                    {parseFloat(formatUnits(lowestFeeReservationParams.amountsInMicroUsdtToReserve[i], selectedInputAsset.decimals)).toFixed(2)}{' '}
                                                    {selectedInputAsset.name}
                                                </Text>
                                                <Text fontSize='8px' color={colors.textGray} fontWeight='bold'>
                                                    {BigNumber.from(lowestFeeReservationParams.btcExchangeRates[i]).toString()} μUsdt/Sat
                                                </Text>
                                            </Box>
                                            {i < lowestFeeReservationParams.vaultIndexesToReserve.length - 1 ? (
                                                <Text fontSize='24px' fontWeight='bold'>
                                                    +
                                                </Text>
                                            ) : (
                                                <Text fontSize='24px' fontWeight='bold'>
                                                    =
                                                </Text>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <Box
                                        border='3px solid'
                                        borderColor={colors.greenOutline}
                                        borderRadius='md'
                                        p={3}
                                        bg={colors.greenBackground}
                                        width='250px'
                                        height='90px'
                                        display='flex'
                                        flexDirection='column'
                                        alignItems='center'
                                        justifyContent='space-between'
                                        boxShadow='md'>
                                        <Text fontSize='12px' color={colors.offerWhite} fontWeight='bold'>
                                            TOTAL AMOUNT
                                        </Text>
                                        <Text fontFamily={FONT_FAMILIES.AUX_MONO} letterSpacing={'-2px'} fontSize='25px'>
                                            {parseFloat(formattedTotalAmount.toString()).toFixed(2)} {selectedInputAsset.name}
                                        </Text>
                                    </Box>
                                </Flex>

                                {reservationFeeAmountMicroUsdt && (
                                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='16px' fontWeight='normal' mt={4} color={colors.textGray}>
                                        {parseFloat(formatUnits(reservationFeeAmountMicroUsdt, selectedInputAsset.decimals)).toFixed(2)} {selectedInputAsset.name} Reservation Fee
                                    </Text>
                                )}
                            </Flex>

                            <Flex position='absolute' top={windowSize.height - 140} gap={3} flexWrap='wrap' justifyContent='center'>
                                <StatCard label='Total Available Liquidity' value={`${formatUnits(availableLiquidity, selectedInputAsset.decimals)} ${selectedInputAsset.name}`} />

                                <StatCard label='Total Deposits' value={allDepositVaults.length} />
                                <StatCard label='My Active Deposits' value={userActiveDepositVaults.length} />
                                <StatCard label='My Completed Deposits' value={userCompletedDepositVaults.length} />
                                <StatCard label='Total Reservations' value={allSwapReservations.length} />
                                <StatCard label='Total Expired Reservations' value={totalExpiredReservations} />
                            </Flex>
                        </>
                    )}
                </Flex>
                {/* TODO: Remove above */}
                <Spacer />
                <Flex mb='-5px' pr='5px'>
                    <ConnectWalletButton />
                </Flex>
            </Flex>
        </Flex>
    );
};
