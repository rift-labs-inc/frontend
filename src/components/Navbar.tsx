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
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { ValidAsset } from '../types';
import { formatUnits } from 'ethers/lib/utils';

export const Navbar = ({}) => {
    const { height, width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const allSwapReservations = useStore((state) => state.allSwapReservations);
    const allDepositVaults = useStore((state) => state.allDepositVaults);
    const userActiveDepositVaults = useStore((state) => state.userActiveDepositVaults);
    const userCompletedDepositVaults = useStore((state) => state.userCompletedDepositVaults);
    const setTotalExpiredReservations = useStore((state) => state.setTotalExpiredReservations);
    const totalExpiredReservations = useStore((state) => state.totalExpiredReservations);
    const [showDeveloperMode, setShowDeveloperMode] = useState(false);
    const [isLocalhost, setIsLocalhost] = useState(false);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);

    const [availableLiquidity, setAvailableLiquidity] = useState(BigNumber.from(0));

    useEffect(() => {
        setAvailableLiquidity(
            useStore.getState().validAssets[selectedInputAsset.name]?.totalAvailableLiquidity ?? BigNumber.from(0),
        );
    }, [selectedInputAsset]);

    useEffect(() => {
        const hostname = window.location.hostname;
        setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
    }, []);

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
                <Text
                    color={router.pathname == route ? colors.offWhite : '#ccc'}
                    fontSize='1.1rem'
                    fontFamily='Nostromo'>
                    {text}
                </Text>
                {router.pathname === route && (
                    <Flex
                        position={'absolute'}
                        ml='1px'
                        top='29px'
                        // w={
                        //     router.pathname === '/manage'
                        //         ? '87px'
                        //         : router.pathname === '/activity'
                        //         ? '93px'
                        //         : router.pathname === '/whitepaper'
                        //         ? '134px'
                        //         : '57px'
                        // }
                        w='calc(100% - 20px)'
                        height='2px'
                        bgGradient={`linear(90deg, #394AFF, #FF8F28)`}
                    />
                )}
            </Flex>
        );
    };

    const StatCard = ({ label, value, color = colors.RiftOrange }) => (
        <Box
            borderWidth='1px'
            borderColor={colors.textGray}
            borderRadius='10px'
            bg={colors.offBlack}
            p={'10px'}
            textAlign='center'>
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

    return (
        <Flex width='100%' direction={'column'} position='fixed' top={0} left={0} right={0} zIndex={1000}>
            <Flex
                bgGradient='linear(0deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8))'
                position='absolute'
                w='100%'
                h='130%'></Flex>
            <Flex direction='row' w='100%' px={'30px'} pt='25px'>
                <Flex gap='12px'>
                    {navItem('Swap', '/')}
                    {/* {navItem('Lending', '/lending')} */}
                    {/* {navItem('OTC', '/otc')} */}
                    {navItem('Manage', '/manage')}
                    {navItem('Activity', '/activity')}
                    {navItem('About', '/about')}
                </Flex>
                <Spacer />
                {/* TODO: Remove below: */}
                <Flex
                    direction='column'
                    fontFamily={FONT_FAMILIES.AUX_MONO}
                    align='center'
                    fontSize='12px'
                    position='absolute'
                    top={0}
                    left={0}
                    right={0}>
                    {isLocalhost && (
                        <Button
                            position={'absolute'}
                            top={0}
                            _hover={{ background: 'rgba(150, 150, 150, 0.2)' }}
                            color={colors.textGray}
                            bg={colors.offBlack}
                            onClick={() => {
                                setShowDeveloperMode(!showDeveloperMode);
                            }}>
                            TOGGLE
                        </Button>
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

                            <Flex
                                position='absolute'
                                top={height - 140}
                                gap={3}
                                flexWrap='wrap'
                                justifyContent='center'>
                                <StatCard
                                    label='Total Available Liquidity'
                                    value={`${formatUnits(availableLiquidity, selectedInputAsset.decimals)} ${
                                        selectedInputAsset.name
                                    }`}
                                />

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
