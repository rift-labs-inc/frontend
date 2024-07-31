import { Box, Button, Flex, FlexProps, Spacer, Text } from '@chakra-ui/react';
import { colors } from '../utils/colors';
import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { IoMenu } from 'react-icons/io5';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectWalletButton } from './ConnectWalletButton';
import { contractChainID, riftExchangeContractAddress } from '../utils/constants';
import { FONT_FAMILIES } from '../utils/font';

export const Navbar = ({}) => {
    const { height, width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';

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
                <Flex
                    direction={'column'}
                    fontFamily={FONT_FAMILIES.AUX_MONO}
                    align='center'
                    fontSize={'12px'}
                    justify={'cetner'}
                    right={0}
                    left={0}
                    position={'absolute'}>
                    <Text>Current Rift Contract:</Text>
                    <Text
                        cursor={'pointer'}
                        onClick={() => {
                            navigator.clipboard.writeText(riftExchangeContractAddress);
                        }}
                        color={'blue.300'}>
                        {riftExchangeContractAddress}
                    </Text>
                    <Text>
                        Chain ID: {contractChainID === 11155111 ? 'Sepolia' : contractChainID === 1 ? 'ETH' : contractChainID}{' '}
                    </Text>
                </Flex>
                <Spacer />
                <Flex mb='-5px' pr='5px'>
                    <ConnectWalletButton />
                </Flex>
            </Flex>
        </Flex>
    );
};
