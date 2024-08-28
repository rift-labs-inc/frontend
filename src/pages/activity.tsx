import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { Flex, Spacer, Text, Box, Input, Button, InputGroup, InputRightElement, Tooltip } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';
import { colors } from '../utils/colors';
import { IoCheckbox } from 'react-icons/io5';
import { useState } from 'react';
import { MdOutlineCheckBoxOutlineBlank } from 'react-icons/md';
import { FaCheckSquare } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { useStore } from '../store';
import { toastSuccess } from '../hooks/toast';
import { BTCSVG, ETHArrow, WBTCSVG, BTCArrow, GreenCheck } from '../components/other/SVGs';
import { OpenGraph } from '../components/background/OpenGraph';
import SwapTable from '../components/activity/SwapTable';
import useHorizontalSelectorInput from '../hooks/useHorizontalSelectorInput';
import HorizontalButtonSelector from '../components/HorizontalButtonSelector';
import ActivityChartContainer from '../components/charts/ActivityChartContainer';
import ActiveLiquidityRawChart from '../components/charts/ActiveLiquidityRawChart';
import MonthlyValueRawChart from '../components/charts/MonthlyValueRawChart';

const Activity = () => {
    const { height, width } = useWindowSize();
    const isSmallScreen = width < 1200;
    const router = useRouter();
    const handleNavigation = (route: string) => {
        router.push(route);
    };
    // const activityData = useStore((state) => state.activityData);

    const [showMyActivity, setShowMyActivity] = useState(false);

    const {
        options: optionsButton,
        selected: selectedButton,
        setSelected: setSelectedButton,
    } = useHorizontalSelectorInput(['Swaps', 'Deposits'] as const);

    return (
        <>
            <OpenGraph title='Activity' />
            <Flex
                h='100vh'
                width='100%'
                direction='column'
                backgroundImage={'/images/rift_background_low.webp'}
                backgroundSize='cover'
                backgroundPosition='center'>
                <Navbar />
                <Flex direction={'column'} align='center' w='100%' h='100%' mt='105px'>
                    {/* LOGOS & TEXT */}
                    <Flex direction={'column'} align='center' w='100%'>
                        <Flex
                            sx={{
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                            }}
                            bgGradient={`linear(90deg, #FF8F28, #394AFF)`}
                            letterSpacing={'2px'}
                            mt='-25px'>
                            <Text
                                userSelect={'none'}
                                fontSize='46px'
                                fontFamily={'Klein'}
                                fontWeight='bold'
                                px='12px'
                                as='h1'>
                                Activity
                            </Text>
                        </Flex>
                        <Text
                            userSelect={'none'}
                            fontSize='13px'
                            fontFamily={'Aux'}
                            color={'#c3c3c3'}
                            mt='5px'
                            textAlign={'center'}
                            mb='20px'
                            fontWeight={'normal'}
                            textShadow={'0px 0px 4px rgba(0, 0, 0)'}
                            as='h2'>
                            Manage current swaps and previous bridge activity.
                        </Text>
                    </Flex>
                    <Flex w='100%' maxW='1200px' gap='12px' px='20px'>
                        <ActivityChartContainer title='Active Liquidity' value='329,343.32'>
                            <ActiveLiquidityRawChart />
                        </ActivityChartContainer>
                        <ActivityChartContainer title='Monthly Volume' value='$21.23B'>
                            <MonthlyValueRawChart />
                        </ActivityChartContainer>
                    </Flex>
                    <Flex mt='52px' mb='20px'>
                        <HorizontalButtonSelector
                            options={optionsButton}
                            selectedItem={selectedButton}
                            onSelectItem={setSelectedButton}
                            h='40px'
                        />
                    </Flex>
                    <Flex w='100%' maxW='1200px' gap='12px' px='20px'>
                        <SwapTable />
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

const copyToClipboard = (content: string, successText?: string | undefined) => {
    const text = successText ? successText : 'Contract address copied to clipboard.';
    navigator.clipboard.writeText(content);
    toastSuccess({ title: text });
};

function formatAmount(amount) {
    const num = parseFloat(amount);
    const numStr = num.toString();
    const decimalIndex = numStr.indexOf('.');
    if (decimalIndex !== -1) {
        const decimalPlaces = numStr.length - decimalIndex - 1;
        if (decimalPlaces > 6) {
            return num.toFixed(6);
        }
    }
    return numStr;
}

const timeAgo = (unixTimestamp) => {
    const seconds = Math.floor(
        // @ts-ignore
        (new Date() - new Date(unixTimestamp * 1000)) / 1000,
    );

    let interval = seconds / 86400; // days
    if (interval >= 1) {
        const days = Math.floor(interval);
        return days === 1 ? '1 day ago' : `${days} days ago`;
    }

    interval = seconds / 3600; // hours
    if (interval >= 1) {
        const hours = Math.floor(interval);
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }

    interval = seconds / 60; // minutes
    if (interval >= 1) {
        const minutes = Math.floor(interval);
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }

    return seconds === 1 ? '1 second ago' : `${Math.floor(seconds)} seconds ago`;
};

export default Activity;
