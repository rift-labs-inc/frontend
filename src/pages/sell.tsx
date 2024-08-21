import { Flex, Image, Text, Button, Box, IconButton, Icon, Spacer } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { OpenGraph } from '../components/background/OpenGraph';
import HorizontalButtonSelector from '../components/HorizontalButtonSelector';
import OrangeText from '../components/other/OrangeText';
import WhiteText from '../components/other/WhiteText';
import { DepositUI } from '../components/sell/DepositUI';
import { Navbar } from '../components/Navbar';
import { toastSuccess } from '../hooks/toast';
import useWindowSize from '../hooks/useWindowSize';
import { colors } from '../utils/colors';
import { FONT_FAMILIES } from '../utils/font';
import useHorizontalSelectorInput from '../hooks/useHorizontalSelectorInput';
import { useEffect, useState } from 'react';
import { getDepositVaults, getLiquidityProvider } from '../utils/contractReadFunctions';
import riftExchangeABI from '../abis/RiftExchange.json';
import { ethers } from 'ethers';
import { useStore } from '../store';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { weiToEth, satsToBtc, calculateAmountBitcoinOutput, calculateFillPercentage } from '../utils/dappHelper';
import { DepositVault } from '../types';
import { BigNumber } from 'ethers';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { BTCSVG, ETH_Icon, ETH_Logo, ETHSVG } from '../components/other/SVGs';
import { ManageVaults } from '../components/sell/ManageVaults';
import ExchangeRateChart from '../components/charts/ExchangeRateChart';

const Sell = () => {
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

    const ethersRpcProvider = useStore((state) => state.ethersRpcProvider);
    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [initialSelection, setInitialSelection] = useState('Create a Vault');

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
                            mt='-25px'>
                            <Text userSelect={'none'} fontSize='60px' fontFamily={'Klein'} fontWeight='bold' px='12px' as='h1'>
                                Sell Ethereum
                            </Text>
                        </Flex>
                    </Flex>
                    {/* Horizontal Button Selector */}
                    <Flex mt={'14px'}>
                        <HorizontalButtonSelector
                            options={optionsButton}
                            selectedItem={selectedButton}
                            onSelectItem={handleButtonSelection}
                        />
                    </Flex>
                    <Flex
                        w='800px'
                        h='650px'
                        align={'center'}
                        justify={'center'}
                        bg={colors.offBlack}
                        borderRadius={'20px'}
                        mt='14px'
                        border='3px solid'
                        borderColor={colors.borderGray}>
                        {/* Liquidity Distribution Chart */}
                        {/* <Flex w='50%' h='100%' flexDir='column' p='20px'>
                            <Text
                                fontFamily={FONT_FAMILIES.AUX_MONO}
                                fontWeight={'normal'}
                                color={colors.textGray}
                                fontSize='0.8rem'>
                                {selectedButton === 'Create a Vault' ? 'Total Liquidity Distribution' : 'Your Vault Distribution'}
                            </Text>
                            <Flex gap='8px' align='center'>
                                <Image src='/images/icons/Ethereum.svg' h='26px' />
                                <Text
                                    fontFamily={FONT_FAMILIES.AUX_MONO}
                                    fontSize='50px'
                                    letterSpacing='-8px'
                                    fontWeight='normal'>
                                    323,249.00
                                </Text>
                            </Flex>
                            <Flex flex={1} w='100%'>
                                <ExchangeRateChart />
                            </Flex>
                        </Flex> */}
                        {/* Deposit & Manage Vaults */}
                        {selectedButton === 'Create a Vault' ? <DepositUI /> : <ManageVaults />}
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default Sell;
