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
import ReservationStatusModal from './ReservationStatusModal';
import { Step1 } from './Step1';

type ActiveTab = 'swap' | 'liquidity';

export const ReserveLiquidityPage = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const [activeTab, setActiveTab] = useState<ActiveTab>('swap');
    const [lpFee, setLpFee] = useState('');

    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;
    const swapFlowState = useStore((state) => state.swapFlowState);
    const setSwapFlowState = useStore((state) => state.setSwapFlowState);
    const [ethPayoutAddress, setethPayoutAddress] = useState('');
    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);
    const setEthPayoutAddress = useStore((state) => state.setEthPayoutAddress);

    //TODO: clear on first load
    // useEffect(() => {
    //     setEthPayoutAddress('');
    // });

    return (
        <Flex width='1000px' align={'center'} direction={'column'}>
            <SwapAmounts />
            <Flex w='100%' mt='-69px' ml='0px'>
                <Button
                    bg='none'
                    w='12px'
                    _hover={{ bg: colors.borderGray }}
                    onClick={() => setSwapFlowState('0-not-started')}>
                    <ChevronLeftIcon width={'40px'} height={'40px'} bg='none' color={colors.offWhite} />
                </Button>
            </Flex>
            <Flex justify={'center'} w='100%' mt='50px'>
                <SwapStatusTimeline />
            </Flex>
            <Step1 />
        </Flex>
    );
};
