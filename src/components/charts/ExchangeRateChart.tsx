import { Flex, Text } from '@chakra-ui/react';
import { FONT_FAMILIES } from '../../utils/font';
import { colors } from '../../utils/colors';
import { useEffect, useRef, useState } from 'react';
import { DepositVault } from '../../types';
import { useStore } from '../../store';
import { ethToWei } from '../../utils/dappHelper';
import { BigNumber } from 'ethers';
import { normalize } from 'path';
import { SATS_PER_BTC } from '../../utils/constants';

type GraphBar = { x: number; y: number };
type GraphData = GraphBar[];

const calculateSellChart = (depositVaults: DepositVault[]): GraphData => {
    // Prepare market rate to WEI per SAT
    // const marketExchangeRate = useStore.getState().btcToEthExchangeRate; // ETH per BTC // TODO: Fix This!!
    const marketExchangeRate = 23.99;
    const convertedMarketRate = ethToWei(marketExchangeRate.toString()).div(SATS_PER_BTC).toNumber(); // WEI per SAT

    // Prepare data map for percent -> balance
    const dataMap = new Map<number, number>();
    let maxY = 0;

    // Iterate vaults
    for (const vault of depositVaults) {
        // Get every rate and balance from each vault
        const btcRate = parseFloat(vault.btcExchangeRate.toString()); // WEI per SAT
        const initialRate = Math.ceil(((btcRate - convertedMarketRate) / convertedMarketRate) * 100);
        const rate = initialRate == 0 ? initialRate : -initialRate;
        const balance = Number(BigNumber.from(vault.trueUnreservedBalance.toString()).div(SATS_PER_BTC));
        // console.log('Chart', rate, balance, ((btcRate - convertedMarketRate) / convertedMarketRate) * 100);

        // Update data map
        const currentBalance = dataMap.get(rate) ?? 0;
        const newBalance = currentBalance + balance;
        dataMap.set(rate, newBalance);

        // Update maxY for normalization
        if (newBalance > maxY) maxY = newBalance;
    }

    // Convert data map to array and normalize in one pass
    const normalizedDataArray: GraphData = Array.from(dataMap, ([x, y]) => ({
        x,
        y: (y / maxY) * 100,
    }));

    console.log('Chart', normalizedDataArray);
    /*
    [
    {
        "x": 0,
        "y": 100
    },
    {
        "x": 5,
        "y": 18.75
    },
    {
        "x": 3,
        "y": 36.25
    },
    {
        "x": 1,
        "y": 1.7500000000000002
    },
    {
        "x": -1,
        "y": 1
    },
    {
        "x": 10,
        "y": 2.5
    },
    {
        "x": 45,
        "y": 3.3333333333333335
    }
]
    */

    return normalizedDataArray;
};

interface ExchangeRateChartProps {
    graphData?: { x: number; y: number }[];
}

const ExchangeRateChart: React.FC<ExchangeRateChartProps> = ({ graphData }) => {
    const rangeStart = -1;
    const rangeEnd = 10;
    const rangeInterval = 1;

    const range = rangeEnd - rangeStart;
    const numRangeIntervals = Math.floor(range / rangeInterval) + 1;
    const numTotalIntervals = numRangeIntervals * 2;

    const graphDataArray = graphData ?? [
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

    const [exchangeRate, setExchangeRate] = useState(2);
    const [drag, setDrag] = useState(false);
    const [chartDimensions, setChartDimensions] = useState<DOMRect>();

    const allDepositVaults = useStore((state) => state.allDepositVaults);

    const chartRef = useRef<HTMLDivElement>(null);

    const exchangeRateToMarginOffset = () => {
        if (exchangeRate < rangeStart) return 0;
        else if (exchangeRate > rangeEnd) return 100;
        else return ((exchangeRate - rangeStart) / range) * 100;
    };

    const marginOffsetToExchangeRate = (offsetDecimal: number) => {
        const rate = offsetDecimal * range + rangeStart;
        setExchangeRate(rate);
    };

    useEffect(() => {
        if (chartRef && chartRef.current) {
            setChartDimensions(chartRef.current.getBoundingClientRect());
        }
    }, [chartRef]);

    useEffect(() => {
        calculateSellChart(allDepositVaults);
    }, []);

    return (
        <Flex w='100%' flexDir='column' position='relative' mt='20px'>
            <Flex position='absolute' top='0' right='0' gap='10px' flexDir='column'>
                <Flex
                    bg='#420F0F'
                    border='2px solid #B94040'
                    borderRadius='10px'
                    p='6px 8px'
                    flexDir='column'
                    textAlign='center'>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='0.8rem' letterSpacing='-1px'>
                        Market Rate
                    </Text>
                    <Text
                        fontFamily={FONT_FAMILIES.AUX_MONO}
                        fontSize='0.7rem'
                        color={colors.textGray}
                        letterSpacing='-1px'>
                        1 BTC ≈ 18.485204 ETH
                    </Text>
                </Flex>
                <Flex
                    bg='#161A33'
                    border='2px solid #445BCB'
                    borderRadius='10px'
                    p='6px 8px'
                    flexDir='column'
                    textAlign='center'>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='0.8rem' letterSpacing='-1px'>
                        Your Exchange Rate
                    </Text>
                    <Text
                        fontFamily={FONT_FAMILIES.AUX_MONO}
                        fontSize='0.7rem'
                        color={colors.textGray}
                        letterSpacing='-1px'>
                        1 BTC ≈ 22.1332 ETH
                    </Text>
                </Flex>
            </Flex>
            <Flex
                flex={1}
                gap='3px'
                align='flex-end'
                position='relative'
                onMouseUp={() => setDrag(false)}
                ref={chartRef}
                onClick={(e) => {
                    if (chartDimensions) {
                        const posX = e.clientX - chartDimensions.left;
                        const offset = posX / chartDimensions.width;
                        marginOffsetToExchangeRate(offset);
                    }
                }}
                onMouseMove={(e) => {
                    if (drag && chartDimensions) {
                        const posX = e.clientX - chartDimensions.left;
                        const offset = posX / chartDimensions.width;
                        marginOffsetToExchangeRate(offset);
                    }
                }}>
                {/* Your Exchange Rate Bar */}
                <Flex
                    position='absolute'
                    h='100%'
                    flexDir='column'
                    justify='center'
                    align='center'
                    ml={`${exchangeRateToMarginOffset()}%`}
                    zIndex={30}
                    onMouseDown={() => {
                        setDrag(true);
                    }}
                    onMouseUp={() => setDrag(false)}>
                    <Flex w='7px' h='7px' borderRadius='5px' mb='-3px' bg='#465FF9' />
                    <Flex w='3px' flex={1} bg='#465FF9' />
                </Flex>
                {yAxis.map((x, i) => (
                    <Flex key={i} w='100%' h='100%' position='relative' align='flex-end'>
                        {/* Market Rate Bar */}
                        {i == 2 && (
                            <Flex position='absolute' left='0px' h='100%'>
                                <Flex
                                    w='11px'
                                    h='4px'
                                    borderRadius='5px'
                                    bg='#D65252'
                                    left='-4px'
                                    position='absolute'
                                />
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
                    <Text key={x} fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='0.9rem' color={colors.textGray}>
                        {x}%
                    </Text>
                ))}
            </Flex>
        </Flex>
    );
};

export default ExchangeRateChart;
