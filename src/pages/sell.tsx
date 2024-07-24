import { Flex, Image, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { OpenGraph } from '../components/background/OpenGraph';
import HorizontalButtonSelector from '../components/HorizontalButtonSelector';
import OrangeText from '../components/OrangeText';
import { SwapUI } from '../components/SwapUI';
import BlueText from '../components/BlueText';
import WhiteText from '../components/WhiteText';
import { DepositUI } from '../components/DepositUI';
import { Navbar } from '../components/Navbar';
import { toastSuccess } from '../hooks/toast';
import useWindowSize from '../hooks/useWindowSize';
import { colors } from '../utils/colors';
import { FONT_FAMILIES } from '../utils/font';
import useHorizontalSelectorInput from '../hooks/useHorizontalSelectorInput';
import { useEffect } from 'react';
import ExchangeRateChart from '../components/charts/ExchangeRateChart';

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
    const { options, selected, setSelected } = useHorizontalSelectorInput(['Create a Vault', 'Manage Vaults'] as const);

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
                <Flex direction={'column'} align='center' w='100%' h='100%' mt='105px'>
                    {/* LOGOS & TEXT */}
                    <Flex direction={'column'} align='center' w='100%'>
                        <Flex
                            sx={{
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                            }}
                            bgGradient={`linear(-90deg, #394AFF, #FF8F28)`}
                            letterSpacing={'2px'}
                            mt='-25px'>
                            <Text userSelect={'none'} fontSize='60px' fontFamily={'Klein'} fontWeight='bold' px='12px' as='h1'>
                                Sell Ethereum
                            </Text>
                        </Flex>
                    </Flex>
                    {/* Horizontal Button Selector */}
                    <Flex mt={'14px'}>
                        <HorizontalButtonSelector options={options} onSelectItem={setSelected} />
                    </Flex>
                    <Flex
                        w='1300px'
                        bg={colors.offBlack}
                        h='650px'
                        borderRadius={'20px'}
                        mt='14px'
                        border='3px solid'
                        borderColor={colors.borderGray}>
                        <Flex w='50%' h='100%' flexDir='column' p='20px'>
                            {/* ADVAITH WORK HERE */}
                            <Text
                                fontFamily={FONT_FAMILIES.AUX_MONO}
                                color={colors.textGray}
                                fontSize='0.8rem'
                                fontWeight='300'
                                letterSpacing='-0.5px'>
                                Total Liquidity
                            </Text>
                            <Flex gap='8px' align='center'>
                                <Image src='/images/icons/Ethereum.svg' h='26px' />
                                <Text
                                    fontFamily={FONT_FAMILIES.AUX_MONO}
                                    fontSize='50px'
                                    letterSpacing='-8px'
                                    fontWeight='normal'>
                                    323,249.00
                                </Text>
                            </Flex>
                            <Flex flex={1} w='100%'>
                                <ExchangeRateChart />
                            </Flex>
                        </Flex>
                        <Flex
                            w='50%'
                            h='100%'
                            px='30px'
                            py='28px'
                            flexDir={'column'}
                            userSelect={'none'}
                            fontSize={'12px'}
                            fontFamily={FONT_FAMILIES.AUX_MONO}
                            color={'#c3c3c3'}
                            fontWeight={'normal'}
                            gap={'0px'}>
                            {/* TRISTAN WORK HERE */}

                            <Text fontSize={'12px'} letterSpacing={'-1px'} textAlign={'center'}>
                                Create a sell order by setting your <WhiteText>Exchange Rate</WhiteText>. Get payed out in
                                <OrangeText> BTC</OrangeText> when your order is filled. Withdraw unreserved liquidity anytime.
                            </Text>

                            <DepositUI />
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default Sell;
