import { Flex, Image, Text, Button, Box, IconButton, Icon, Spacer } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { OpenGraph } from '../components/background/OpenGraph';
import HorizontalButtonSelector from '../components/HorizontalButtonSelector';
import OrangeText from '../components/OrangeText';
import WhiteText from '../components/WhiteText';
import { DepositUI } from '../components/DepositUI';
import { Navbar } from '../components/Navbar';
import { toastSuccess } from '../hooks/toast';
import useWindowSize from '../hooks/useWindowSize';
import { colors } from '../utils/colors';
import { FONT_FAMILIES } from '../utils/font';
import useHorizontalSelectorInput from '../hooks/useHorizontalSelectorInput';
import { useEffect, useState } from 'react';
import { getDepositVaults, getLiquidityProvider } from '../utils/dataAggregation';
import riftExchangeABI from '../abis/RiftExchange.json';
import { ethers } from 'ethers';
import { useStore } from '../store';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import {
    contractChainID,
    riftExchangeContractAddress,
    weiToEth,
    satsToBtc,
    calculateAmountBitcoinOutput,
    calculateFillPercentage,
} from '../utils/dappHelper';
import { DepositVault } from '../types';
import { BigNumber } from 'ethers';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { BTCSVG, ETH_Icon, ETH_Logo, ETHSVG } from '../components/SVGs';
import { ManageVaults } from '../components/ManageVaults';

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

    const allUserDepositVaults = useStore((state) => state.allUserDepositVaults);
    const setMyActiveDepositVaults = useStore((state) => state.setMyActiveDepositVaults);
    const setMyCompletedDepositVaults = useStore((state) => state.setMyCompletedDepositVaults);
    const selectedVaultToManage = useStore((state) => state.selectedVaultToManage);
    const setSelectedVaultToManage = useStore((state) => state.setSelectedVaultToManage);

    const ethersProvider = useStore((state) => state.ethersProvider);
    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useAccount();
    const chainId = useChainId();

    useEffect(() => {
        if (isConnected && Array.isArray(allUserDepositVaults) && address) {
            getLiquidityProvider(ethersProvider, riftExchangeABI.abi, riftExchangeContractAddress, address)
                .then((result) => {
                    const stringIndexes = result.depositVaultIndexes.map((index) => index.toString());
                    const filteredVaults = allUserDepositVaults
                        .filter((vault, index) => stringIndexes.includes(index.toString()))
                        .map((vault, index) => {
                            if (stringIndexes.includes(index.toString())) {
                                return { ...vault, index: index };
                            }
                            return vault;
                        });

                    console.log('All User Deposit Vaults:', allUserDepositVaults);
                    console.log('My Deposit Vaults:', filteredVaults);

                    // Separate active and completed vaults
                    const active: DepositVault[] = [];
                    const completed: DepositVault[] = [];

                    filteredVaults.forEach((vault) => {
                        console.log('Vault:', vault);
                        const fillPercentage = calculateFillPercentage(vault);
                        if (fillPercentage < 100) {
                            active.push(vault);
                        } else {
                            completed.push(vault);
                        }
                    });

                    setMyActiveDepositVaults(active);
                    setMyCompletedDepositVaults(completed);
                })
                .catch((error) => {
                    console.error('Failed to fetch deposit vault indexes:', error);
                });
        }
    }, [isConnected, allUserDepositVaults, address, ethersProvider]);

    useEffect(() => {
        if (selectedButton !== 'Manage Vaults') {
            setSelectedVaultToManage(null);
        }
    }, [selectedButton]);

    return (
        <>
            <OpenGraph title='Liquidity' />
            <Flex
                h='100vh'
                width='100%'
                direction='column'
                backgroundImage={'/images/rift_background_op.webp'}
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
                        <HorizontalButtonSelector options={optionsButton} onSelectItem={setSelectedButton} />
                    </Flex>
                    <Flex
                        w='1300px'
                        bg={colors.offBlack}
                        h='650px'
                        borderRadius={'20px'}
                        mt='14px'
                        border='3px solid'
                        borderColor={colors.borderGray}>
                        {/* Liquidity Distribution Chart */}
                        <Flex w='50%' h='100%' flexDir='column' p='20px'>
                            <Text fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.textGray} fontSize='0.8rem'>
                                Total Liquidity
                            </Text>
                            <Flex gap='8px' align='center'>
                                <Image src='/images/icons/Ethereum.svg' h='26px' />
                                <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='30px'>
                                    323,249.00
                                </Text>
                            </Flex>
                            <Flex flex={1} w='100%' />
                        </Flex>
                        {/* Deposit & Manage Vaults */}
                        {selectedButton === 'Create a Vault' ? <DepositUI /> : <ManageVaults />}
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default Sell;
