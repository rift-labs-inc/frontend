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
import { BTCSVG, ChromeLogoSVG, ETHSVG, InfoSVG, WarningSVG } from '../other/SVGs';
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

export const Step2 = ({}) => {
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
                py='35px'
                align={'center'}
                borderWidth={3}
                borderColor={colors.borderGray}>
                <Flex maxW={'600px'} mt='20px' direction={'column'} align={'center'}>
                    <WarningSVG width='60px' />

                    <Text
                        fontSize='15px'
                        fontWeight={'normal'}
                        color={colors.textGray}
                        fontFamily={FONT_FAMILIES.AUX_MONO}
                        textAlign='center'
                        mt='20px'
                        flex='1'>
                        Your Rift Proxy Wallet is not detected. If this is your first time swapping, please add the Rift Chrome
                        Extension below:
                    </Text>
                    <Flex
                        width='100%'
                        mt={'60px'}
                        height='110px'
                        mb={'50px'}
                        // open chrome extension store in new tab
                        onClick={() => {
                            window.open('https://chromewebstore.google.com/', '_blank');
                        }}
                        cursor={'pointer'}
                        flexShrink={0}
                        bg={colors.purpleBackground}
                        align={'center'}
                        justify={'center'}
                        borderWidth={3}
                        borderColor={colors.purpleBorder}
                        borderRadius={'full'}
                        filter='drop-shadow(0px 0px 34.9px rgba(46, 64, 183, 0.33))'>
                        <ChromeLogoSVG width='70px' />
                        <Text fontSize={'25px'} ml='12px' fontFamily={FONT_FAMILIES.NOSTROMO}>
                            INSTALL CHROME EXTENSION
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
            <Flex
                bg={colors.offBlack}
                _hover={{ bg: colors.offBlackLighter }}
                w='400px'
                mt='25px'
                transition={'0.2s'}
                h='45px'
                onClick={ethPayoutAddress ? () => null : null}
                fontSize={'15px'}
                align={'center'}
                userSelect={'none'}
                cursor={'pointer'}
                borderRadius={'10px'}
                justify={'center'}
                borderWidth={'2px'}
                borderColor={colors.offBlackLighter2}>
                <WarningSVG fill={colors.textGray} width='18px' />
                <Text ml='10px' color={colors.textGray} fontFamily='Nostromo'>
                    Rift Wallet Not Detected
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
