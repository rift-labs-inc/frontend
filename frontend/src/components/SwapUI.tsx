import { Tabs, TabList, Tooltip, TabPanels, Tab, Button, Flex, Text, useColorModeValue, Box, Spacer, Input } from '@chakra-ui/react';
import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';

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

    // Fetch current exchange rate
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eth');
                const data = await response.json();
                if (data.bitcoin && data.bitcoin.eth) {
                    setBtcToEthRate(data.bitcoin.eth);
                }
            } catch (error) {
                console.error('Failed to fetch exchange rate:', error);
            }
        };

        fetchExchangeRate();
    }, []);

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const handleTabClick = (tabName: ActiveTab) => {
        setActiveTab(tabName);
    };

    const BTCSVG = () => {
        return (
            <svg width='98' height='69' viewBox='0 0 190 69' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <rect
                    x='24.8369'
                    y='4.83691'
                    width='163.326'
                    height='59.3262'
                    rx='15.5091'
                    fill='url(#paint0_linear_4489_657)'
                    stroke='#FFA04C'
                    stroke-width='3.67381'
                />
                <path
                    d='M66.587 42.5176C62.0712 60.6339 43.7164 71.6466 25.626 67.1305C7.50916 62.6146 -3.50352 44.2607 1.01262 26.1705C5.52849 8.05421 23.8566 -2.95848 41.9734 1.55766C60.0638 6.04713 71.1032 24.4011 66.587 42.5176Z'
                    fill='url(#paint1_linear_4489_657)'
                />
                <path
                    d='M49.8923 30.1324C50.5524 25.6434 47.1461 23.2141 42.4459 21.6034L43.9775 15.5037L40.2807 14.5795L38.802 20.5208C37.825 20.2831 36.8216 20.0455 35.8182 19.8342L37.2969 13.8666L33.6001 12.9424L32.095 19.0157C31.2764 18.8308 30.4842 18.646 29.7185 18.4611V18.4347L24.5958 17.1673L23.6188 21.1281C23.6188 21.1281 26.365 21.7618 26.3122 21.7882C27.8173 22.1579 28.0813 23.1613 28.0285 23.9535L26.2858 30.8981C26.3914 30.9245 26.5234 30.9509 26.6818 31.0302C26.5498 31.0038 26.4178 30.9774 26.2858 30.9245L23.8565 40.6418C23.6716 41.0907 23.1963 41.7772 22.1665 41.5132C22.1929 41.566 19.4731 40.853 19.4731 40.853L17.6248 45.1043L22.457 46.319C23.3548 46.5566 24.2261 46.7679 25.0975 47.0055L23.566 53.158L27.2628 54.0822L28.7943 47.9825C29.7977 48.2466 30.8011 48.5106 31.7517 48.7483L30.2466 54.8215L33.9434 55.7457L35.4749 49.5933C41.8122 50.7815 46.5652 50.3062 48.5456 44.5762C50.1564 39.9816 48.4664 37.3147 45.1393 35.5719C47.595 35.0174 49.417 33.4067 49.8923 30.1324ZM41.4161 42.0149C40.2807 46.6094 32.5175 44.1273 30.0089 43.4936L32.0422 35.3343C34.5507 35.968 42.6308 37.2091 41.4161 42.0149ZM42.578 30.0532C41.5217 34.2516 35.0788 32.1128 32.9928 31.5847L34.8412 24.1911C36.9272 24.7192 43.6606 25.6963 42.578 30.0532Z'
                    fill='white'
                />
                <path
                    d='M88.9348 46.2185V20.8533H99.4641C104.087 20.8533 107.058 23.3494 107.058 27.199V27.2341C107.058 29.9587 105.001 32.4021 102.277 32.7712V32.8591C105.845 33.1755 108.271 35.6716 108.271 39.0115V39.0466C108.271 43.4763 104.984 46.2185 99.5696 46.2185H88.9348ZM98.3215 24.3865H93.47V31.5759H97.5481C100.818 31.5759 102.575 30.24 102.575 27.8494V27.8142C102.575 25.6169 101.011 24.3865 98.3215 24.3865ZM98.2688 34.863H93.47V42.6853H98.5325C101.855 42.6853 103.648 41.3318 103.648 38.783V38.7478C103.648 36.199 101.82 34.863 98.2688 34.863ZM118.79 46.2185V24.6677H111.196V20.8533H130.884V24.6677H123.308V46.2185H118.79ZM144.638 46.658C137.343 46.658 132.737 41.6306 132.737 33.5271V33.5095C132.737 25.406 137.36 20.4138 144.638 20.4138C150.474 20.4138 154.763 24.0525 155.431 29.2205L155.448 29.3962H151.001L150.913 29.0623C150.175 26.1619 147.942 24.3513 144.638 24.3513C140.208 24.3513 137.378 27.8845 137.378 33.5095V33.5271C137.378 39.1697 140.226 42.7205 144.638 42.7205C147.872 42.7205 150.14 40.9802 150.966 37.8513L151.019 37.6755H155.466L155.431 37.8513C154.78 43.0544 150.474 46.658 144.638 46.658Z'
                    fill='white'
                />
                <defs>
                    <linearGradient id='paint0_linear_4489_657' x1='106.5' y1='3' x2='106.5' y2='66' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#C16C21' />
                        <stop offset='1' stop-color='#C46816' />
                    </linearGradient>
                    <linearGradient id='paint1_linear_4489_657' x1='3378.08' y1='-1.07731' x2='3378.08' y2='6759.68' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#F9AA4B' />
                        <stop offset='1' stop-color='#F7931A' />
                    </linearGradient>
                </defs>
            </svg>
        );
    };

    const ETHSVG = () => {
        return (
            <svg width='98' height='69' viewBox='0 0 190 69' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <rect
                    x='27.8369'
                    y='4.83691'
                    width='160.326'
                    height='60.3262'
                    rx='15.5091'
                    fill='url(#paint0_linear_4489_656)'
                    stroke='#627EEA'
                    stroke-width='3.67381'
                />
                <path
                    d='M67.4308 42.8542C62.9149 60.9705 44.5602 71.9832 26.4697 67.467C8.35291 62.9512 -2.65977 44.5972 1.85637 26.5071C6.37224 8.39076 24.7003 -2.62193 42.8171 1.89421C60.9076 6.38368 71.9469 24.7376 67.4308 42.8542Z'
                    fill='url(#paint1_linear_4489_656)'
                />
                <path
                    d='M50.7358 30.4688C51.3959 25.9799 47.9896 23.5506 43.2894 21.9398L44.821 15.8401L41.1242 14.916L39.6455 20.8572C38.6685 20.6195 37.6651 20.3819 36.6617 20.1707L38.1404 14.203L34.4436 13.2788L32.9385 19.3521C32.1199 19.1672 31.3277 18.9824 30.562 18.7976V18.7712L25.4393 17.5037L24.4623 21.4645C24.4623 21.4645 27.2085 22.0983 27.1557 22.1247C28.6608 22.4943 28.9248 23.4977 28.872 24.2899L27.1293 31.2346C27.2349 31.261 27.3669 31.2874 27.5254 31.3666C27.3933 31.3402 27.2613 31.3138 27.1293 31.261L24.7 40.9782C24.5151 41.4271 24.0398 42.1136 23.01 41.8496C23.0364 41.9024 20.3166 41.1894 20.3166 41.1894L18.4683 45.4407L23.3005 46.6554C24.1983 46.893 25.0696 47.1043 25.941 47.3419L24.4095 53.4944L28.1063 54.4186L29.6378 48.3189C30.6412 48.583 31.6446 48.847 32.5952 49.0847L31.0901 55.158L34.7869 56.0822L36.3184 49.9297C42.6557 51.1179 47.4087 50.6426 49.3891 44.9126C50.9999 40.3181 49.3099 37.6511 45.9828 35.9083C48.4385 35.3538 50.2605 33.7431 50.7358 30.4688ZM42.2596 42.3513C41.1242 46.9459 33.361 44.4637 30.8524 43.83L32.8857 35.6707C35.3942 36.3044 43.4743 37.5455 42.2596 42.3513ZM43.4215 30.3896C42.3653 34.5881 35.9223 32.4492 33.8363 31.9211L35.6847 24.5276C37.7707 25.0557 44.5041 26.0327 43.4215 30.3896Z'
                    fill='white'
                />
                <path
                    d='M34.6428 68.4797C53.3095 68.4797 68.4419 53.3474 68.4419 34.6807C68.4419 16.0139 53.3095 0.881592 34.6428 0.881592C15.9761 0.881592 0.84375 16.0139 0.84375 34.6807C0.84375 53.3474 15.9761 68.4797 34.6428 68.4797Z'
                    fill='#627EEA'
                />
                <path d='M35.6948 9.3313V28.0687L51.5318 35.1453L35.6948 9.3313Z' fill='white' fill-opacity='0.602' />
                <path d='M35.695 9.3313L19.856 35.1453L35.695 28.0687V9.3313Z' fill='white' />
                <path d='M35.6948 47.2881V60.0198L51.5424 38.0947L35.6948 47.2881Z' fill='white' fill-opacity='0.602' />
                <path d='M35.695 60.0198V47.286L19.856 38.0947L35.695 60.0198Z' fill='white' />
                <path d='M35.6948 44.3412L51.5318 35.1457L35.6948 28.0732V44.3412Z' fill='white' fill-opacity='0.2' />
                <path d='M19.856 35.1457L35.695 44.3412V28.0732L19.856 35.1457Z' fill='white' fill-opacity='0.602' />
                <path
                    d='M89.7783 47.5549V22.1897H106.196V26.0042H94.3135V32.842H105.546V36.5159H94.3135V43.7405H106.196V47.5549H89.7783ZM117.419 47.5549V26.0042H109.825V22.1897H129.513V26.0042H121.936V47.5549H117.419ZM133.704 47.5549V22.1897H138.239V32.7366H150.579V22.1897H155.097V47.5549H150.579V36.551H138.239V47.5549H133.704Z'
                    fill='white'
                />
                <defs>
                    <linearGradient id='paint0_linear_4489_656' x1='108' y1='3' x2='108' y2='67' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#2E40B7' />
                        <stop offset='1' stop-color='#2E45B0' />
                    </linearGradient>
                    <linearGradient id='paint1_linear_4489_656' x1='3378.92' y1='-0.740762' x2='3378.92' y2='6760.01' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#F9AA4B' />
                        <stop offset='1' stop-color='#F7931A' />
                    </linearGradient>
                </defs>
            </svg>
        );
    };

    const ETHLogoSVG = () => {
        return (
            <Flex borderRadius={'190px'} overflow={'hidden'}>
                <svg width='38' height='15' viewBox='0 0 1 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M35.6948 9.3313V28.0687L51.5318 35.1453L35.6948 9.3313Z' fill='white' fill-opacity='0.602' />
                    <path d='M35.695 9.3313L19.856 35.1453L35.695 28.0687V9.3313Z' fill='white' />
                    <path d='M35.6948 47.2881V60.0198L51.5424 38.0947L35.6948 47.2881Z' fill='white' fill-opacity='0.602' />
                    <path d='M35.695 60.0198V47.286L19.856 38.0947L35.695 60.0198Z' fill='white' />
                    <path d='M35.6948 44.3412L51.5318 35.1457L35.6948 28.0732V44.3412Z' fill='white' fill-opacity='0.2' />
                    <path d='M19.856 35.1457L35.695 44.3412V28.0732L19.856 35.1457Z' fill='white' fill-opacity='0.602' />
                    <path
                        d='M89.7783 47.5549V22.1897H106.196V26.0042H94.3135V32.842H105.546V36.5159H94.3135V43.7405H106.196V47.5549H89.7783ZM117.419 47.5549V26.0042H109.825V22.1897H129.513V26.0042H121.936V47.5549H117.419ZM133.704 47.5549V22.1897H138.239V32.7366H150.579V22.1897H155.097V47.5549H150.579V36.551H138.239V47.5549H133.704Z'
                        fill='white'
                    />
                </svg>
            </Flex>
        );
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

        // Updated regex to allow optional negative sign, numbers, optionally followed by a decimal and up to two decimal places
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
        <Flex width='580px' h={activeTab === 'swap' ? '332px' : '478px'} mt='30px' direction={'column'} overflow='hidden'>
            {/* Tab Buttons */}
            <Flex justifyContent='center' w='100%' h='43px' position='relative'>
                {/* Swap Tab */}
                <Flex flex={1} align='center' justify='center' zIndex={isSwapTab ? 3 : 1} onClick={() => handleTabClick('swap')} pr='1px'>
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
                        <Text textAlign={'center'} mr='-20px' mt={isSwapTab ? '-2px' : '0px'} userSelect='none' fontFamily='Nostromo'>
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
                <Flex flex={1} align='center' justify='center' zIndex={isSwapTab ? 1 : 3} onClick={() => handleTabClick('liquidity')} pl='1px'>
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
                        <Text textAlign={'center'} ml='-20px' mt={isSwapTab ? '0px' : '-2px'} userSelect={'none'} fontFamily='Nostromo'>
                            Provide Liquidity
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
                            <Flex px='10px' bg='#2E1C0C' w='100%' h='78px' border='2px solid #78491F' borderRadius={'10px'}>
                                <Flex direction={'column'}>
                                    <Text
                                        color={colors.offWhite}
                                        fontSize={'13px'}
                                        mt='7px'
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
                                        mt='1px'
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
                                </Flex>
                                <Spacer />
                                <BTCSVG />
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
                            <Flex mt='5px' px='10px' bg='#161A33' w='100%' h='78px' border='2px solid #303F9F' borderRadius={'10px'}>
                                <Flex direction={'column'}>
                                    <Text
                                        color={colors.offWhite}
                                        fontSize={'13px'}
                                        mt='7px'
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
                                        mt='1px'
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
                                </Flex>
                                <Spacer />
                                <ETHSVG />
                            </Flex>
                        </Flex>
                        {/* Rate/Liquidity Details */}
                        <Flex mt='9px'>
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
                                    }}>
                                    <Tooltip
                                        fontFamily={'Aux'}
                                        letterSpacing={'-0.5px'}
                                        color={colors.offWhite}
                                        bg={'#121212'}
                                        fontSize={'12px'}
                                        label='This exchange rate includes the hypernode, protocol, and LP Fees. There are no additional or hidden fees.'
                                        aria-label='A tooltip'>
                                        Including Fees
                                    </Tooltip>
                                </Box>
                            </Text>
                            <Spacer />
                            <Flex mt='0.5px'>
                                <ETHLogoSVG />
                            </Flex>
                            <Text
                                ml='-3px'
                                color={colors.textGray}
                                fontSize={'13px'}
                                mr='3px'
                                letterSpacing={'-1.5px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                <Box as='span' fontWeight={'bold'}>
                                    {currentETHLiquidity}{' '}
                                </Box>
                                Available
                            </Text>
                        </Flex>
                        {/* Exchange Button */}
                        <Flex
                            bg='rgba(50, 66, 168, 0.3)'
                            _hover={{ bg: 'rgba(50, 66, 168, 0.65)' }}
                            w='100%'
                            mt='18px'
                            transition={'0.2s'}
                            h='42px'
                            fontSize={'15px'}
                            align={'center'}
                            borderRadius={'10px'}
                            cursor={'pointer'}
                            justify={'center'}
                            border={'3px solid #445BCB'}>
                            <Text fontFamily='Nostromo'>Exchange</Text>
                        </Flex>
                    </Flex>
                )}
                {activeTab === 'liquidity' && (
                    <Flex w='90%' direction={'column'}>
                        {/* LP Info */}
                        <Flex mt='-2px'>
                            <Text
                                textAlign={'center'}
                                color={colors.textGray}
                                fontSize={'13px'}
                                mt='0px'
                                ml='3px'
                                letterSpacing={'-1px'}
                                fontWeight={'normal'}
                                fontFamily={'Aux'}>
                                Set your own fees, withdraw anytime.
                                <br />
                                Automatically swap from ETH to BTC when your order is filled. Orders are filled by fee, lowest to highest.
                            </Text>
                        </Flex>
                        {/* ETH Input */}
                        <Flex mt='18px' px='10px' bg='#161A33' w='100%' h='78px' border='2px solid #303F9F' borderRadius={'10px'}>
                            <Flex direction={'column'}>
                                <Text
                                    color={colors.offWhite}
                                    fontSize={'13px'}
                                    mt='7px'
                                    ml='3px'
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
                                    mt='1px'
                                    mr='-150px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={colors.offWhite} // This sets the text color of the input content
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='38px'
                                    placeholder='0.0'
                                    _placeholder={{ color: colors.textGray }}
                                />
                            </Flex>
                            <Spacer />
                            <ETHSVG />
                        </Flex>
                        {/* LP Fee */}
                        <Flex mt='10px' px='10px' bg='#132B12' w='100%' h='78px' border='2px solid #557D23' borderRadius={'10px'}>
                            <Flex direction={'column'}>
                                <Text
                                    color={colors.offWhite}
                                    fontSize={'13px'}
                                    mt='7px'
                                    ml='3px'
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    Your Fee
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
                                    Your BTC Wallet
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
                                    placeholder='Your BTC payout address'
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
