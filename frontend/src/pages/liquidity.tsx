import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { Flex, Spacer, Text, Box, Input, Button, InputGroup, InputRightElement, Tooltip } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';
import colors from '../styles/colors';
import { IoCheckbox } from 'react-icons/io5';
import { useState } from 'react';
import { MdOutlineCheckBoxOutlineBlank } from 'react-icons/md';
import { FaCheckSquare } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { useStore } from '../store';
import { toastSuccess } from '../hooks/toast';
import { BTCSVG } from '../components/SVGs';
import { OpenGraph } from '../components/background/OpenGraph';
const Liquidity = () => {
    const { height, width } = useWindowSize();
    const isSmallScreen = width < 1200;
    const router = useRouter();
    const handleNavigation = (route: string) => {
        router.push(route);
    };
    const liquidityData = useStore((state) => state.liquidityData);

    const [sortLowestFee, setSortLowestFee] = useState(true);
    const [selectMultiple, setSelectMultiple] = useState(false);

    return (
        <>
            <OpenGraph title='Liquidity' />
            <Flex
                h='100vh'
                width='100%'
                direction='column'
                backgroundImage={'/images/rift_background.png'}
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
                            bgGradient={`linear(90deg, #394AFF, #FF8F28)`}
                            letterSpacing={'2px'}
                            mt='-25px'>
                            <Text userSelect={'none'} fontSize='46px' fontFamily={'Klein'} fontWeight='bold' px='12px' as='h1'>
                                Liquidi
                            </Text>
                            <Text
                                userSelect={'none'}
                                fontSize='46px'
                                fontFamily={'Klein'}
                                ml='-10px'
                                fontWeight='bold'
                                sx={{
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                }}
                                as='h1'>
                                ty
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
                            See avalible liquidity, sort by fees, or swap from multiple LPs at once.
                        </Text>
                    </Flex>
                    {/* SEARCH & ACTIVITY DATA */}
                    <Flex
                        mb='40px'
                        w='1000px'
                        bg='rgba(10, 10, 10, 0.6)'
                        backdropFilter={'blur(10px)'}
                        borderRadius={'8px'}
                        border={'2px solid #282828'}
                        align={'center'}
                        direction={'column'}
                        mt='55px'>
                        <Flex w='100%' mt='-55px' mb='8px' h='44px'>
                            <Flex w='100%' h='100%' border={'2px solid #282828'} borderRadius={'8px'} backdropFilter={'blur(10px)'}>
                                {/* SEARCHBAR */}
                                <InputGroup>
                                    <Input
                                        w='100%'
                                        h='100%'
                                        bg='rgba(15, 15, 15, 0.8)'
                                        fontFamily='Aux'
                                        pl='14px'
                                        fontSize='14px'
                                        border='none'
                                        boxShadow='none'
                                        outline='none'
                                        placeholder='Search by amount or address'
                                        _active={{ border: 'none', boxShadow: 'none' }}
                                        _focus={{ border: 'none', boxShadow: 'none' }}
                                        _selected={{ border: 'none', boxShadow: 'none' }}
                                        _placeholder={{ color: colors.textGray }}
                                    />
                                    <InputRightElement
                                        pointerEvents='none'
                                        cursor={'pointer'}
                                        mt='-3px'
                                        mr='4px'
                                        children={<FaSearch color={'#888'} />}
                                    />
                                </InputGroup>
                            </Flex>
                            <Flex
                                ml='6px'
                                w='240px'
                                borderRadius={'8px'}
                                onClick={() => setSelectMultiple(!selectMultiple)}
                                cursor={'pointer'}
                                userSelect={'none'}
                                h='100%'
                                bg={selectMultiple ? '#181D3D' : 'rgba(15, 15, 15, 0.8)'}
                                align={'center'}
                                border={selectMultiple ? '2px solid #445BCB' : '2px solid #282828'}>
                                <Flex direction={'column'} ml='15px' mr='9px'>
                                    <Text
                                        fontFamily={'Aux'}
                                        fontWeight={'normal'}
                                        color={!selectMultiple ? '#888888' : colors.offWhite}
                                        fontSize={'9px'}
                                        mt='1px'>
                                        Select mode
                                    </Text>
                                    <Text
                                        fontFamily={'Aux'}
                                        fontWeight={'normal'}
                                        color={!selectMultiple ? colors.offerWhite : colors.offWhite}
                                        fontSize={'13px'}
                                        mt='-2px'>
                                        Swap Multiple
                                    </Text>
                                </Flex>
                                <Flex mt='1px'>
                                    {selectMultiple ? (
                                        <FaCheckSquare color='#829EEA' size={'16px'} />
                                    ) : (
                                        <MdOutlineCheckBoxOutlineBlank color={'#666'} size={'16px'} />
                                    )}
                                </Flex>
                            </Flex>
                            <Flex
                                ml='6px'
                                w='200px'
                                borderRadius={'8px'}
                                onClick={() => setSortLowestFee(!sortLowestFee)}
                                cursor={'pointer'}
                                userSelect={'none'}
                                h='100%'
                                bg={sortLowestFee ? '#181D3D' : 'rgba(15, 15, 15, 0.8)'}
                                align={'center'}
                                border={sortLowestFee ? '2px solid #445BCB' : '2px solid #282828'}>
                                <Flex direction={'column'} ml='15px' mr='9px'>
                                    <Text
                                        fontFamily={'Aux'}
                                        fontWeight={'normal'}
                                        color={!sortLowestFee ? '#888888' : colors.offWhite}
                                        fontSize={'9px'}
                                        mt='1px'>
                                        Sort by
                                    </Text>
                                    <Text
                                        fontFamily={'Aux'}
                                        fontWeight={'normal'}
                                        color={!sortLowestFee ? colors.offerWhite : colors.offWhite}
                                        fontSize={'13px'}
                                        mt='-2px'>
                                        Lowest Fee
                                    </Text>
                                </Flex>
                                <Flex mt='1px'>
                                    {sortLowestFee ? (
                                        <FaCheckSquare color='#829EEA' size={'16px'} />
                                    ) : (
                                        <MdOutlineCheckBoxOutlineBlank color={'#666'} size={'16px'} />
                                    )}
                                </Flex>
                            </Flex>
                        </Flex>
                        {/* ACTIVITY DATA */}
                        {height ? (
                            <Flex h={height - 300} w='100%'>
                                <Flex fontFamily='aux' letterSpacing={'-0.5px'} mt='18px' w='100%' direction='column'>
                                    {/* Data Headers */}
                                    <Flex
                                        pb='10px'
                                        w='100%'
                                        align='start'
                                        fontSize={'14px'}
                                        borderBottom='1px solid #333'
                                        color={colors.textGray}
                                        boxShadow={'0px 10px 12px rgba(0, 0, 0, 0.4)'}>
                                        <Flex ml='33px' align='start' fontSize={'14px'} color={colors.textGray}>
                                            {/* {
      "timestamp": "1649990500",
      "liquidity_provider": "0xf0178e462BE164ac1CB30935875A2c1D4610B788",
      "lp_fee": "0.7",
      "amount": "10.12",
      "asset": "WBTC",
      "status": "available"
    }, */}
                                            <Flex w='170px' textAlign='left'>
                                                <Text>Timestamp</Text>
                                            </Flex>
                                            <Flex w='180px' textAlign='left'>
                                                <Text>Provider</Text>
                                            </Flex>
                                            <Flex w='85px' textAlign='left'>
                                                <Text>Asset</Text>
                                            </Flex>
                                            <Flex w='125px' textAlign='left'>
                                                <Text>Amount</Text>
                                            </Flex>
                                            <Flex w='85px' textAlign='left'>
                                                <Text>LP Fee</Text>
                                            </Flex>
                                            <Flex w='100px' textAlign='left'>
                                                <Text>Status</Text>
                                            </Flex>
                                        </Flex>
                                    </Flex>

                                    {/* Data Rows */}
                                    <Flex
                                        direction='column'
                                        sx={{
                                            '&::-webkit-scrollbar': {
                                                display: 'none',
                                            },
                                            '-ms-overflow-style': 'none',
                                            'scrollbar-width': 'none',
                                        }}
                                        overflow='scroll'>
                                        {liquidityData.map((deposit, index) => (
                                            <Flex
                                                align='start'
                                                py='10px'
                                                w='100%'
                                                textAlign={'left'}
                                                fontSize={'14px'}
                                                borderTop={index != 0 ? '1px solid #333' : 'none'}>
                                                <Flex ml='33px' w='170px' textAlign='left'>
                                                    <Text color={colors.offerWhite}>{timeAgo(deposit.timestamp)}</Text>
                                                </Flex>
                                                <Flex w='180px' textAlign='left'>
                                                    <Text color={colors.textGray}>{formatAddress(deposit.lp)}</Text>
                                                </Flex>
                                                <Flex w='85px'>
                                                    <BTCSVG />
                                                </Flex>
                                                <Flex
                                                    w='125px'
                                                    color={colors.offerWhite}
                                                    textAlign='left'
                                                    cursor={'pointer'}
                                                    userSelect={'none'}
                                                    onClick={() => copyToClipboard(deposit.amount, 'Amount copied')}>
                                                    <Tooltip
                                                        fontFamily={'Aux'}
                                                        letterSpacing={'-0.5px'}
                                                        color={colors.textGray}
                                                        bg={'#121212'}
                                                        fontSize={'12px'}
                                                        label='Copy full amount'
                                                        aria-label='A tooltip'>
                                                        {formatAmount(deposit.amount)}
                                                    </Tooltip>
                                                </Flex>

                                                <Flex
                                                    w='85px'
                                                    textAlign='left'
                                                    cursor={'pointer'}
                                                    userSelect={'none'}
                                                    color={colors.textGray}
                                                    onClick={() => copyToClipboard(deposit.lp_fee, 'LP Fee copied')}>
                                                    <Tooltip
                                                        fontFamily={'Aux'}
                                                        letterSpacing={'-0.5px'}
                                                        color={colors.textGray}
                                                        bg={'#121212'}
                                                        fontSize={'12px'}
                                                        label='Copy full amount'
                                                        aria-label='A tooltip'>
                                                        {parseFloat(deposit.lp_fee).toFixed(2) + '%'}
                                                    </Tooltip>
                                                </Flex>
                                                <Flex w='100px' textAlign='left'>
                                                    {deposit.status == 'available' ? (
                                                        <Flex></Flex>
                                                    ) : (
                                                        <Text userSelect={'none'} color={deposit.status == 'available' ? '#238739' : colors.textGray}>
                                                            {deposit.status}
                                                        </Text>
                                                    )}
                                                </Flex>
                                            </Flex>
                                        ))}
                                    </Flex>
                                </Flex>
                            </Flex>
                        ) : (
                            <></>
                        )}
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

export default Liquidity;
