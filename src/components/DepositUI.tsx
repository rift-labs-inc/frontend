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

export const DepositUI = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const [activeTab, setActiveTab] = useState<ActiveTab>('swap');
    const [btcSwapAmount, setBtcSwapAmount] = useState('');
    const [btcToEthRate, setBtcToEthRate] = useState();
    const [ethDepositAmount, setEthDepositAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState('');
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

    const validateEthDepositChange = (value) => {
        if (value === '') return true;
        const regex = /^\d*\.?\d*$/;
        return regex.test(value);
    };

    const validateExchangeRate = (value) => {
        if (value === '') return true;
        const regex = /^\d*\.?\d*$/;
        return regex.test(value);
    };

    const handleEthDepositChange = (e) => {
        const ethValue = e.target.value;
        if (validateEthDepositChange(ethValue)) {
            setEthDepositAmount(ethValue);
        }
    };

    const handleExchangeRateChange = (e) => {
        const ExchangeRateValue = e.target.value;
        if (validateExchangeRate(ExchangeRateValue)) {
            setExchangeRate(ExchangeRateValue);
        }
    };

    const handleBTCPayoutAddressChange = (e) => {
        const BTCPayoutAddress = e.target.value;
        setPayoutBTCAddress(BTCPayoutAddress);
    };

    const calculateBTCAmount = () => {
        if (ethDepositAmount && exchangeRate) {
            const btcAmount = parseFloat(ethDepositAmount) / parseFloat(exchangeRate);
            return btcAmount.toFixed(8);
        }
        return '0.0';
    };

    const backgroundColor = { bg: 'rgba(20, 20, 20, 0.55)', backdropFilter: 'blur(8px)' };
    const actualBorderColor = '#323232';
    const borderColor = `2px solid ${actualBorderColor}`;

    const isSwapTab = activeTab == 'swap';

    return (
        <Flex width='600px' mt='25px' direction={'column'} overflow='hidden'>
            {/* Content */}
            <Flex direction='column' align='center'>
                <Flex w='100%' direction={'column'}>
                    {/* Deposit Input */}
                    <Flex mt='0px' px='10px' bg='#161A33' w='100%' h='105px' border='2px solid #303F9F' borderRadius={'10px'}>
                        <Flex direction={'column'} py='10px' px='5px'>
                            <Text
                                color={!ethDepositAmount ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                Deposit Amount{' '}
                            </Text>
                            <Input
                                value={ethDepositAmount}
                                onChange={handleEthDepositChange}
                                fontFamily={'Aux'}
                                border='none'
                                mt='2px'
                                mr='-100px'
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
                                color={!ethDepositAmount ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                mt='2px'
                                ml='1px'
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                {asset2PriceUSD
                                    ? ethDepositAmount
                                        ? (asset2PriceUSD * parseFloat(ethDepositAmount)).toLocaleString('en-US', {
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
                    {/* Exchange Rate Input */}
                    <Flex mt='10px' px='10px' bg='#2E1C0C' w='100%' h='105px' border='2px solid #78491F' borderRadius={'10px'}>
                        <Flex direction={'column'} py='10px' px='5px'>
                            <Text
                                color={!exchangeRate ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                Exchange Rate (Per BTC)
                            </Text>
                            <Input
                                value={exchangeRate}
                                onChange={handleExchangeRateChange}
                                fontFamily={'Aux'}
                                border='none'
                                mt='2px'
                                mr='-100px'
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
                                position={'absolute'}
                                fontFamily={'Aux'}
                                mt='10px'
                                right='-175px'
                                p='0px'
                                letterSpacing={'-12px'}
                                color={colors.offWhite}
                                fontSize='40px'>
                                {' '}
                                = 1
                            </Text>
                            <Text
                                color={!exchangeRate ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                mt='2px'
                                ml='1px'
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                {calculateBTCAmount()} BTC{' '}
                                {asset1PriceUSD
                                    ? exchangeRate
                                        ? '≈ ' +
                                          (asset1PriceUSD * parseFloat(exchangeRate)).toLocaleString('en-US', {
                                              style: 'currency',
                                              currency: 'USD',
                                          })
                                        : ''
                                    : ''}
                            </Text>
                        </Flex>
                        <Spacer />
                        <Flex mt='18px' mr='-25px'>
                            <BTCSVG width='128' height='80' viewBox='0 0 170 69' />
                        </Flex>
                    </Flex>
                    {/* BTC Payout Address */}
                    <Flex mt='10px' px='10px' bg='#1C1C1C' w='100%' h='78px' border='2px solid #565656' borderRadius={'10px'}>
                        <Flex direction={'column'}>
                            <Text
                                color={colors.offWhite}
                                fontSize={'13px'}
                                mt='7px'
                                ml='3px'
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                BTC Payout Wallet
                            </Text>
                            <Input
                                value={payoutBTCAddress}
                                onChange={handleBTCPayoutAddressChange}
                                fontFamily={'Aux'}
                                border='none'
                                mt='1px'
                                mr='110px'
                                p='0px'
                                letterSpacing={'-5px'}
                                color={colors.offWhite}
                                _active={{ border: 'none', boxShadow: 'none' }}
                                _focus={{ border: 'none', boxShadow: 'none' }}
                                _selected={{ border: 'none', boxShadow: 'none' }}
                                fontSize='26px'
                                placeholder='BTC payout address'
                                _placeholder={{ color: colors.textGray }}
                            />
                        </Flex>
                        {/* TODO: ADD LOADING INDICATOR AND ADDRESS VALIDATION CHECK CIRCLE HERE */}
                    </Flex>
                    {/* Deposit Button */}
                    <Flex
                        bg={
                            ethDepositAmount && exchangeRate && payoutBTCAddress
                                ? colors.purpleBackground
                                : colors.purpleBackgroundDisabled
                        }
                        _hover={{ bg: colors.purpleHover }}
                        w='100%'
                        mt='15px'
                        transition={'0.2s'}
                        h='45px'
                        onClick={ethDepositAmount && exchangeRate && payoutBTCAddress ? () => handleNavigation('/') : null}
                        fontSize={'15px'}
                        align={'center'}
                        userSelect={'none'}
                        cursor={'pointer'}
                        borderRadius={'10px'}
                        justify={'center'}
                        border={ethDepositAmount && exchangeRate && payoutBTCAddress ? '3px solid #445BCB' : '3px solid #3242a8'}>
                        <Text
                            color={ethDepositAmount && exchangeRate && payoutBTCAddress ? colors.offWhite : colors.darkerGray}
                            fontFamily='Nostromo'>
                            Deposit Liquidity
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};
