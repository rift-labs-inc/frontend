import { Flex, Text } from '@chakra-ui/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { OpenGraph } from '../components/background/OpenGraph';
import HorizontalButtonSelector from '../components/HorizontalButtonSelector';
import { Navbar } from '../components/Navbar';
import { DepositUIOLD } from '../components/sell/DepositUIOLD';
import { ManageVaults } from '../components/sell/ManageVaults';
import useHorizontalSelectorInput from '../hooks/useHorizontalSelectorInput';
import useWindowSize from '../hooks/useWindowSize';
import { useStore } from '../store';
import { colors } from '../utils/colors';

const Manage = () => {
    const { height, width } = useWindowSize();
    const isSmallScreen = width < 1200;
    const router = useRouter();
    const handleNavigation = (route: string) => {
        router.push(route);
    };
    const {
        options: optionsButton,
        selected: selectedButton,
        setSelected: setSelectedButton,
    } = useHorizontalSelectorInput(['Create a Vault', 'Manage Vaults'] as const);

    const allDepositVaults = useStore((state) => state.allDepositVaults);

    const selectedVaultToManage = useStore((state) => state.selectedVaultToManage);
    const setSelectedVaultToManage = useStore((state) => state.setSelectedVaultToManage);
    const showManageDepositVaultsScreen = useStore((state) => state.showManageDepositVaultsScreen);
    const setShowManageDepositVaultsScreen = useStore((state) => state.setShowManageDepositVaultsScreen);

    // switch to manage vaults screen if user has just created a vault
    useEffect(() => {
        if (showManageDepositVaultsScreen) {
            setSelectedButton('Manage Vaults');
            console.log('Switching to manage vaults screen', selectedButton);
            setShowManageDepositVaultsScreen(false);
        }
    }, [showManageDepositVaultsScreen, selectedButton]);

    // reset selected vault when switching between screens
    useEffect(() => {
        if (selectedButton !== 'Manage Vaults') {
            setSelectedVaultToManage(null);
        }
    }, [selectedButton]);

    const handleButtonSelection = (selection) => {
        setSelectedButton(selection);
    };

    return (
        <>
            <OpenGraph title='Liquidity' />
            <Flex
                h='100vh'
                width='100%'
                direction='column'
                backgroundImage={'/images/rift_background_low.webp'}
                backgroundSize='cover'
                backgroundPosition='center'>
                <Navbar />
                <Flex direction={'column'} align='center' w='100%' h='100%' mt='105px'>
                    {/* LOGOS & TEXT */}
                    <Flex direction={'column'} align='center' w='100%'>
                        <Flex
                            sx={{
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                            }}
                            bgGradient={`linear(-90deg, #394AFF, #FF8F28)`}
                            letterSpacing={'2px'}
                            mt='-35px'>
                            <Text
                                userSelect={'none'}
                                fontSize='60px'
                                fontFamily={'Klein'}
                                fontWeight='bold'
                                px='12px'
                                as='h1'>
                                Sell f
                            </Text>
                            <Text
                                userSelect={'none'}
                                fontSize='60px'
                                fontFamily={'Klein'}
                                fontWeight='bold'
                                ml='-20px'
                                as='h1'>
                                or Bitcoin
                            </Text>
                        </Flex>
                    </Flex>
                    <Flex w='100%' maxW='1200px' align={'center'} justify={'center'}>
                        <ManageVaults />
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default Manage;
