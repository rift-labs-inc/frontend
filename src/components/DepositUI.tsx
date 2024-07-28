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
import { useEffect, useState, useRef, ChangeEvent } from 'react';
import styled from 'styled-components';
import { colors } from '../utils/colors';
import { BTCSVG, ETHSVG, InfoSVG } from './SVGs';

type ActiveTab = 'swap' | 'liquidity';

export const DepositUI = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';

    // price data
    const [bitcoinPriceUSD, setBitcoinPriceUSD] = useState();
    const [ethPriceUSD, setEthPriceUSD] = useState();
    const [wrappedEthPriceUSD, setWrappedEthPriceUSD] = useState();
    const [btcToEthExchangeRate, setBtcToEthExchangeRate] = useState();

    // input values
    const [lpDepositAsset, setLPDepositAsset] = useState('ETH');

    const [ethDepositAmount, setEthDepositAmount] = useState('');
    const [ethDepositAmountUSD, setEthDepositAmountUSD] = useState('0.00');

    const [profitPercentage, setProfitPercentage] = useState('');
    const [profitAmountUSD, setProfitAmountUSD] = useState('0.00');

    const [bitcoinOutputAmount, setBitcoinOutputAmount] = useState('');
    const [bitcoinOutputAmountUSD, setBitcoinOutputAmountUSD] = useState('0.00');

    const [payoutBTCAddress, setPayoutBTCAddress] = useState('');

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    useEffect(() => {
        const fetchPriceData = async () => {
            // TODO: get this data from uniswap
            try {
                const response = await fetch(
                    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,weth&vs_currencies=usd,eth',
                );
                const data = await response.json();
                if (data.bitcoin && data.bitcoin.usd) {
                    setBitcoinPriceUSD(data.bitcoin.usd); // Bitcoin price in USD
                }
                if (data.ethereum && data.ethereum.usd) {
                    setEthPriceUSD(data.ethereum.usd); // Ethereum price in USD
                }
                if (data.weth && data.weth.usd) {
                    setWrappedEthPriceUSD(data.weth.usd); // Wrapped Ethereum price in USD
                }
                if (data.bitcoin && data.bitcoin.eth) {
                    setBtcToEthExchangeRate(data.bitcoin.eth); // exchange rate of Bitcoin in Ethereum
                }
            } catch (error) {
                console.error('Failed to fetch prices and exchange rate:', error);
            }
        };

        fetchPriceData();
    }, []);

    // useEffect(() => {
    //     if (bitcoinPriceUSD && ethPriceUSD && ethDepositAmount && profitPercentage) {
    // const profitAmount = parseFloat(ethDepositAmount) * (parseFloat(profitPercentage) / 100);
    // const totalEthUSD = parseFloat(ethDepositAmount) * ethPriceUSD + profitAmount * ethPriceUSD;
    // const newBitcoinOutputAmount = totalEthUSD / bitcoinPriceUSD > 0 ? totalEthUSD / bitcoinPriceUSD : 0;
    // const formattedBitcoinOutputAmount = newBitcoinOutputAmount == 0 ? '0.0' : newBitcoinOutputAmount.toFixed(7);

    // if (formattedBitcoinOutputAmount !== lastBitcoinOutputAmount.current) {
    //     setBitcoinOutputAmount(formattedBitcoinOutputAmount);
    //     lastBitcoinOutputAmount.current = formattedBitcoinOutputAmount; // Update the ref
    // }
    //         // Calculate the profit amount in USD

    //         const profitAmountUSD = `≈ ${(
    //             ((parseFloat(ethDepositAmount) * parseFloat(profitPercentage)) / 100) *
    //             parseFloat(ethPriceUSD)
    //         ).toLocaleString('en-US', {
    //             style: 'currency',
    //             currency: 'USD',
    //         })}`;
    //         setProfitAmountUSD(profitAmountUSD);

    //         // Calculate and update the deposit amount in USD
    //         const ethDepositAmountUSD =
    //             ethPriceUSD && ethDepositAmount
    //                 ? (ethPriceUSD * parseFloat(ethDepositAmount)).toLocaleString('en-US', {
    //                       style: 'currency',
    //                       currency: 'USD',
    //                   })
    //                 : '$0.00';
    //         setEthDepositAmountUSD(ethDepositAmountUSD);
    //     }

    //     // Calculate and update the Bitcoin output amount in USD
    //     const bitcoinOutputAmountUSD =
    //         bitcoinPriceUSD && bitcoinOutputAmount
    //             ? (bitcoinPriceUSD * parseFloat(bitcoinOutputAmount)).toLocaleString('en-US', {
    //                   style: 'currency',
    //                   currency: 'USD',
    //               })
    //             : '$0.00';
    //     setBitcoinOutputAmountUSD(bitcoinOutputAmountUSD);
    // }, [ethDepositAmount, profitPercentage, bitcoinOutputAmount, bitcoinPriceUSD, ethPriceUSD]);

    const calculateBitcoinAmount = (newEthDepositAmount: string | undefined, newProfitPercentage: string | undefined) => {
        if (ethPriceUSD && bitcoinPriceUSD) {
            const profitAmount =
                parseFloat(newEthDepositAmount ?? ethDepositAmount) * (parseFloat(newProfitPercentage ?? profitPercentage) / 100);
            const totalEthUSD = parseFloat(newEthDepositAmount ?? ethDepositAmount) * ethPriceUSD + profitAmount * ethPriceUSD;
            const newBitcoinOutputAmount = totalEthUSD / bitcoinPriceUSD > 0 ? totalEthUSD / bitcoinPriceUSD : 0;
            const formattedBitcoinOutputAmount = newBitcoinOutputAmount == 0 ? '0.0' : newBitcoinOutputAmount.toFixed(7);

            if (validateBitcoinOutputAmount(formattedBitcoinOutputAmount)) {
                setBitcoinOutputAmount(formattedBitcoinOutputAmount);
            }
        }
    };

    const calculatePercentAmount = (bitcoinAmount: string) => {
        const startValue = parseFloat(ethDepositAmount);
        const endValue = parseFloat(bitcoinAmount) * parseFloat(btcToEthExchangeRate);
        const newProfitPercentage = (((endValue - startValue) / startValue) * 100).toFixed(2);

        if (validateProfitPercentage(newProfitPercentage)) {
            setProfitPercentage(newProfitPercentage);
        }
    };

    useEffect(() => {
        // Calculate the profit amount in USD
        const profitAmountUSD = `≈ ${(
            ((parseFloat(ethDepositAmount) * parseFloat(profitPercentage)) / 100) *
            parseFloat(ethPriceUSD)
        ).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        })}`;
        setProfitAmountUSD(!profitPercentage || !ethDepositAmount || profitPercentage == '-' ? '$0.00' : profitAmountUSD);

        // Run function to calculate bitcoin amount
        // setBitcoinOutputAmount(calculateBitcoinAmount());
    }, [ethDepositAmount, profitPercentage]);

    // Calculate and update the deposit amount in USD
    useEffect(() => {
        const ethDepositAmountUSD =
            ethPriceUSD && ethDepositAmount
                ? (ethPriceUSD * parseFloat(ethDepositAmount)).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                  })
                : '$0.00';
        setEthDepositAmountUSD(ethDepositAmountUSD);
    }, [ethDepositAmount]);

    // Calculate and update the Bitcoin output amount in USD
    useEffect(() => {
        const bitcoinOutputAmountUSD =
            bitcoinPriceUSD && bitcoinOutputAmount
                ? (bitcoinPriceUSD * parseFloat(bitcoinOutputAmount)).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                  })
                : '$0.00';
        setBitcoinOutputAmountUSD(bitcoinOutputAmountUSD);
    }, [bitcoinOutputAmount]);

    // deposit amount
    const handleEthDepositChange = (e: ChangeEvent<HTMLInputElement>) => {
        const ethValue = e.target.value;
        const validateEthDepositChange = (value) => {
            if (value === '') return true;
            const regex = /^\d*\.?\d*$/;
            return regex.test(value);
        };

        if (validateEthDepositChange(ethValue)) {
            setEthDepositAmount(ethValue);
            calculateBitcoinAmount(ethValue, undefined);
        }
    };

    const validateProfitPercentage = (value) => {
        if (value === '') return true;
        const regex = /^-?\d*(\.\d{0,2})?$/;
        return regex.test(value);
    };

    // profit percentage
    const handleProfitPercentageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const profitPercentageValue = e.target.value.replace('%', '');

        if (validateProfitPercentage(profitPercentageValue)) {
            setProfitPercentage(profitPercentageValue);
            calculateBitcoinAmount(undefined, profitPercentageValue);
        } else {
            console.log('Invalid profit percentage');
        }
    };

    const handleProfitPercentageFocus = (value: string) => {
        let ProfitPercentageValue = value.replace('%', '').replace(/^\+/, '');
        setProfitPercentage(ProfitPercentageValue);
    };

    const handleProfitPercentageBlur = () => {
        if (profitPercentage === '-') setProfitPercentage('');
        else if (profitPercentage !== '') {
            let formattedProfitPercentage = profitPercentage;
            if (!formattedProfitPercentage.startsWith('-') && /^[0-9]/.test(formattedProfitPercentage)) {
                // Check if it's numeric and not negative
                formattedProfitPercentage = '+' + formattedProfitPercentage;
            }
            setProfitPercentage(`${formattedProfitPercentage}%`);
        }
    };

    // bitcoin amount out
    const validateBitcoinOutputAmount = (value: string) => {
        if (value === '') return true;
        const regex = /^\d*\.?\d*$/;
        return regex.test(value);
    };

    const handleBitcoinOutputAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const bitcoinOutputAmountValue = e.target.value;

        if (validateBitcoinOutputAmount(bitcoinOutputAmountValue)) {
            setBitcoinOutputAmount(bitcoinOutputAmountValue);
            calculatePercentAmount(bitcoinOutputAmountValue);
        }
    };

    // btc payout address
    const handleBTCPayoutAddressChange = (e) => {
        const BTCPayoutAddress = e.target.value;
        setPayoutBTCAddress(BTCPayoutAddress);
    };

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
                                You Deposit
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
                                {ethDepositAmountUSD}
                            </Text>
                        </Flex>
                        <Spacer />
                        <Flex mt='18px' mr='-25px'>
                            <ETHSVG width='128' height='80' viewBox='0 0 170 69' />
                        </Flex>
                    </Flex>
                    {/* Profit Percentage Input */}
                    <Flex mt='10px' px='10px' bg='#132B12' w='100%' h='105px' border='2px solid #319C48' borderRadius={'10px'}>
                        <Flex direction={'column'} py='10px' px='5px'>
                            <Text
                                color={!profitPercentage ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                Your Profit
                            </Text>
                            <Input
                                value={profitPercentage}
                                onChange={handleProfitPercentageChange}
                                onBlur={handleProfitPercentageBlur}
                                onFocus={() => handleProfitPercentageFocus(profitPercentage)}
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
                                color={!profitPercentage ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                mt='2px'
                                ml='1px'
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                {profitAmountUSD}
                            </Text>
                        </Flex>
                        <Spacer />
                        <Flex
                            alignSelf={'center'}
                            mr='6px'
                            w='200px'
                            h='50px'
                            bg='#224231'
                            align='center'
                            justify='center'
                            border='2px solid #548148'
                            borderRadius={'10px'}
                            textAlign='center'
                            direction='column'>
                            <Text color={colors.offWhite}>Your Exchange Rate</Text>
                            <Text>1 BTC = {btcToEthExchangeRate}</Text>
                        </Flex>
                    </Flex>
                    {/* Bitcoin Amount Out */}
                    <Flex mt='10px' px='10px' bg='#2E1C0C' w='100%' h='105px' border='2px solid #78491F' borderRadius={'10px'}>
                        <Flex direction={'column'} py='10px' px='5px'>
                            <Text
                                color={!bitcoinOutputAmount ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                You Recieve
                            </Text>
                            <Input
                                value={bitcoinOutputAmount}
                                onChange={handleBitcoinOutputAmountChange}
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
                                color={!bitcoinOutputAmount ? colors.offWhite : colors.textGray}
                                fontSize={'13px'}
                                mt='2px'
                                ml='1px'
                                letterSpacing={'-1.5px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                ≈ {bitcoinOutputAmountUSD}
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
                            ethDepositAmount && bitcoinOutputAmount && payoutBTCAddress
                                ? colors.purpleBackground
                                : colors.purpleBackgroundDisabled
                        }
                        _hover={{ bg: colors.purpleHover }}
                        w='100%'
                        mt='15px'
                        transition={'0.2s'}
                        h='45px'
                        onClick={ethDepositAmount && bitcoinOutputAmount && payoutBTCAddress ? () => handleNavigation('/') : null}
                        fontSize={'15px'}
                        align={'center'}
                        userSelect={'none'}
                        cursor={'pointer'}
                        borderRadius={'10px'}
                        justify={'center'}
                        border={
                            ethDepositAmount && bitcoinOutputAmount && payoutBTCAddress
                                ? '3px solid #445BCB'
                                : '3px solid #3242a8'
                        }>
                        <Text
                            color={
                                ethDepositAmount && bitcoinOutputAmount && payoutBTCAddress ? colors.offWhite : colors.darkerGray
                            }
                            fontFamily='Nostromo'>
                            Deposit Liquidity
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};
