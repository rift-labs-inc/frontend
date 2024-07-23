import {
    Tabs,
    TabList,
    Tooltip,
    TabPanels,
    Tab,
    Button,
    Flex,
    Text,
    useColorModeValue,
    Box,
    Spacer,
    Input,
} from '@chakra-ui/react';
import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../utils/colors';
import { BTCSVG, ETHSVG, InfoSVG } from './SVGs';

type ActiveTab = 'swap' | 'liquidity';

export const SwapUI = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const [activeTab, setActiveTab] = useState<ActiveTab>('swap');
    const [btcSwapAmount, setBtcSwapAmount] = useState('');
    const [ethSwapAmount, setEthSwapAmount] = useState('');
    const [btcToEthRate, setBtcToEthRate] = useState();
    const [ethDepositAmount, setEthDepositAmount] = useState('');
    const [lpFee, setLpFee] = useState('');
    const [payoutETHAddress, setPayoutETHAddress] = useState('');
    const [payoutBTCAddress, setPayoutBTCAddress] = useState('');
    const [currentETHLiquidity, setCurrentETHLiquidity] = useState();
    const [asset1PriceUSD, setasset1PriceUSD] = useState();
    const [asset2PriceUSD, setasset2PriceUSD] = useState();
    const [lpDepositAsset, setLPDepositAsset] = useState();
    const [lpDepositAssetPriceUSD, setLPDepositAssetPriceUSD] = useState();

    useEffect(() => {
        const fetchPricesAndRate = async () => {
            try {
                const response = await fetch(
                    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eth',
                );
                const data = await response.json();
                if (data.bitcoin && data.bitcoin.usd) {
                    setasset1PriceUSD(data.bitcoin.usd); // Bitcoin price in USD
                }
                if (data.ethereum && data.ethereum.usd) {
                    setasset2PriceUSD(data.ethereum.usd); // Ethereum price in USD
                    setLPDepositAssetPriceUSD(data.ethereum.usd);
                }
                if (data.bitcoin && data.bitcoin.eth) {
                    setBtcToEthRate(data.bitcoin.eth); // exchange rate of Bitcoin in Ethereum
                }
            } catch (error) {
                console.error('Failed to fetch prices and exchange rate:', error);
            }
        };

        fetchPricesAndRate();
    }, []);

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const handleTabClick = (tabName: ActiveTab) => {
        setActiveTab(tabName);
    };

    const validateSwapInput = (value) => {
        if (value === '') return true;
        const regex = /^\d*\.?\d*$/;
        return regex.test(value);
    };

    const handleBtcChange = (e) => {
        const btcValue = e.target.value;
        if (validateSwapInput(btcValue)) {
            setBtcSwapAmount(btcValue);
            const ethValue = btcValue && parseFloat(btcValue) > 0 ? (parseFloat(btcValue) * 18.485204).toFixed(8) : '';
            setEthSwapAmount(ethValue);
        }
    };

    const handleEthSwapChange = (e) => {
        const ethValue = e.target.value;
        if (validateSwapInput(ethValue)) {
            setEthSwapAmount(ethValue);
            const btcValue = ethValue && parseFloat(ethValue) > 0 ? (parseFloat(ethValue) / 18.485204).toFixed(8) : '';
            setBtcSwapAmount(btcValue);
        }
    };

    const validateDepositInput = (value) => {
        if (value === '') return true;
        const regex = /^-?\d*(\.\d{0,2})?$/;
        return regex.test(value);
    };

    const handleEthDepositChange = (e) => {
        const ethValue = e.target.value;
        if (validateSwapInput(ethValue)) {
            setEthDepositAmount(ethValue);
        }
    };

    const handleLPFeeChange = (e) => {
        const LPFeeValue = e.target.value.replace('%', '');
        if (validateDepositInput(LPFeeValue)) {
            setLpFee(LPFeeValue);
        }
    };

    const handleLPFeeFocus = (e) => {
        const LPFeeValue = e.target.value.replace('%', '');
        setLpFee(LPFeeValue);
    };

    const handleLPFeeBlur = () => {
        if (lpFee !== '') {
            setLpFee(`${lpFee}%`);
        }
    };

    const handleBTCPayoutAddressChange = (e) => {
        const BTCPayoutAddress = e.target.value;
        setPayoutBTCAddress(BTCPayoutAddress);
    };

    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;

    const isSwapTab = activeTab == 'swap';

    return (
        <Flex width='600px' mt='30px' direction={'column'} overflow='hidden'>
            {/* Content */}
            <Flex
                direction='column'
                align='center'
                py='25px'
                borderRadius='20px'
                {...backgroundColor}
                borderBottom={borderColor}
                borderLeft={borderColor}
                borderTop={borderColor}
                borderRight={borderColor}>
                <Flex w='90%' direction={'column'}>
                    {/* Inputs */}
                    <Flex w='100%' flexDir='column' position='relative'>
                        {/* BTC Input */}
                        <Flex px='10px' bg='#2E1C0C' w='100%' h='105px' border='2px solid #78491F' borderRadius={'10px'}>
                            <Flex direction={'column'} py='10px' px='5px'>
                                <Text
                                    color={!btcSwapAmount ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    You Send
                                </Text>
                                <Input
                                    value={btcSwapAmount}
                                    onChange={handleBtcChange}
                                    fontFamily={'Aux'}
                                    border='none'
                                    mt='2px'
                                    mr='-150px'
                                    ml='-5px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='40px'
                                    placeholder='0.0'
                                    _placeholder={{ color: colors.darkerGray }}
                                />
                                <Text
                                    color={!btcSwapAmount ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    mt='2px'
                                    ml='1px'
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    {asset1PriceUSD
                                        ? btcSwapAmount
                                            ? (asset1PriceUSD * parseFloat(btcSwapAmount)).toLocaleString('en-US', {
                                                  style: 'currency',
                                                  currency: 'USD',
                                              })
                                            : '$0.00'
                                        : '$0.00'}
                                </Text>
                            </Flex>
                            <Spacer />
                            <Flex mt='18px' mr='-25px'>
                                <BTCSVG width='128' height='80' viewBox='0 0 170 69' />
                            </Flex>
                        </Flex>

                        {/* Switch Button */}
                        <Flex
                            w='30px'
                            h='30px'
                            borderRadius={'20%'}
                            alignSelf={'center'}
                            align={'center'}
                            justify={'center'}
                            cursor={'pointer'}
                            _hover={{ bg: '#232323' }}
                            onClick={() => setActiveTab('liquidity')}
                            position={'absolute'}
                            bg='#161616'
                            border='2px solid #323232'
                            top='50%'
                            left='50%'
                            transform='translate(-50%, -50%)'>
                            <svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 20 20'>
                                <path
                                    fill='#909090'
                                    fill-rule='evenodd'
                                    d='M2.24 6.8a.75.75 0 0 0 1.06-.04l1.95-2.1v8.59a.75.75 0 0 0 1.5 0V4.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L2.2 5.74a.75.75 0 0 0 .04 1.06m8 6.4a.75.75 0 0 0-.04 1.06l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75a.75.75 0 0 0-1.5 0v8.59l-1.95-2.1a.75.75 0 0 0-1.06-.04'
                                    clip-rule='evenodd'
                                />
                            </svg>
                        </Flex>
                        {/* ETH Output */}
                        <Flex mt='5px' px='10px' bg='#161A33' w='100%' h='105px' border='2px solid #303F9F' borderRadius={'10px'}>
                            <Flex direction={'column'} py='10px' px='5px'>
                                <Text
                                    color={!ethSwapAmount ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    You Receive
                                </Text>
                                <Input
                                    value={ethSwapAmount}
                                    onChange={handleEthSwapChange}
                                    fontFamily={'Aux'}
                                    border='none'
                                    mt='2px'
                                    mr='-150px'
                                    ml='-5px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='40px'
                                    placeholder='0.0'
                                    _placeholder={{ color: colors.darkerGray }}
                                />
                                <Text
                                    color={!ethSwapAmount ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    mt='2px'
                                    ml='1px'
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    {asset2PriceUSD
                                        ? ethSwapAmount
                                            ? (asset2PriceUSD * parseFloat(ethSwapAmount)).toLocaleString('en-US', {
                                                  style: 'currency',
                                                  currency: 'USD',
                                              })
                                            : '$0.00'
                                        : '$0.00'}
                                </Text>
                            </Flex>
                            <Spacer />
                            <Flex mt='18px' mr='-25px'>
                                <ETHSVG width='128' height='80' viewBox='0 0 170 69' />
                            </Flex>
                        </Flex>
                    </Flex>
                    {/* Rate/Liquidity Details */}
                    <Flex mt='12px'>
                        <Text
                            color={colors.textGray}
                            fontSize={'13px'}
                            ml='3px'
                            letterSpacing={'-1.5px'}
                            fontWeight={'normal'}
                            fontFamily={'Aux'}>
                            1 BTC ≈ {btcToEthRate} ETH{' '}
                            <Box
                                as='span'
                                color={colors.textGray}
                                _hover={{
                                    cursor: 'pointer',
                                    //open popup about fee info
                                }}
                                letterSpacing={'-1.5px'}
                                style={{
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '6px',
                                }}></Box>
                        </Text>
                        <Spacer />
                        <Flex
                            ml='-3px'
                            color={colors.textGray}
                            fontSize={'13px'}
                            mr='3px'
                            letterSpacing={'-1.5px'}
                            fontWeight={'normal'}
                            fontFamily={'Aux'}>
                            <Tooltip
                                fontFamily={'Aux'}
                                letterSpacing={'-0.5px'}
                                color={colors.offWhite}
                                bg={'#121212'}
                                fontSize={'12px'}
                                label='Exchange rate includes the hypernode, protocol, and LP Fees. There are no additional or hidden fees.'
                                aria-label='A tooltip'>
                                <Flex ml='8px' mt='-2px' cursor={'pointer'} userSelect={'none'}>
                                    <Text
                                        color={colors.textGray}
                                        fontSize={'13px'}
                                        mr='8px'
                                        mt='1px'
                                        letterSpacing={'-1.5px'}
                                        fontWeight={'normal'}
                                        fontFamily={'Aux'}>
                                        Including Fees
                                    </Text>
                                    <InfoSVG width='13' />
                                </Flex>
                            </Tooltip>
                        </Flex>
                    </Flex>
                    {/* Exchange Button */}

                    <Flex
                        bg={ethSwapAmount ? colors.purpleBackground : colors.purpleBackgroundDisabled}
                        _hover={{ bg: colors.purpleHover }}
                        w='100%'
                        mt='15px'
                        transition={'0.2s'}
                        h='45px'
                        onClick={ethSwapAmount ? () => handleNavigation('/') : null}
                        fontSize={'15px'}
                        align={'center'}
                        userSelect={'none'}
                        cursor={'pointer'}
                        borderRadius={'10px'}
                        justify={'center'}
                        border={ethSwapAmount ? '3px solid #445BCB' : '3px solid #3242a8'}>
                        <Text color={ethSwapAmount ? colors.offWhite : colors.darkerGray} fontFamily='Nostromo'>
                            Exchange
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};
