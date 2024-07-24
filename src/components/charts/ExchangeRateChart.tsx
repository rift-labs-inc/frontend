import { Flex, Text } from '@chakra-ui/react';
import { FONT_FAMILIES } from '../../utils/font';
import { colors } from '../../utils/colors';
interface ExchangeRateChartProps {}
const ExchangeRateChart: React.FC<ExchangeRateChartProps> = () => {
    const rangeStart = -1;
    const rangeEnd = 10;
    const rangeInterval = 1;

    const range = rangeEnd - rangeStart;
    const numRangeIntervals = Math.floor(range / rangeInterval) + 1;
    const numTotalIntervals = numRangeIntervals * 2;

    const graphDataArray = [
        { x: -1, y: 0 },
        { x: -0.5, y: 30 },
        { x: 0, y: 80 },
        { x: 0.5, y: 90 },
        { x: 1, y: 98 },
        { x: 1.5, y: 70 },
        { x: 2, y: 70 },
        { x: 2.5, y: 60 },
        { x: 3, y: 80 },
        { x: 3.5, y: 40 },
        { x: 4, y: 50 },
        { x: 4.5, y: 40 },
        { x: 5, y: 30 },
        { x: 5.5, y: 30 },
        { x: 6, y: 25 },
        { x: 6.5, y: 20 },
        { x: 7, y: 10 },
        { x: 7.5, y: 10 },
        { x: 8, y: 20 },
        { x: 8.5, y: 5 },
        { x: 9, y: 5 },
        { x: 9.5, y: 0 },
        { x: 10, y: 0 },
    ];

    const xAxis = Array.from({ length: numRangeIntervals }, (_, i) => rangeStart + rangeInterval * i);
    const yAxis = graphDataArray.map((x) => x.y);

    const percentToOffset = (exchangeRate: number) => {
        if (exchangeRate < rangeStart) return 0;
        else if (exchangeRate > rangeEnd) return 100;
        else return ((exchangeRate - rangeStart) / range) * 100;
    };

    const exchangeRate = 2;

    return (
        <Flex w='100%' flexDir='column' position='relative'>
            <Flex position='absolute' top='0' right='0' gap='10px' flexDir='column'>
                <Flex bg='#420F0F' border='2px solid #B94040' borderRadius='10px' p='6px 8px' flexDir='column' textAlign='center'>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='0.8rem' letterSpacing='-1px'>
                        Market Rate
                    </Text>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='0.7rem' color={colors.textGray} letterSpacing='-1px'>
                        1 BTC ≈ 18.485204 ETH
                    </Text>
                </Flex>
                <Flex bg='#161A33' border='2px solid #445BCB' borderRadius='10px' p='6px 8px' flexDir='column' textAlign='center'>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='0.8rem' letterSpacing='-1px'>
                        Your Exchange Rate
                    </Text>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='0.7rem' color={colors.textGray} letterSpacing='-1px'>
                        1 BTC ≈ 22.1332 ETH
                    </Text>
                </Flex>
            </Flex>
            <Flex flex={1} gap='3px' align='flex-end' position='relative'>
                {/* Your Exchange Rate Bar */}
                <Flex
                    position='absolute'
                    h='100%'
                    flexDir='column'
                    justify='center'
                    align='center'
                    ml={`${percentToOffset(exchangeRate)}%`}
                    zIndex={30}>
                    <Flex w='7px' h='7px' borderRadius='5px' mb='-3px' bg='#465FF9' />
                    <Flex w='3px' flex={1} bg='#465FF9' />
                </Flex>
                {yAxis.map((x, i) => (
                    <Flex w='100%' h='100%' position='relative' align='flex-end'>
                        {/* Market Rate Bar */}
                        {i == 2 && (
                            <Flex position='absolute' left='0px' h='100%'>
                                <Flex w='11px' h='4px' borderRadius='5px' bg='#D65252' left='-4px' position='absolute' />
                                <Flex w='3px' h='100%' bg='#D65252' position='absolute' />
                            </Flex>
                        )}
                        <Flex bg={colors.graph.darkGreen} h={`${x}%`} w='100%' borderTopRadius='10px' />
                    </Flex>
                ))}
            </Flex>
            <Flex h='4px' mb='2px' borderRadius='40px' bg={colors.graph.lightGreen} w='100%' />
            <Flex justify='space-between' w='100%'>
                {xAxis.map((x) => (
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='0.9rem' color={colors.textGray}>
                        {x}%
                    </Text>
                ))}
            </Flex>
        </Flex>
    );
};

export default ExchangeRateChart;
