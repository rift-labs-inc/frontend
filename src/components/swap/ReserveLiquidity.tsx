import { Tabs, TabList, Tooltip, TabPanels, Tab, Button, Flex, Text, useColorModeValue, Box, Spacer, Input } from '@chakra-ui/react';
import useWindowSize from '../../hooks/useWindowSize';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../utils/colors';
import { BTCSVG, ETHSVG, InfoSVG } from '../other/SVGs';
import { SwapAmounts } from './SwapAmounts';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { useStore } from '../../store';
import { SwapStatusTimeline } from './SwapStatusTimeline';
import { FONT_FAMILIES } from '../../utils/font';
import { weiToEth } from '../../utils/dappHelper';
import { BigNumber, ethers } from 'ethers';
import { useReserveLiquidity } from '../../hooks/contract/useReserveLiquidity';
import ReservationStatusModal from './ReservationStatusModal';
import { formatUnits } from 'ethers/lib/utils';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { opaqueBackgroundColor } from '../../utils/constants';
import { IoMdCheckmarkCircle } from 'react-icons/io';
import { HiXCircle } from 'react-icons/hi';
import { FaClock } from 'react-icons/fa';
import { LockClosed } from 'react-ionicons';
import { AssetTag } from '../other/AssetTag';
import WebAssetTag from '../other/WebAssetTag';
import { toastInfo } from '../../hooks/toast';

export const ReserveLiquidity = ({}) => {
    const { isMobile } = useWindowSize();
    const router = useRouter();
    const fontSize = isMobile ? '20px' : '20px';
    const actualBorderColor = '#323232';
    const chainId = useChainId();
    const { chains, error, switchChain } = useSwitchChain();
    const borderColor = `2px solid ${actualBorderColor}`;
    const swapFlowState = useStore((state) => state.swapFlowState);
    const setSwapFlowState = useStore((state) => state.setSwapFlowState);
    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const setEthPayoutAddress = useStore((state) => state.setEthPayoutAddress);
    const ethPayoutAddress = useStore((state) => state.ethPayoutAddress);
    const { address, isConnected } = useAccount();
    const [isAwaitingConnection, setIsAwaitingConnection] = useState(false);
    const { openConnectModal } = useConnectModal();
    const setLowestFeeReservationParams = useStore((state) => state.setLowestFeeReservationParams);
    const reservationFeeAmountMicroUsdt = useStore((state) => state.reservationFeeAmountMicroUsdt);
    const [isWaitingForCorrectNetwork, setIsWaitingForCorrectNetwork] = useState(false);
    const [isEthereumPayoutAddressValid, setIsEthereumPayoutAddressValid] = useState<boolean>(false);
    // usdt payout address
    const handleETHPayoutAddressChange = (e) => {
        const newEthPayoutAddress = e.target.value;
        setEthPayoutAddress(newEthPayoutAddress);

        // Update the lowestFeeReservationParams with the new ETH payout address
        setLowestFeeReservationParams({
            ...lowestFeeReservationParams,
            ethPayoutAddress: newEthPayoutAddress,
        });
    };
    const {
        reserveLiquidity,
        status: reserveLiquidityStatus,
        error: reserveLiquidityError,

        txHash,
        resetReserveState,
    } = useReserveLiquidity();

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (isConnected && isAwaitingConnection) {
            setIsAwaitingConnection(false);
            proceedWithReservation();
        }

        if (isWaitingForCorrectNetwork && chainId === selectedInputAsset.contractChainID) {
            setIsWaitingForCorrectNetwork(false);
            proceedWithReservation();
        }
    }, [isConnected, isAwaitingConnection, chainId, isWaitingForCorrectNetwork]);

    const initiateReservation = async () => {
        if (!isConnected) {
            setIsAwaitingConnection(true);
            openConnectModal();
            return;
        }

        if (chainId !== selectedInputAsset.contractChainID) {
            console.log('Switching network');
            setIsWaitingForCorrectNetwork(true);
            switchChain({ chainId: selectedInputAsset.contractChainID });
            return;
        }

        proceedWithReservation();
    };

    const proceedWithReservation = async () => {
        if (!window.ethereum || !lowestFeeReservationParams) {
            console.error('Ethereum or reservation parameters not found.');
            return;
        }

        // Reset the reserve state before starting a new reservation
        resetReserveState();

        setIsModalOpen(true);

        console.log('brothers, params', lowestFeeReservationParams);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const totalSatsInputInlcudingProxyFee = lowestFeeReservationParams.totalSatsInputInlcudingProxyFee;
        console.log('brothers, total sats', totalSatsInputInlcudingProxyFee.toString());

        try {
            await reserveLiquidity({
                signer,
                riftExchangeAbi: selectedInputAsset.riftExchangeAbi,
                riftExchangeContract: selectedInputAsset.riftExchangeContractAddress,
                vaultIndexesToReserve: lowestFeeReservationParams.vaultIndexesToReserve,
                amountsToReserve: lowestFeeReservationParams.amountsInMicroUsdtToReserve,
                ethPayoutAddress,
                totalSatsInputInlcudingProxyFee: totalSatsInputInlcudingProxyFee,
                expiredSwapReservationIndexes: lowestFeeReservationParams.expiredSwapReservationIndexes,
                tokenAddress: selectedInputAsset.tokenAddress,
            });

            console.log('Liquidity reservation successful');
        } catch (error) {
            console.error('Error reserving liquidity:', error);
        } finally {
            // setIsModalOpen(false);
        }
    };

    const validateEthereumPayoutAddress = (address: string): boolean => {
        const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
        return ethereumRegex.test(address);
    };

    const EthereumAddressValidation: React.FC<{ address: string }> = ({ address }) => {
        const isValid = validateEthereumPayoutAddress(address);
        setIsEthereumPayoutAddressValid(isValid);

        if (address.length === 0) {
            return <Text>...</Text>;
        }

        return (
            <Flex align='center' fontFamily={FONT_FAMILIES.NOSTROMO} w='50px' ml='-45px' mr='0px' h='100%' justify='center' direction='column'>
                {isValid ? (
                    <>
                        <IoMdCheckmarkCircle color='green' size={'24px'} />
                        <Text fontSize={'10px'} mt='3px' color='green'>
                            Valid
                        </Text>
                    </>
                ) : (
                    <>
                        <HiXCircle color='red' size={'24px'} />
                        <Text fontSize={'10px'} mt='3px' color='red'>
                            Invalid
                        </Text>
                    </>
                )}
            </Flex>
        );
    };

    return (
        <>
            <Flex
                // h='800px'
                w='100%'
                mt='20px'
                borderRadius={'30px'}
                px='50px'
                direction={'column'}
                pb='30px'
                pt='15px'
                align={'center'}
                {...opaqueBackgroundColor}
                borderWidth={3}
                borderColor={colors.borderGray}>
                <Text
                    fontSize='14px'
                    mb='18px'
                    maxW={'900px'}
                    fontWeight={'normal'}
                    color={colors.textGray}
                    fontFamily={FONT_FAMILIES.AUX_MONO}
                    textAlign='center'
                    mt='25px'
                    flex='1'>
                    Initiate the swap by paying a reservation fee to lock the seller’s USDT. After the reservation is confirmed, you will have 6 hours to send BTC to complete the
                    swap.
                </Text>
                {/* Fees and Swap Time Estimate */}
                <Flex w='380px' h='60px' borderRadius={'10px'} overflow={'hidden'} mt='10px' mb='20px' bg={colors.borderGray} borderColor={colors.borderGray} borderWidth={2}>
                    <Flex w='50%' align='center' bg={colors.offBlack}>
                        <Flex mx='13px' w='20px'>
                            <LockClosed width={'20px'} color={colors.offWhite} />
                        </Flex>
                        <Flex direction={'column'}>
                            <Text fontSize={'11px'} fontFamily={FONT_FAMILIES.NOSTROMO} letterSpacing={-0.3}>
                                Reservation Fee
                            </Text>
                            {reservationFeeAmountMicroUsdt && (
                                <Text fontFamily={FONT_FAMILIES.NOSTROMO} fontSize='10px' fontWeight='normal' color={colors.textGray}>
                                    {parseFloat(formatUnits(reservationFeeAmountMicroUsdt, selectedInputAsset.decimals)).toFixed(2)} {selectedInputAsset.name}
                                </Text>
                            )}
                        </Flex>
                    </Flex>
                    <Flex w='50%' align='center' bg={colors.borderGray}>
                        <Flex mx='15px' w='20px'>
                            <FaClock size={20} color={colors.offWhite} />
                        </Flex>
                        <Flex direction={'column'}>
                            <Text fontSize={'11px'} fontFamily={FONT_FAMILIES.NOSTROMO} letterSpacing={-0.3}>
                                Estimated Time
                            </Text>{' '}
                            <Text fontSize={'10px'} fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.textGray}>
                                70 Minutes
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>

                <Text ml='8px' mt='15px' w='100%' mb='10px' fontSize='15px' fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.offWhite}>
                    Pay Reservation Fee In
                </Text>
                <Flex h='60px' w='100%' mb='20px'>
                    <Flex
                        flex={1}
                        align='center'
                        justify='center'
                        bg={colors.currencyCard.usdt.background}
                        border={`2px solid ${colors.currencyCard.usdt.border}`}
                        borderRadius={'10px 0px 0px 10px'}>
                        <WebAssetTag asset='USDT' />
                    </Flex>
                    <Flex
                        onClick={() => toastInfo({ title: 'Reserve using Bitcoin is coming soon' })}
                        flex={1}
                        align='center'
                        justify='center'
                        bg={colors.currencyCard.disabled.background}
                        border={`2px solid ${colors.currencyCard.disabled.border}`}
                        borderLeft='none'
                        zIndex={1}
                        cursor={'pointer'}
                        borderRadius={'0px 10px 10px 0px'}>
                        <WebAssetTag asset='BTC' cursor='pointer' greyedOut />
                    </Flex>
                </Flex>

                {/* USDT Payout Address */}
                <Text ml='8px' mt='15px' w='100%' mb='10px' fontSize='15px' fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.offWhite}>
                    USDT Payout Address
                </Text>
                <Flex mt='-2px' mb='15px' px='10px' bg='#111' border='2px solid #565656' w='100%' h='60px' borderRadius={'10px'}>
                    <Flex direction={'row'} py='6px' px='5px'>
                        <Input
                            value={ethPayoutAddress}
                            onChange={handleETHPayoutAddressChange}
                            fontFamily={'Aux'}
                            border='none'
                            mt='3.5px'
                            w='804px'
                            mr='65px'
                            ml='-4px'
                            p='0px'
                            letterSpacing={'-4px'}
                            color={colors.offWhite}
                            _active={{ border: 'none', boxShadow: 'none' }}
                            _focus={{ border: 'none', boxShadow: 'none' }}
                            _selected={{ border: 'none', boxShadow: 'none' }}
                            fontSize='28px'
                            placeholder='0xb0cb90a9a3dfd81...'
                            _placeholder={{ color: colors.darkerGray }}
                            spellCheck={false}
                        />

                        {ethPayoutAddress.length > 0 && (
                            <Flex ml='-5px' mt='0px'>
                                <EthereumAddressValidation address={ethPayoutAddress} />
                            </Flex>
                        )}
                    </Flex>
                </Flex>

                {/* Reserve Button */}
            </Flex>
            <Flex
                bg={ethPayoutAddress && isEthereumPayoutAddressValid ? colors.purpleBackground : colors.purpleBackgroundDisabled}
                _hover={{ bg: colors.purpleHover }}
                w='400px'
                mt='25px'
                transition={'0.2s'}
                h='45px'
                onClick={ethPayoutAddress && isEthereumPayoutAddressValid ? () => initiateReservation() : null}
                fontSize={'15px'}
                align={'center'}
                userSelect={'none'}
                cursor={'pointer'}
                borderRadius={'10px'}
                justify={'center'}
                border={ethPayoutAddress && isEthereumPayoutAddressValid ? '3px solid #445BCB' : '3px solid #3242a8'}>
                <Text color={ethPayoutAddress && isEthereumPayoutAddressValid ? colors.offWhite : colors.darkerGray} fontFamily='Nostromo'>
                    {isConnected ? 'Reserve Liquidity' : 'Connect Wallet'}
                </Text>
            </Flex>
            <ReservationStatusModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} status={reserveLiquidityStatus} error={reserveLiquidityError} txHash={txHash} />
        </>
    );
};
