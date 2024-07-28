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
import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../utils/colors';
import { BTCSVG, ETHSVG, InfoSVG } from './SVGs';
import { SwapAmounts } from './swap/SwapAmounts';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { useStore } from '../store';
import { SwapStatusTimeline } from './swap/SwapStatusTimeline';

type ActiveTab = 'swap' | 'liquidity';

export const SwapFlow = ({}) => {
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

    return (
        <Flex width='900px' align={'center'} direction={'column'}>
            <SwapAmounts />
            <Flex w='100%' mt='-69px' ml='0px'>
                <Button bg='none' w='12px' _hover={{ bg: colors.borderGray }} onClick={() => setSwapFlowState('not-started')}>
                    <ChevronLeftIcon width={'40px'} height={'40px'} bg='none' color={colors.offWhite} />
                </Button>
            </Flex>
            <Flex justify={'center'} bg='blue' w='100%' mt='50px'>
                <SwapStatusTimeline />
            </Flex>
        </Flex>
    );
};
