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
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../utils/colors';
import { useStore } from '../../store';
import { BTCSVG, ETHSVG, InfoSVG } from '../other/SVGs';
import { FONT_FAMILIES } from '../../utils/font';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { FaArrowRight } from 'react-icons/fa';
import { MdArrowRight } from 'react-icons/md';

export const SwapStatusTimeline = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const btcInputSwapAmount = useStore((state) => state.btcInputSwapAmount);
    const setBtcInputSwapAmount = useStore((state) => state.setBtcInputSwapAmount);
    const ethOutputSwapAmount = useStore((state) => state.ethOutputSwapAmount);
    const setEthOutputSwapAmount = useStore((state) => state.setEthOutputSwapAmount);

    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const ethPriceUSD = useStore((state) => state.ethPriceUSD);
    const btcToEthExchangeRate = useStore((state) => state.btcToEthExchangeRate);
    const setSwapFlowState = useStore((state) => state.setSwapFlowState);
    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;

    // TODO: format swap amounts with huge numbers #whales

    return (
        <Flex
            width='100%'
            bg={'#0D1610'}
            border='3px solid'
            borderColor={'#3D5A44'}
            borderRadius={'25px'}
            h='140px'
            px={'30px'}
            fontFamily={FONT_FAMILIES.AUX_MONO}
            fontWeight={'normal'}
            py='15px'>
            <Flex w='100%'>
                <Flex direction='column'>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.textGray} letterSpacing={'-2px'}>
                        STEP 1
                    </Text>
                    <Text fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.offWhite} fontSize={'22px'}>
                        RESERVE LIQUIDITY
                    </Text>
                </Flex>
                <Spacer />
                <Flex direction='column'>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.textGray} letterSpacing={'-2px'}>
                        STEP 2
                    </Text>
                    <Text fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.offWhite} fontSize={'22px'}>
                        SEND BITCOIN
                    </Text>
                </Flex>
                <Spacer />
                <Flex direction='column'>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.textGray} letterSpacing={'-2px'}>
                        STEP 3
                    </Text>
                    <Text fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.offWhite} fontSize={'22px'}>
                        RECIEVE ETHEREUM
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};
