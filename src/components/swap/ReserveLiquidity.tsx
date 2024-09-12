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
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export const ReserveLiquidity = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
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
    const [formattedTotalAmount, setFormattedTotalAmount] = useState<string>('0');
    const reservationFeeAmountMicroUsdt = useStore((state) => state.reservationFeeAmountMicroUsdt);

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
    }, [isConnected, isAwaitingConnection]);

    const initiateReservation = async () => {
        if (!isConnected) {
            setIsAwaitingConnection(true);

            openConnectModal();
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

    useEffect(() => {
        if (!lowestFeeReservationParams) {
            return;
        }
        const totalAmount = lowestFeeReservationParams?.amountsInMicroUsdtToReserve.reduce((acc, curr) => BigNumber.from(acc).add(curr), ethers.BigNumber.from(0));
        setFormattedTotalAmount(formatUnits(totalAmount, selectedInputAsset.decimals));
    }, [lowestFeeReservationParams]);

    return (
        <>
            <Flex
                // h='800px'
                bg={colors.offBlack}
                w='100%'
                mt='20px'
                borderRadius={'30px'}
                px='20px'
                direction={'column'}
                pb='30px'
                pt='15px'
                align={'center'}
                borderWidth={3}
                borderColor={colors.borderGray}>
                <Text fontSize='13px' maxW={'900px'} fontWeight={'normal'} color={colors.textGray} fontFamily={FONT_FAMILIES.AUX_MONO} textAlign='center' mt='6px' flex='1'>
                    Initiate the swap by paying fees up front to lock the seller’s ETH. After the reservation is confirmed, you will have 6 hours to send BTC to complete the swap.
                </Text>
                <Flex direction='column' my='40px' align='center' width='100%'>
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

                {/* USDT Payout Address */}
                <Flex mt='20px' px='10px' bg='#1C1C1C' w='100%' h='78px' border='2px solid #565656' borderRadius={'10px'}>
                    <Flex direction={'column'}>
                        <Text color={colors.offWhite} fontSize={'13px'} mt='7px' ml='3px' letterSpacing={'-1px'} fontWeight={'normal'} fontFamily={'Aux'}>
                            USDT Payout Address
                        </Text>
                        <Input
                            value={ethPayoutAddress}
                            onChange={handleETHPayoutAddressChange}
                            fontFamily={'Aux'}
                            border='none'
                            mt='1px'
                            mr='550px'
                            p='0px'
                            letterSpacing={'-5px'}
                            color={colors.offWhite}
                            _active={{ border: 'none', boxShadow: 'none' }}
                            _focus={{ border: 'none', boxShadow: 'none' }}
                            _selected={{ border: 'none', boxShadow: 'none' }}
                            fontSize='26px'
                            placeholder='Enter USDT payout address'
                            spellCheck={false}
                            _placeholder={{ color: colors.textGray }}
                        />
                    </Flex>
                    {/* TODO: ADD LOADING INDICATOR AND ADDRESS VALIDATION CHECK CIRCLE HERE */}
                </Flex>

                {/* Reserve Button */}
            </Flex>
            <Flex
                bg={ethPayoutAddress ? colors.purpleBackground : colors.purpleBackgroundDisabled}
                _hover={{ bg: colors.purpleHover }}
                w='400px'
                mt='25px'
                transition={'0.2s'}
                h='45px'
                onClick={ethPayoutAddress ? () => initiateReservation() : null}
                fontSize={'15px'}
                align={'center'}
                userSelect={'none'}
                cursor={'pointer'}
                borderRadius={'10px'}
                justify={'center'}
                border={ethPayoutAddress ? '3px solid #445BCB' : '3px solid #3242a8'}>
                <Text color={ethPayoutAddress ? colors.offWhite : colors.darkerGray} fontFamily='Nostromo'>
                    {isConnected ? 'Reserve Liquidity' : 'Connect Wallet'}
                </Text>
            </Flex>
            <ReservationStatusModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} status={reserveLiquidityStatus} error={reserveLiquidityError} txHash={txHash} />
        </>
    );
};
