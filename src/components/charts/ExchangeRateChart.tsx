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

    return (
        <Flex w='100%' flexDir='column'>
            <Flex flex={1} gap='3px' align='flex-end'>
                {yAxis.map((x, i) => (
                    <Flex w='100%' h='100%' position='relative' align='flex-end'>
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
