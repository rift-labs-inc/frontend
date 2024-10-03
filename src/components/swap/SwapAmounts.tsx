import { Tabs, TabList, Tooltip, TabPanels, Tab, Button, Flex, Text, useColorModeValue, Box, Spacer, Input, Spinner } from '@chakra-ui/react';
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
import { LoaderIcon } from 'react-hot-toast';
import { opaqueBackgroundColor } from '../../utils/constants';

export const SwapAmounts = ({}) => {
    const { isMobile } = useWindowSize();
    const router = useRouter();
    const fontSize = isMobile ? '20px' : '20px';
    const btcInputSwapAmount = useStore((state) => state.btcInputSwapAmount);
    const usdtOutputSwapAmount = useStore((state) => state.usdtOutputSwapAmount);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const swapReservationNotFound = useStore((state) => state.swapReservationNotFound);

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;

    return (
        <>
            {btcInputSwapAmount === '-1' || usdtOutputSwapAmount === '-1' ? (
                swapReservationNotFound ? null : (
                    <Flex
                        {...opaqueBackgroundColor}
                        borderWidth={3}
                        borderColor={colors.borderGray}
                        borderRadius={'full'}
                        h='88px'
                        px={'35px'}
                        fontFamily={FONT_FAMILIES.AUX_MONO}
                        fontWeight={'normal'}
                        py='3px'>
                        <Flex align={'center'} justify={'center'}>
                            <Spinner size='lg' thickness='3px' color={colors.textGray} speed='0.65s' />
                        </Flex>
                    </Flex>
                )
            ) : (
                <Flex
                    borderRadius={'full'}
                    h='88px'
                    {...opaqueBackgroundColor}
                    borderWidth={3}
                    borderColor={colors.borderGray}
                    px={'40px'}
                    fontFamily={FONT_FAMILIES.AUX_MONO}
                    fontWeight={'normal'}
                    boxShadow={'0px 0px 20px 5px rgba(0, 0, 0, 0.3)'}
                    py='3px'>
                    <Flex direction='column'>
                        <Flex>
                            <Text mr='15px' fontSize={'36px'} letterSpacing={'-5px'} color={colors.offWhite}>
                                {btcInputSwapAmount === '-1' ? 'Loading...' : btcInputSwapAmount}
                            </Text>
                            <Flex mt='-14px' mb='-9px'>
                                <AssetTag assetName='BTC' width='79px' />
                            </Flex>
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
                    <Flex align='center' ml='-4px' mr='-5px' mt='-2px' justify={'center'}>
                        <MdArrowRight size={'50px'} color={colors.darkerGray} />
                    </Flex>
                    <Spacer />
                    <Flex direction='column'>
                        <Flex>
                            <Text mr='15px' fontSize={'36px'} letterSpacing={'-5px'} color={colors.offWhite}>
                                {usdtOutputSwapAmount === '-1' ? 'Loading...' : usdtOutputSwapAmount}
                            </Text>
                            <Flex mt='-14px' mb='-9px'>
                                <AssetTag assetName='ARBITRUM_USDT' width='108px' />
                            </Flex>{' '}
                        </Flex>
                        <Text color={colors.textGray} fontSize={'13px'} mt='-10.5px' ml='6px' letterSpacing={'-2px'} fontWeight={'normal'} fontFamily={'Aux'}>
                            ≈ $
                            {(parseFloat(usdtOutputSwapAmount) * useStore.getState().validAssets[selectedInputAsset.name].priceUSD).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}{' '}
                            USD{' '}
                        </Text>
                    </Flex>
                </Flex>
            )}
        </>
    );
};
