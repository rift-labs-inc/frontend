import { Tabs, TabList, Tooltip, TabPanels, Tab, Button, Flex, Text, useColorModeValue, Box, Spacer, Input } from '@chakra-ui/react';
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
import { AssetTag } from '../other/AssetTag';

export const SwapAmounts = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const btcInputSwapAmount = useStore((state) => state.btcInputSwapAmount);
    const setBtcInputSwapAmount = useStore((state) => state.setBtcInputSwapAmount);
    const usdtOutputSwapAmount = useStore((state) => state.usdtOutputSwapAmount);
    const setUsdtOutputSwapAmount = useStore((state) => state.setUsdtOutputSwapAmount);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const setSwapFlowState = useStore((state) => state.setSwapFlowState);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;

    return (
        <Flex
            bg={colors.offBlack}
            border='3px solid'
            borderColor={colors.borderGray}
            borderRadius={'full'}
            h='88px'
            pl={'35px'}
            pr={'28px'}
            fontFamily={FONT_FAMILIES.AUX_MONO}
            fontWeight={'normal'}
            py='3px'>
            <Flex direction='column'>
                <Flex>
                    <Text mr='15px' fontSize={'36px'} letterSpacing={'-5px'} color={colors.offWhite}>
                        {btcInputSwapAmount}
                    </Text>
                    <Flex mt='-16px' mb='-7px'>
                        <AssetTag assetName='BTC' width='80px' />
                    </Flex>
                    {/* <BTCSVG width='100' height='58' viewBox='0 0 148 54' />{' '} */}
                </Flex>
                <Text color={colors.textGray} fontSize={'13px'} mt='-12px' ml='6px' letterSpacing={'-2px'} fontWeight={'normal'} fontFamily={'Aux'}>
                    ≈ $
                    {(parseFloat(btcInputSwapAmount) * bitcoinPriceUSD).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}{' '}
                    USD{' '}
                </Text>
            </Flex>
            <Spacer />
            <Flex align='center' ml='-4px' mr='-5px' mt='-4px' justify={'center'}>
                <MdArrowRight size={'50px'} color={colors.darkerGray} />
            </Flex>
            <Spacer />
            <Flex direction='column'>
                <Flex>
                    <Text mr='15px' fontSize={'36px'} letterSpacing={'-5px'} color={colors.offWhite}>
                        {usdtOutputSwapAmount}
                    </Text>
                    <Flex mt='-16px' mb='-7px'>
                        <AssetTag assetName='USDT' width='90px' />
                    </Flex>{' '}
                </Flex>
                <Text color={colors.textGray} fontSize={'13px'} mt='-12px' ml='6px' letterSpacing={'-2px'} fontWeight={'normal'} fontFamily={'Aux'}>
                    ≈ $
                    {(parseFloat(usdtOutputSwapAmount) * useStore.getState().validAssets[selectedInputAsset.name].priceUSD).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}{' '}
                    USD{' '}
                </Text>
            </Flex>
        </Flex>
    );
};
