import React from 'react';
import { Flex, Text, Spacer } from '@chakra-ui/react';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import CircleFlex from '../other/CircleFlex';
import { useStore } from '../../store';
import { bitcoin_bg_color } from '../../utils/constants';

export const SwapStatusTimeline: React.FC = () => {
    const swapFlowState = useStore((state) => state.swapFlowState);

    return (
        <Flex
            width='100%'
            bg='#0C140E'
            border='3px solid'
            borderColor='#3D5A44'
            borderRadius='25px'
            h='140px'
            direction='column'
            px='30px'
            fontFamily={FONT_FAMILIES.AUX_MONO}
            fontWeight='normal'
            py='15px'>
            <Flex w='100%'>
                {/* ReserveLiquidity */}
                <Flex direction='column'>
                    <Text
                        fontFamily={FONT_FAMILIES.AUX_MONO}
                        color={swapFlowState === '1-reserve-liquidity' ? colors.RiftOrange : swapFlowState !== '0-not-started' ? colors.greenOutline : colors.textGray}
                        letterSpacing='-2px'>
                        STEP 1
                    </Text>
                    <Text
                        fontFamily={FONT_FAMILIES.NOSTROMO}
                        color={swapFlowState === '1-reserve-liquidity' ? colors.RiftOrange : swapFlowState !== '0-not-started' ? colors.greenOutline : colors.textGray}
                        fontSize='22px'>
                        RESERVE LIQUIDITY
                    </Text>
                </Flex>
                <Spacer />

                {/* SendBitcoin */}
                <Flex direction='column'>
                    <Text
                        fontFamily={FONT_FAMILIES.AUX_MONO}
                        color={
                            swapFlowState === '2-send-bitcoin'
                                ? colors.RiftOrange
                                : swapFlowState !== '0-not-started' && swapFlowState !== '1-reserve-liquidity'
                                ? colors.greenOutline
                                : colors.textGray
                        }
                        letterSpacing='-2px'>
                        STEP 2
                    </Text>
                    <Text
                        fontFamily={FONT_FAMILIES.NOSTROMO}
                        color={
                            swapFlowState === '2-send-bitcoin'
                                ? colors.RiftOrange
                                : swapFlowState !== '0-not-started' && swapFlowState !== '1-reserve-liquidity'
                                ? colors.greenOutline
                                : colors.textGray
                        }
                        fontSize='22px'>
                        SEND BITCOIN
                    </Text>
                </Flex>
                <Spacer />

                {/* ReceiveUSDT */}
                <Flex direction='column' mr='70px'>
                    <Text
                        fontFamily={FONT_FAMILIES.AUX_MONO}
                        color={swapFlowState === '3-receive-eth' ? colors.RiftOrange : swapFlowState === '4-completed' ? colors.greenOutline : colors.textGray}
                        letterSpacing='-2px'>
                        STEP 3
                    </Text>
                    <Text
                        fontFamily={FONT_FAMILIES.NOSTROMO}
                        color={swapFlowState === '3-receive-eth' ? colors.RiftOrange : swapFlowState === '4-completed' ? colors.greenOutline : colors.textGray}
                        fontSize='22px'>
                        RECEIVE USDT
                    </Text>
                </Flex>
            </Flex>

            <Flex mt='10px'>
                <Flex zIndex={2} mt={swapFlowState === '1-reserve-liquidity' ? '0px' : '-9.5px'}>
                    <CircleFlex state={swapFlowState !== '1-reserve-liquidity' ? 'completed' : 'current'} />
                </Flex>
                <Flex
                    mt='10px'
                    h='10px'
                    w='37.7%'
                    mx='-5px'
                    bg={swapFlowState !== '0-not-started' && swapFlowState !== '1-reserve-liquidity' ? colors.greenBackground : colors.offBlackLighter3}></Flex>
                <Flex zIndex={2} mt={swapFlowState === '1-reserve-liquidity' || swapFlowState === '0-not-started' || swapFlowState === '2-send-bitcoin' ? '0px' : '-9px'}>
                    <CircleFlex
                        state={
                            swapFlowState === '2-send-bitcoin'
                                ? 'current'
                                : swapFlowState !== '0-not-started' && swapFlowState !== '1-reserve-liquidity'
                                ? 'completed'
                                : 'not-started'
                        }
                    />
                </Flex>
                <Flex
                    mt='10px'
                    h='10px'
                    w='30.2%'
                    mx='-5px'
                    bg={
                        swapFlowState !== '0-not-started' && swapFlowState !== '1-reserve-liquidity' && swapFlowState !== '2-send-bitcoin'
                            ? colors.greenBackground
                            : colors.offBlackLighter3
                    }></Flex>
                <Flex zIndex={2} mt={swapFlowState !== '4-completed' ? '0px' : '-9px'}>
                    <CircleFlex state={swapFlowState === '3-receive-eth' ? 'current' : swapFlowState === '4-completed' ? 'completed' : 'not-started'} />
                </Flex>
                <Flex
                    mt='10px'
                    h='10px'
                    w='25%'
                    mx='-5px'
                    borderRadius={'0px 10px 10px 0px'}
                    bg={swapFlowState === '4-completed' ? colors.greenBackground : colors.offBlackLighter3}></Flex>
            </Flex>
        </Flex>
    );
};
