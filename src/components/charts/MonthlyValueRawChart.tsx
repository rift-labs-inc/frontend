import { Flex } from '@chakra-ui/react';
import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts';
import { colors } from '../../utils/colors';
import moment from 'moment';
import { FONT_FAMILIES } from '../../utils/font';

interface MonthlyValueRawChartProps {}

const generateData = () => {
    let date = new Date('2/20/2024');
    const data = [];
    const today = new Date();

    let count = 0;
    const maxCount = 30;

    while (true) {
        data.push({
            date: new Date(date),
            user: Math.floor(Math.random() * 10) + 4,
            global: Math.floor(Math.random() * 91) + 10,
        });

        // Increment date by 1 day
        date.setDate(date.getDate() + 7);
        count += 1;

        // Escape case is when the date is today
        if (count > maxCount) {
            break;
        }
    }

    return data;
};

const MonthlyValueRawChart: React.FC<MonthlyValueRawChartProps> = () => {
    const data = generateData();
    console.log('data', data);

    const barRadius = 3;

    return (
        <Flex>
            <ResponsiveContainer height={300} width='100%'>
                <BarChart data={data} barSize={20}>
                    <XAxis
                        dataKey='date'
                        tickFormatter={(unixTimestamp) => {
                            console.log(unixTimestamp);
                            return moment(unixTimestamp).format('MMM YY');
                        }}
                        style={{ fontFamily: FONT_FAMILIES.AUX_MONO, fontSize: '0.7rem', fontWeight: '300' }}
                    />
                    {/* <Bar dataKey='user' stackId='a' fill={colors.graph.blue} radius={[0, 0, barRadius, barRadius]} /> */}
                    <Bar dataKey='global' stackId='a' fill={colors.graph.blue} radius={[barRadius, barRadius, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Flex>
    );
};

export default MonthlyValueRawChart;
