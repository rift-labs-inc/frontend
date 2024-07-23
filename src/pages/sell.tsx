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
import { BTCSVG } from '../components/SVGs';
import { OpenGraph } from '../components/background/OpenGraph';
import HorizontalButtonSelector from '../components/HorizontalButtonSelector';

const SortByFeesIcon = ({ sortLowestFee }: { sortLowestFee: boolean }) => {
    const color = sortLowestFee ? 'red' : '#2CAD39';
    const BAR_HEIGHT = '3px';

    return (
        <Flex gap='5px' w='24px' flexDir='column' mr='10px'>
            <Flex
                w={sortLowestFee ? '100%' : '50%'}
                h={BAR_HEIGHT}
                borderRadius='10px'
                bg={color}
                transition='0.2s all ease-in-out'
            />
            <Flex w={'75%'} h={BAR_HEIGHT} borderRadius='10px' bg={color} transition='0.2s all ease-in-out' />
            <Flex
                w={sortLowestFee ? '50%' : '100%'}
                h={BAR_HEIGHT}
                borderRadius='10px'
                bg={color}
                transition='0.2s all ease-in-out'
            />
        </Flex>
    );
};

const Sell = () => {
    const { height, width } = useWindowSize();
    const isSmallScreen = width < 1200;
    const router = useRouter();
    const handleNavigation = (route: string) => {
        router.push(route);
    };

    return (
        <>
            <OpenGraph title='Liquidity' />
            <Flex
                h='100vh'
                width='100%'
                direction='column'
                backgroundImage={'/images/rift_background_op.webp'}
                backgroundSize='cover'
                backgroundPosition='center'>
                <Navbar />
                <Flex direction={'column'} align='center' w='100%' h='100%' mt='195px'>
                    {/* LOGOS & TEXT */}
                    <Flex direction={'column'} align='center' w='100%'>
                        <Flex
                            sx={{
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                            }}
                            bgGradient={`linear(90deg, #394AFF, #FF8F28)`}
                            letterSpacing={'2px'}
                            mt='-25px'>
                            <Text userSelect={'none'} fontSize='56px' fontFamily={'Klein'} fontWeight='bold' px='12px' as='h1'>
                                Sell Ethereum
                            </Text>
                        </Flex>
                    </Flex>
                    {/* Horizontal Button Selector */}
                    <Flex mt={8}>
                        <HorizontalButtonSelector />
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

const formatAddress = (address) => {
    return `0x${address.slice(2, 7)}...${address.slice(-5)}`;
};

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

export default Sell;
