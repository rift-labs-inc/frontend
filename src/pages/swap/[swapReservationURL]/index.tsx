import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../../store';
import { Text, Flex, Image, Center, Box, Button, color, Spinner } from '@chakra-ui/react';
import { Navbar } from '../../../components/Navbar';
import { colors } from '../../../utils/colors';
import { bufferTo18Decimals, calculateBtcOutputAmountFromExchangeRate, decodeReservationUrl, fetchReservationDetails } from '../../../utils/dappHelper';
import CurrencyModal from '../../../components/swap/CurrencyModal';
import { RecieveUsdt } from '../../../components/swap/RecieveUsdt';
import { SwapStatusTimeline } from '../../../components/swap/SwapStatusTimeline';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { SwapAmounts } from '../../../components/swap/SwapAmounts';
import { OpenGraph } from '../../../components/background/OpenGraph';
import { ChromeLogoSVG, WarningSVG } from '../../../components/other/SVGs';
import { FONT_FAMILIES } from '../../../utils/font';
import { bitcoinDecimals, opaqueBackgroundColor } from '../../../utils/constants';
import { formatUnits } from 'ethers/lib/utils';
import QRCode from 'qrcode.react';
import swapReservationsAggregatorABI from '../../../abis/SwapReservationsAggregator.json';
import { getDepositVaults, getSwapReservations } from '../../../utils/contractReadFunctions';
import { BigNumber } from 'ethers';
import depositVaultAggregatorABI from '../../../abis/DepositVaultsAggregator.json';
import { parseUnits } from 'viem';
import { bitcoin } from 'bitcoinjs-lib/src/networks';
import { SwapReservation } from '../../../types';
import { LuCopy } from 'react-icons/lu';
import { AssetTag } from '../../../components/other/AssetTag';

declare global {
    interface Window {
        rift?: any;
    }
}

const ReservationDetails = () => {
    const router = useRouter();
    const { swapReservationURL } = router.query;
    const setSwapFlowState = useStore((state) => state.setSwapFlowState);
    const swapFlowState = useStore((state) => state.swapFlowState);
    const [address, setAddress] = useState('');
    const [loadingState, setLoadingState] = useState(true);
    const [error, setError] = useState('');
    const [totalSwapAmountInSats, setTotalSwapAmountInSats] = useState(0);
    const [bitcoinUri, setBitcoinUri] = useState(null);
    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);
    const bitcoinSwapTransactionHash = useStore((state) => state.bitcoinSwapTransactionHash);
    const setBitcoinSwapTransactionHash = useStore((state) => state.setBitcoinSwapTransactionHash);
    const ethersRpcProvider = useStore((state) => state.ethersRpcProvider);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const setUsdtOutputSwapAmount = useStore((state) => state.setUsdtOutputSwapAmount);
    const usdtOutputSwapAmount = useStore((state) => state.usdtOutputSwapAmount);
    const btcInputSwapAmount = useStore((state) => state.btcInputSwapAmount);
    const setBtcInputSwapAmount = useStore((state) => state.setBtcInputSwapAmount);
    const [swapReservationData, setSwapReservationData] = useState<SwapReservation | null>(null);
    const [proxyWalletSwapInternalID, setProxyWalletSwapInternalID] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && address && totalSwapAmountInSats) {
            const uri = `bitcoin:${address}?amount=${formatUnits(totalSwapAmountInSats, bitcoinDecimals)}&label=Rift%20Exchange%20Swap`;
            setBitcoinUri(uri);
        }
    }, [address, lowestFeeReservationParams, totalSwapAmountInSats]);

    useEffect(() => {
        if (!address || !totalSwapAmountInSats || btcInputSwapAmount === '-1' || usdtOutputSwapAmount === '-1' || !btcInputSwapAmount || !usdtOutputSwapAmount) {
            setLoadingState(true);
        } else {
            setLoadingState(false);
        }
    }, [address, totalSwapAmountInSats]);

    useEffect(() => {
        setSwapFlowState('2-send-bitcoin');
        setBtcInputSwapAmount('-1');
        setUsdtOutputSwapAmount('-1');
    }, []);

    // constantly look for swap status updates from proxy wallet
    useEffect(() => {
        const checkSwapStatus = async () => {
            if (typeof window === 'undefined' || !window.rift || !window.rift.getRiftSwapStatus || !swapReservationData) {
                setError('Rift wallet not detected or getRiftSwapStatus not available.');
                return;
            }

            setError(null);

            if (swapReservationData) {
                const walletInfo = await window.rift.getProxyWallet({ orderNonceHex: swapReservationData.nonce });
                if (walletInfo && walletInfo.address) {
                    setAddress(walletInfo.address);
                } else {
                    setError('Unable to retrieve Bitcoin address from wallet info.');
                }
            }

            window.rift
                .getRiftSwapStatus({ internalId: swapReservationData.nonce })
                .then((status) => {
                    console.log('Swap status:', status);
                    if (status.status === 1 && swapFlowState != '3-receive-eth') {
                        console.log('Proxy wallet has recieved payment & broadcasted txn!');
                        setSwapFlowState('3-receive-eth');
                        setBitcoinSwapTransactionHash(status.paymentTxid);
                    }
                    setProxyWalletSwapInternalID(status.internalId);
                })
                .catch((err) => {
                    console.error('Error fetching swap status:', err);
                });
        };

        if (typeof window !== 'undefined') {
            checkSwapStatus();
            const intervalId = setInterval(checkSwapStatus, 1000);
            return () => clearInterval(intervalId);
        }
    }, [swapReservationData?.nonce]);

    useEffect(() => {
        const fetchData = async () => {
            if (swapReservationURL && typeof swapReservationURL === 'string') {
                try {
                    const reservationDetails = await fetchReservationDetails(swapReservationURL, ethersRpcProvider, selectedInputAsset);
                    console.log('Fetching reservation details...');
                    console.log('Reservation details:', reservationDetails);
                    setSwapReservationData(reservationDetails.swapReservationData);
                    setUsdtOutputSwapAmount(reservationDetails.totalReservedAmountInUsdt);
                    setBtcInputSwapAmount(reservationDetails.btcInputSwapAmount);
                    setTotalSwapAmountInSats(reservationDetails.totalSwapAmountInSats);
                } catch (error) {
                    console.error('Error fetching reservation details:', error);
                }
            }
        };

        fetchData();
    }, [swapReservationURL, ethersRpcProvider, selectedInputAsset]);

    return (
        <>
            <OpenGraph />
            <Flex h='100vh' width='100%' direction='column' backgroundImage={'/images/rift_background_low.webp'} backgroundSize='cover' backgroundPosition='center'>
                <Navbar />
                <Flex direction={'column'} align='center' w='100%' mt={'100px'}>
                    <Flex width='1000px' align={'center'} direction={'column'}>
                        <SwapAmounts />
                        {!loadingState && (
                            <Flex justify={'center'} w='100%' mt='20px'>
                                <SwapStatusTimeline />
                            </Flex>
                        )}
                        {/* MAIN CONTAINER */}
                        <Flex
                            {...opaqueBackgroundColor}
                            w='100%'
                            mt='20px'
                            borderRadius='30px'
                            px='40px'
                            boxShadow={'0px 0px 20px 2px rgba(0, 0, 0, 0.1)'}
                            direction='column'
                            py='35px'
                            align='center'
                            borderWidth={3}
                            borderColor={colors.borderGray}>
                            {loadingState ? (
                                <Flex mb='20px' mt='20px'>
                                    <Spinner color={colors.textGray} h={'50px'} w={'50px'} thickness='3px' speed='0.65s' />
                                </Flex>
                            ) : swapFlowState === '3-receive-eth' || swapFlowState === '4-completed' ? (
                                <RecieveUsdt />
                            ) : (
                                <>
                                    {/* CHROME EXTENSION DETECTED */}
                                    {typeof window !== 'undefined' && window.rift ? (
                                        <>
                                            <Text
                                                fontSize='16px'
                                                textAlign='center'
                                                w='800px'
                                                mt='-2px'
                                                mb='20px'
                                                fontWeight={'normal'}
                                                color={colors.darkerGray}
                                                fontFamily={FONT_FAMILIES.AUX_MONO}>
                                                Your reservation is confirmed and your Rift Proxy Wallet is detected! Please send the Bitcoin amount to the address below:
                                            </Text>
                                            <Flex mt='10px' mx='10px'>
                                                {bitcoinUri && bitcoinUri !== '' && (
                                                    <Flex
                                                        py='10px'
                                                        px='10px'
                                                        w={'270px'}
                                                        borderRadius='10px'
                                                        bg='white'
                                                        mr='40px'
                                                        boxShadow={'0px 15px 15px rgba(0, 16, 118, 0.4)'}>
                                                        <QRCode value={bitcoinUri} size={250} />
                                                    </Flex>
                                                )}
                                                <Flex direction={'column'}>
                                                    <Text mt='8px' fontSize='16px' color={colors.textGray} fontFamily={FONT_FAMILIES.NOSTROMO}>
                                                        Bitcoin Address:
                                                    </Text>
                                                    <Flex direction='column' alignItems='flex-start' maxW='200px'>
                                                        {address ? (
                                                            <>
                                                                <Text
                                                                    mt='6px'
                                                                    fontSize='25px'
                                                                    display='inline-flex'
                                                                    letterSpacing={'-1px'}
                                                                    color={colors.offWhite}
                                                                    fontFamily={FONT_FAMILIES.AUX_MONO}
                                                                    whiteSpace='nowrap'
                                                                    overflow='hidden'
                                                                    textOverflow='ellipsis'>
                                                                    {address.slice(0, Math.floor((2 / 3) * address.length))}
                                                                </Text>
                                                                <Flex alignItems='center'>
                                                                    <Text
                                                                        letterSpacing={'-1px'}
                                                                        fontSize='25px'
                                                                        display='inline-flex'
                                                                        color={colors.offWhite}
                                                                        fontFamily={FONT_FAMILIES.AUX_MONO}>
                                                                        {address.slice(Math.floor((2 / 3) * address.length))}
                                                                    </Text>
                                                                    <LuCopy
                                                                        color='gray'
                                                                        size={20}
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            marginLeft: '10px',
                                                                        }}
                                                                        onClick={() => navigator.clipboard.writeText(address)}
                                                                    />
                                                                </Flex>
                                                            </>
                                                        ) : (
                                                            <Text mt='2px' fontSize='25px' color={colors.offWhite} fontFamily={FONT_FAMILIES.AUX_MONO}>
                                                                Loading...
                                                            </Text>
                                                        )}
                                                    </Flex>

                                                    <Text mt='25px' fontSize='16px' mb='-18px' color={colors.textGray} fontFamily={FONT_FAMILIES.NOSTROMO}>
                                                        Deposit Amount:{' '}
                                                    </Text>
                                                    <Flex alignItems='center'>
                                                        <Text
                                                            letterSpacing={'-1px'}
                                                            mt='2px'
                                                            fontSize='25px'
                                                            width={'500px'}
                                                            color={colors.offWhite}
                                                            fontFamily={FONT_FAMILIES.AUX_MONO}
                                                            display='inline-flex'
                                                            flexDirection='row'
                                                            alignItems='center'>
                                                            {totalSwapAmountInSats ? (
                                                                <>
                                                                    {formatUnits(totalSwapAmountInSats, bitcoinDecimals)}
                                                                    <LuCopy
                                                                        color='gray'
                                                                        size={20}
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            marginLeft: '10px',
                                                                        }}
                                                                        onClick={() =>
                                                                            navigator.clipboard.writeText(formatUnits(totalSwapAmountInSats, bitcoinDecimals).toString())
                                                                        }
                                                                    />
                                                                    <Flex ml='20px' mt='-1px'>
                                                                        <AssetTag assetName='BTC' width='75px' />
                                                                    </Flex>
                                                                </>
                                                            ) : (
                                                                'Loading...'
                                                            )}
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                            </Flex>

                                            <Text fontWeight={'normal'} fontSize='13px' mt='32px' color={colors.darkerGray} fontFamily={FONT_FAMILIES.AUX_MONO}>
                                                {proxyWalletSwapInternalID ? 'Internal ID - ' + proxyWalletSwapInternalID : 'Loading internal id...'}
                                            </Text>
                                        </>
                                    ) : (
                                        // INSTALL CHROME EXTENSION
                                        <>
                                            <Flex
                                                bg={colors.offBlack}
                                                w='100%'
                                                mt='20px'
                                                borderRadius='30px'
                                                px='20px'
                                                direction='column'
                                                py='35px'
                                                align='center'
                                                borderWidth={3}
                                                borderColor={colors.borderGray}>
                                                <Flex maxW='600px' mt='20px' direction='column' align='center'>
                                                    <WarningSVG width='60px' />

                                                    <Text
                                                        fontSize='15px'
                                                        fontWeight='normal'
                                                        color={colors.textGray}
                                                        fontFamily={FONT_FAMILIES.AUX_MONO}
                                                        textAlign='center'
                                                        mt='20px'
                                                        flex='1'>
                                                        Your Rift Proxy Wallet is not detected. If this is your first time swapping, please add the Rift Chrome Extension below:
                                                    </Text>
                                                    <Flex
                                                        width='100%'
                                                        mt='60px'
                                                        height='110px'
                                                        mb='50px'
                                                        onClick={() => {
                                                            window.open('https://chromewebstore.google.com/', '_blank');
                                                        }}
                                                        cursor='pointer'
                                                        flexShrink={0}
                                                        bg={colors.purpleBackground}
                                                        align='center'
                                                        justify='center'
                                                        borderWidth={3}
                                                        borderColor={colors.purpleBorder}
                                                        borderRadius='full'
                                                        filter='drop-shadow(0px 0px 34.9px rgba(46, 64, 183, 0.33))'>
                                                        <ChromeLogoSVG width='70px' />
                                                        <Text fontSize='25px' ml='12px' fontFamily={FONT_FAMILIES.NOSTROMO}>
                                                            INSTALL CHROME EXTENSION
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                            </Flex>
                                            <Flex
                                                bg={colors.offBlack}
                                                _hover={{ bg: colors.offBlackLighter }}
                                                w='400px'
                                                mt='25px'
                                                transition='0.2s'
                                                h='45px'
                                                fontSize='15px'
                                                align='center'
                                                userSelect='none'
                                                cursor='pointer'
                                                borderRadius='10px'
                                                justify='center'
                                                borderWidth='2px'
                                                borderColor={colors.offBlackLighter2}>
                                                <WarningSVG fill={colors.textGray} width='18px' />
                                                <Text ml='10px' color={colors.textGray} fontFamily='Nostromo'>
                                                    Rift Wallet Not Detected
                                                </Text>
                                            </Flex>
                                        </>
                                    )}
                                </>
                            )}
                        </Flex>
                        {!loadingState && swapFlowState === '2-send-bitcoin' && (
                            <Flex
                                bg={colors.purpleBackgroundDisabled}
                                borderColor={colors.purpleBorderDark}
                                borderWidth={3}
                                borderRadius='15px'
                                px='20px'
                                w='540px'
                                py='4px'
                                mt={'20px'}
                                h={'60px'}
                                align={'center'}
                                justify={'center'}>
                                <Text fontSize={'18px'} mr='15px' color={colors.textGray} fontFamily={FONT_FAMILIES.NOSTROMO}>
                                    AWAITING BITCOIN PAYMENT
                                </Text>
                                <Spinner w={'20px'} h={'20px'} thickness='3px' color={colors.purpleBorder} speed='0.65s' />
                            </Flex>
                        )}
                    </Flex>
                </Flex>
                <CurrencyModal />
            </Flex>
        </>
    );
};

export default ReservationDetails;
