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
        <Flex width='580px' mt='30px' direction={'column'} overflow='hidden'>
            {/* Tab Buttons */}
            <Flex justifyContent='center' w='100%' h='43px' position='relative'>
                {/* Swap Tab */}
                <Flex
                    flex={1}
                    align='center'
                    justify='center'
                    zIndex={isSwapTab ? 3 : 1}
                    onClick={() => handleTabClick('swap')}
                    pr='1px'>
                    {/* Tab Text */}
                    <Flex
                        flex={1}
                        {...backgroundColor}
                        h='100%'
                        align='center'
                        justify='center'
                        borderRadius='20px 0px 0px 0px'
                        borderTop={borderColor}
                        borderLeft={borderColor}
                        borderBottom={isSwapTab ? 'none' : borderColor}
                        cursor='pointer'>
                        <Text
                            textAlign={'center'}
                            mr='-20px'
                            mt={isSwapTab ? '-2px' : '0px'}
                            userSelect='none'
                            fontFamily='Nostromo'>
                            Swap
                        </Text>
                    </Flex>
                    {/* Tab Curve (Right Side) */}
                    <Flex h='100%' w='20px' flexDir='column' position='relative'>
                        {/* Top Curve and Bottom Space */}
                        <Flex
                            {...backgroundColor}
                            flex={1}
                            borderTopRightRadius={'20px'}
                            borderTop={borderColor}
                            borderRight={borderColor}
                            cursor='pointer'
                        />
                        <Flex {...backgroundColor} flex={1} cursor='pointer'></Flex>
                        {/* Bottom Curve OR Behind Curve */}
                        {isSwapTab ? (
                            <Flex
                                zIndex={isSwapTab ? 3 : 1}
                                w='24px'
                                position='absolute'
                                bottom='0px'
                                right='-22px'
                                h='25px'
                                borderBottomLeftRadius='25px'
                                borderLeft={borderColor}
                                borderBottom={borderColor}
                                cursor='pointer'
                            />
                        ) : (
                            <Flex
                                zIndex={isSwapTab ? 1 : 3}
                                w='4px'
                                position='absolute'
                                bottom='12px'
                                right='-2px'
                                h='12px'
                                borderBottomLeftRadius='25px'
                                borderLeft={borderColor}
                                borderBottom={borderColor}
                            />
                        )}
                    </Flex>
                </Flex>

                {/* Middle Shadow */}
                <Flex
                    zIndex={2}
                    position='absolute'
                    w='5px'
                    h='5px'
                    // bg='red'
                    top='50%'
                    left='50%'
                    transform='translate(-50%, -50%)'
                    borderRadius='100px'
                    bg='rgba(0, 0, 0, 0.1)'
                    boxShadow='0px 0px 20px 10px rgba(0, 0, 0, 0.5)'
                />
                {/* Middle Patching */}
                <Flex
                    zIndex={1}
                    position='absolute'
                    w='5px'
                    h='14px'
                    bottom={'-7px'}
                    left='50%'
                    transform='translate(-50%, -50%)'
                    {...backgroundColor}
                />

                {/* Liquidity Tab */}
                <Flex
                    flex={1}
                    align='center'
                    justify='center'
                    zIndex={isSwapTab ? 1 : 3}
                    onClick={() => handleTabClick('liquidity')}
                    pl='1px'>
                    {/* Tab Curve (Left Side) */}
                    <Flex h='100%' w='20px' flexDir='column' position='relative'>
                        {/* Top Curve and Bottom Space */}
                        <Flex
                            {...backgroundColor}
                            flex={1}
                            borderTopLeftRadius={'20px'}
                            borderTop={borderColor}
                            borderLeft={borderColor}
                            cursor='pointer'></Flex>
                        <Flex {...backgroundColor} flex={1} cursor='pointer'></Flex>
                        {/* Bottom Curve OR Behind Curve */}
                        {!isSwapTab ? (
                            <Flex
                                zIndex={isSwapTab ? 1 : 3}
                                w='24px'
                                position='absolute'
                                bottom='0px'
                                left='-22px'
                                h='25px'
                                borderBottomRightRadius='25px'
                                borderRight={borderColor}
                                borderBottom={borderColor}
                                cursor='pointer'
                            />
                        ) : (
                            <Flex
                                zIndex={isSwapTab ? 3 : 1}
                                w='3px'
                                position='absolute'
                                bottom='12px'
                                left='-1px'
                                h='10px'
                                borderBottomRightRadius='25px'
                                borderRight={borderColor}
                                borderBottom={borderColor}
                            />
                        )}
                    </Flex>
                    <Flex
                        flex={1}
                        {...backgroundColor}
                        h='100%'
                        align='center'
                        justify='center'
                        borderRadius='0px 20px 0px 0px'
                        borderTop={borderColor}
                        borderRight={borderColor}
                        borderBottom={isSwapTab ? borderColor : 'none'}
                        cursor='pointer'>
                        <Text
                            textAlign={'center'}
                            ml='-20px'
                            mt={isSwapTab ? '0px' : '-2px'}
                            userSelect={'none'}
                            fontFamily='Nostromo'>
                            Become an LP
                        </Text>
                    </Flex>
                </Flex>
            </Flex>

            {/* Content */}
            <Flex
                direction='column'
                align='center'
                py='18px'
                borderRadius='0px 0px 20px 20px'
                {...backgroundColor}
                borderBottom={borderColor}
                borderLeft={borderColor}
                borderRight={borderColor}>
                {activeTab === 'swap' && (
                    <Flex w='90%' direction={'column'}>
                        {/* Inputs */}
                        <Flex w='100%' flexDir='column' position='relative'>
                            {/* BTC Input */}
                            <Flex px='10px' bg='#2E1C0C' w='100%' h='110px' border='2px solid #78491F' borderRadius={'10px'}>
                                <Flex direction={'column'}>
                                    <Text
                                        color={!btcSwapAmount ? colors.offWhite : colors.textGray}
                                        fontSize={'13px'}
                                        mt='9px'
                                        ml='3px'
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
                                        mt='5px'
                                        mr='-150px'
                                        p='0px'
                                        letterSpacing={'-6px'}
                                        color={colors.offWhite}
                                        _active={{ border: 'none', boxShadow: 'none' }}
                                        _focus={{ border: 'none', boxShadow: 'none' }}
                                        _selected={{ border: 'none', boxShadow: 'none' }}
                                        fontSize='38px'
                                        placeholder='0.0'
                                        _placeholder={{ color: colors.darkerGray }}
                                    />
                                    <Text
                                        color={!btcSwapAmount ? 'white' : colors.textGray}
                                        fontSize={'13px'}
                                        mt='5px'
                                        ml='3px'
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
                                <Flex mt='19px' mr='-25px'>
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
                            <Flex
                                mt='5px'
                                px='10px'
                                bg='#161A33'
                                w='100%'
                                h='110px'
                                border='2px solid #303F9F'
                                borderRadius={'10px'}>
                                <Flex direction={'column'}>
                                    <Text
                                        color={!ethSwapAmount ? colors.offWhite : colors.textGray}
                                        fontSize={'13px'}
                                        mt='9px'
                                        ml='3px'
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
                                        mt='5px'
                                        mr='-150px'
                                        p='0px'
                                        letterSpacing={'-6px'}
                                        color={colors.offWhite}
                                        _active={{ border: 'none', boxShadow: 'none' }}
                                        _focus={{ border: 'none', boxShadow: 'none' }}
                                        _selected={{ border: 'none', boxShadow: 'none' }}
                                        fontSize='38px'
                                        placeholder='0.0'
                                        _placeholder={{ color: colors.darkerGray }}
                                    />
                                    <Text
                                        color={!ethSwapAmount ? colors.offWhite : colors.textGray}
                                        fontSize={'13px'}
                                        mt='5px'
                                        ml='3px'
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
                                <Flex mt='19px' mr='-25px'>
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
                            <Text color={ethSwapAmount ? colors.offWhite : colors.textGray} fontFamily='Nostromo'>
                                Exchange
                            </Text>
                        </Flex>
                    </Flex>
                )}
                {activeTab === 'liquidity' && (
                    <Flex w='90%' direction={'column'}>
                        {/* LP Info */}
                        <Flex mt='-2px' justify={'center'} align='center'>
                            <Text
                                textAlign={'center'}
                                color={colors.textGray}
                                fontSize={'13px'}
                                mt='0px'
                                ml='3px'
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                Earn fees swapping from ETH to BTC.
                                <br />
                                Orders are filled by fee, lowest to highest.
                                <br />
                                Withdraw unreserved liquidity anytime.
                            </Text>
                        </Flex>
                        {/* Deposit Input */}
                        <Flex
                            mt='18px'
                            px='10px'
                            bg='#161A33'
                            w='100%'
                            h='110px'
                            border='2px solid #303F9F'
                            borderRadius={'10px'}>
                            <Flex direction={'column'}>
                                <Text
                                    color={colors.textGray}
                                    fontSize={'13px'}
                                    mt='9px'
                                    ml='3px'
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    Deposit Amount
                                </Text>
                                <Input
                                    value={ethDepositAmount}
                                    onChange={handleEthDepositChange}
                                    fontFamily={'Aux'}
                                    border='none'
                                    mt='5px'
                                    mr='-150px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='38px'
                                    placeholder='0.0'
                                    _placeholder={{ color: colors.textGray }}
                                />
                                <Text
                                    color={colors.textGray}
                                    fontSize={'13px'}
                                    mt='5px'
                                    ml='3px'
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    {lpDepositAssetPriceUSD
                                        ? ethDepositAmount
                                            ? (lpDepositAssetPriceUSD * parseFloat(ethDepositAmount)).toLocaleString('en-US', {
                                                  style: 'currency',
                                                  currency: 'USD',
                                              })
                                            : '$0.00'
                                        : '$0.00'}
                                </Text>
                            </Flex>
                            <Spacer />
                            <Flex mt='19px' mr='-25px'>
                                <ETHSVG width='128' height='80' viewBox='0 0 170 69' />
                            </Flex>{' '}
                        </Flex>
                        {/* LP Fee */}
                        <Flex mt='10px' px='10px' bg='#132B12' w='100%' h='78px' border='2px solid #319C48' borderRadius={'10px'}>
                            <Flex direction={'column'}>
                                <Text
                                    color={colors.offWhite}
                                    fontSize={'13px'}
                                    mt='7px'
                                    ml='3px'
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    Set your LP Fee
                                </Text>
                                <Input
                                    value={lpFee}
                                    onChange={handleLPFeeChange}
                                    onBlur={handleLPFeeBlur}
                                    onFocus={handleLPFeeFocus}
                                    fontFamily={'Aux'}
                                    border='none'
                                    mt='1px'
                                    mr='-150px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='38px'
                                    placeholder='0.05%'
                                    _placeholder={{ color: colors.textGray }}
                                />
                            </Flex>
                            <Text
                                position={'absolute'}
                                color={colors.textGray}
                                fontSize={'13px'}
                                right='45px'
                                mt='45px'
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                {`${parseFloat(ethDepositAmount) * (parseFloat(lpFee.replace('%', '')) / 100) || 0} ETH`}
                            </Text>
                        </Flex>
                        {/* BTC Payout Address */}
                        <Flex mt='10px' px='10px' bg='#2E1C0C' w='100%' h='78px' border='2px solid #78491F' borderRadius={'10px'}>
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
                            bg='rgba(50, 66, 168, 0.3)'
                            _hover={{ bg: 'rgba(50, 66, 168, 0.65)' }}
                            w='100%'
                            mt='20px'
                            transition={'0.2s'}
                            h='42px'
                            fontSize={'14px'}
                            align={'center'}
                            borderRadius={'10px'}
                            cursor={'pointer'}
                            justify={'center'}
                            border={'3px solid #445BCB'}>
                            <Text fontFamily='Nostromo'>Deposit</Text>
                        </Flex>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
};
