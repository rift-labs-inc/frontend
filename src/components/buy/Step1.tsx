import {
    Tabs,
    TabList,
    Tooltip,
    TabPanels,
    Tab,
    Button,
    Flex,
    Text,
    useColorModeValue,
    Box,
    Spacer,
    Input,
} from '@chakra-ui/react';
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
import { riftExchangeContractAddress } from '../../utils/constants';
import ReservationStatusModal from './ReservationStatusModal';

export const Step1 = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const btcInputSwapAmount = useStore((state) => state.btcInputSwapAmount);
    const setBtcInputSwapAmount = useStore((state) => state.setBtcInputSwapAmount);
    const ethOutputSwapAmount = useStore((state) => state.ethOutputSwapAmount);
    const setEthOutputSwapAmount = useStore((state) => state.setEthOutputSwapAmount);

    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;
    const swapFlowState = useStore((state) => state.swapFlowState);
    const setSwapFlowState = useStore((state) => state.setSwapFlowState);
    const [ethPayoutAddress, setethPayoutAddress] = useState('');
    const setLowestFeeReservationParams = useStore((state) => state.setLowestFeeReservationParams);
    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);

    // eth payout address
    const handleETHPayoutAddressChange = (e) => {
        const BTCPayoutAddress = e.target.value;
        setethPayoutAddress(BTCPayoutAddress);
    };
    const {
        reserveLiquidity,
        status: reserveLiquidityStatus,
        error: reserveLiquidityError,

        txHash,
        resetReserveState,
    } = useReserveLiquidity();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const initiateReservation = async () => {
        if (!window.ethereum) {
            console.error('Ethereum object not found, please install MetaMask.');
            // You might want to add some user feedback here
            return;
        }

        if (!lowestFeeReservationParams) {
            console.error('Reservation parameters not found.');
            // You might want to add some user feedback here
            return;
        }

        // Reset the reserve state before starting a new reservation
        resetReserveState();

        setIsModalOpen(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        try {
            await reserveLiquidity({
                signer,
                riftExchangeAbi: riftExchangeABI.abi,
                riftExchangeContract: riftExchangeContractAddress,
                vaultIndexesToReserve: lowestFeeReservationParams.vaultIndexesToReserve,
                amountsToReserve: lowestFeeReservationParams.amountsToReserve,
                ethPayoutAddress,
                expiredSwapReservationIndexes: lowestFeeReservationParams.expiredSwapReservationIndexes,
            });

            console.log('Liquidity reservation successful');
            // You might want to add some success handling here
        } catch (error) {
            console.error('Error reserving liquidity:', error);
            // You might want to add some error handling here
        } finally {
            // setIsModalOpen(false);
        }
    };

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
                py='30px'
                align={'center'}
                borderWidth={3}
                borderColor={colors.borderGray}>
                <Text
                    fontSize='15px'
                    maxW={'600px'}
                    fontWeight={'normal'}
                    color={colors.textGray}
                    fontFamily={FONT_FAMILIES.AUX_MONO}
                    textAlign='center'
                    mt='6px'
                    flex='1'>
                    Initiate the swap by paying fees up front to lock the seller’s ETH. After the reservation is confirmed, you
                    will have 6 hours to send BTC to complete the swap.
                </Text>
                <Flex direction='column' my='100px' align='center' width='100%'>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='16px' fontWeight='normal' mb={4}>
                        Reservation Vault Selection Visualization
                    </Text>
                    <Flex justify='center' wrap='wrap' gap={4} alignItems='center'>
                        {lowestFeeReservationParams.vaultIndexesToReserve.map((index, i) => (
                            <React.Fragment key={index}>
                                <Box
                                    border='1px solid'
                                    borderColor='gray.300'
                                    borderRadius='md'
                                    p={3}
                                    bg={colors.purpleBackground}
                                    width='200px'
                                    height='90px'
                                    display='flex'
                                    flexDirection='column'
                                    alignItems='center'
                                    justifyContent='space-between'
                                    boxShadow='md'>
                                    <Text fontSize='12px' fontWeight='bold'>
                                        Vault #{index}
                                    </Text>
                                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} letterSpacing={'-2px'} fontSize='25px'>
                                        {Number(weiToEth(BigNumber.from(lowestFeeReservationParams.amountsToReserve[i]))).toFixed(
                                            2,
                                        )}{' '}
                                        ETH
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
                            border='1px solid'
                            borderColor='gray.300'
                            borderRadius='md'
                            p={3}
                            bg={colors.greenBackground}
                            width='200px'
                            height='90px'
                            display='flex'
                            flexDirection='column'
                            alignItems='center'
                            justifyContent='space-between'
                            boxShadow='md'>
                            <Text fontSize='12px' fontWeight='bold'>
                                TOTAL AMOUNT
                            </Text>
                            <Text fontFamily={FONT_FAMILIES.AUX_MONO} letterSpacing={'-2px'} fontSize='25px'>
                                {Number(
                                    lowestFeeReservationParams.amountsToReserve.reduce(
                                        (acc, curr) => Number(acc) + Number(weiToEth(BigNumber.from(curr))),
                                        0,
                                    ),
                                ).toFixed(2)}{' '}
                                ETH
                            </Text>
                        </Box>
                    </Flex>
                </Flex>

                {/* ETH Payout Address */}
                <Flex mt='20px' px='10px' bg='#1C1C1C' w='100%' h='78px' border='2px solid #565656' borderRadius={'10px'}>
                    <Flex direction={'column'}>
                        <Text
                            color={colors.offWhite}
                            fontSize={'13px'}
                            mt='7px'
                            ml='3px'
                            letterSpacing={'-1px'}
                            fontWeight={'normal'}
                            fontFamily={'Aux'}>
                            ETH Payout Address
                        </Text>
                        <Input
                            value={ethPayoutAddress}
                            onChange={handleETHPayoutAddressChange}
                            fontFamily={'Aux'}
                            border='none'
                            mt='1px'
                            mr='195px'
                            p='0px'
                            letterSpacing={'-5px'}
                            color={colors.offWhite}
                            _active={{ border: 'none', boxShadow: 'none' }}
                            _focus={{ border: 'none', boxShadow: 'none' }}
                            _selected={{ border: 'none', boxShadow: 'none' }}
                            fontSize='26px'
                            placeholder='Enter ETH payout address'
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
                    Reserve
                </Text>
            </Flex>
            <ReservationStatusModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                status={reserveLiquidityStatus}
                error={reserveLiquidityError}
                txHash={txHash}
            />
        </>
    );
};
