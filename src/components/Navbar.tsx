import { Box, Button, Flex, FlexProps, Spacer, Text, useClipboard, VStack } from '@chakra-ui/react';
import { colors } from '../utils/colors';
import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { IoMenu } from 'react-icons/io5';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectWalletButton } from './ConnectWalletButton';
import { validDepositAssets } from '../utils/constants';
import { FONT_FAMILIES } from '../utils/font';
import { useStore } from '../store';
import { weiToEth } from '../utils/dappHelper';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { DepositAsset } from '../types';

export const Navbar = ({}) => {
    const { height, width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const allSwapReservations = useStore((state) => state.allSwapReservations);
    const allDepositVaults = useStore((state) => state.allDepositVaults);
    const myActiveDepositVaults = useStore((state) => state.myActiveDepositVaults);
    const myCompletedDepositVaults = useStore((state) => state.myCompletedDepositVaults);
    const totalAvailableLiquidity = useStore((state) => state.totalAvailableLiquidity);
    const setTotalExpiredReservations = useStore((state) => state.setTotalExpiredReservations);
    const totalExpiredReservations = useStore((state) => state.totalExpiredReservations);

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const navItem = (text: string, route: string) => {
        return (
            <Flex
                _hover={{ background: 'rgba(150, 150, 150, 0.2)' }}
                cursor='pointer'
                borderRadius='6px'
                mr='15px'
                onClick={() => {
                    if (route === '/about') {
                        window.location.href = 'https://rift.exchange';
                    } else {
                        handleNavigation(route);
                    }
                }}
                px='10px'
                py='2px'
                position='relative'
                alignItems='center'>
                <Text color={router.pathname == route ? colors.offWhite : '#ccc'} fontSize='18px' fontFamily='Nostromo'>
                    {text}
                </Text>
                {router.pathname === route && (
                    <Flex
                        position={'absolute'}
                        ml='1px'
                        top='29px'
                        w={
                            router.pathname === '/sell'
                                ? '50px'
                                : router.pathname === '/activity'
                                ? '93px'
                                : router.pathname === '/whitepaper'
                                ? '134px'
                                : '40px'
                        }
                        height='2px'
                        bgGradient={`linear(90deg, #394AFF, #FF8F28)`}></Flex>
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
            <Flex direction='row' w='100%' px={'30px'} pt='25px'>
                {navItem('Buy', '/')}
                {/* {navItem('Lending', '/lending')} */}
                {/* {navItem('OTC', '/otc')} */}
                {navItem('Sell', '/sell')}
                {navItem('Activity', '/activity')}
                {navItem('About', '/about')}
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
                    right={0}
                    pointerEvents='none'>
                    <Text my='10px'>Current Rift Contracts:</Text>
                    <VStack spacing={1} align='stretch' width='100%' maxWidth='600px'>
                        {Object.keys(validDepositAssets).map((key) => {
                            const asset = validDepositAssets[key];
                            return (
                                <Flex key={asset.address} justify='space-between'>
                                    <Text>{asset.name}:</Text>
                                    <Text>{asset.address}</Text>
                                    <Text>Chain: {getChainName(asset.contractChainID)}</Text>
                                </Flex>
                            );
                        })}
                    </VStack>

                    <Flex position='absolute' top={height - 140} gap={3} flexWrap='wrap' justifyContent='center'>
                        <StatCard
                            label='Total Available Liquidity'
                            value={`${weiToEth(totalAvailableLiquidity).toString()} ETH`}
                        />
                        <StatCard label='Total Deposits' value={allDepositVaults.length} />
                        <StatCard label='My Active Deposits' value={myActiveDepositVaults.length} />
                        <StatCard label='My Completed Deposits' value={myCompletedDepositVaults.length} />
                        <StatCard label='Total Reservations' value={allSwapReservations.length} />
                        <StatCard label='Total Expired Reservations' value={totalExpiredReservations} />
                    </Flex>
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
