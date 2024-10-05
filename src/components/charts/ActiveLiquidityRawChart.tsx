import { Flex, Text } from '@chakra-ui/react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart } from 'recharts';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import moment from 'moment';

interface ActiveLiquidityRawChartProps {}

interface DataPoint {
    date: Date;
    global: number;
}

const generateData = (): DataPoint[] => {
    const startDate = new Date('2/20/2024');
    const today = new Date();
    const data: DataPoint[] = [];

    const totalDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const peakDay = Math.floor(totalDays * 0.6); // Peak at 60% of the time range
    const baseValue = 18;
    const peakValue = 98;

    const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    for (let day = 0; day < totalDays; day++) {
        const currentDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);

        let progress: number;
        if (day <= peakDay) {
            progress = easeInOutCubic(day / peakDay); // Curved rise to peak
        } else if (day > totalDays - 10) {
            // Slight uptick in the last 10 days
            const daysFromEnd = totalDays - day;
            progress = 0.2 + (0.15 * (10 - daysFromEnd)) / 10; // 0.2 to 0.35
        } else {
            progress = (0.8 * (totalDays - day)) / (totalDays - peakDay); // Faster drop after peak
        }

        const value = baseValue + Math.round((peakValue - baseValue) * progress);

        data.push({
            date: currentDate,
            global: value + Math.floor(Math.random() * 5) - 2, // Larger random fluctuation
        });
    }

    return data;
};

const ActiveLiquidityRawChart: React.FC<ActiveLiquidityRawChartProps> = () => {
    const data = generateData();

    return (
        <Flex>
            <ResponsiveContainer height={300} width='100%'>
                <AreaChart data={data}>
                    <XAxis
                        dataKey='date'
                        style={{ fontFamily: FONT_FAMILIES.AUX_MONO, fontSize: '0.7rem', fontWeight: '300' }}
                        tickFormatter={(unixTimestamp) => {
                            return moment(unixTimestamp).format('MMM YY');
                        }}
                    />
                    <Tooltip />
                    <Area type='linear' dataKey='global' stroke={null} fill={colors.RiftOrange} fillOpacity={1} />
                </AreaChart>
            </ResponsiveContainer>
        </Flex>
    );
};

export default ActiveLiquidityRawChart;
