import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../../store';
import { Text, Flex, Image, Center, Box, Button, color, Spinner } from '@chakra-ui/react';
import { Navbar } from '../../../components/Navbar';
import { colors } from '../../../utils/colors';
import {
    bufferTo18Decimals,
    calculateBtcOutputAmountFromExchangeRate,
    decodeReservationUrl,
} from '../../../utils/dappHelper';
import CurrencyModal from '../../../components/swap/CurrencyModal';
import { Step3 } from '../../../components/swap/Step3';
import { SwapStatusTimeline } from '../../../components/swap/SwapStatusTimeline';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { SwapAmounts } from '../../../components/swap/SwapAmounts';
import { OpenGraph } from '../../../components/background/OpenGraph';
import { ChromeLogoSVG, WarningSVG } from '../../../components/other/SVGs';
import { FONT_FAMILIES } from '../../../utils/font';
import { bitcoinDecimals } from '../../../utils/constants';
import { formatUnits } from 'ethers/lib/utils';
import QRCode from 'qrcode.react';
import swapReservationsAggregatorABI from '../../../abis/SwapReservationsAggregator.json';
import { getDepositVaults, getSwapReservations } from '../../../utils/contractReadFunctions';
import { BigNumber } from 'ethers';
import depositVaultAggregatorABI from '../../../abis/DepositVaultsAggregator.json';
import { parseUnits } from 'viem';
import { bitcoin } from 'bitcoinjs-lib/src/networks';
import { SwapReservation } from '../../../types';

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
    const [loading, setLoading] = useState(true);
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
    const setBtcInputSwapAmount = useStore((state) => state.setBtcInputSwapAmount);
    const [swapReservationData, setSwapReservationData] = useState<SwapReservation | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && address && lowestFeeReservationParams?.totalSatsInputInlcudingProxyFee) {
            const uri = `bitcoin:${address}?amount=${formatUnits(
                lowestFeeReservationParams.totalSatsInputInlcudingProxyFee,
                bitcoinDecimals,
            )}&label=Rift%20Exchange%20Swap`;
            console.log('Bitcoin URI:', uri);
            setBitcoinUri(uri);
        }
    }, [address, lowestFeeReservationParams]);

    useEffect(() => {
        setSwapFlowState('2-send-bitcoin');
        setBtcInputSwapAmount('-1');
        setUsdtOutputSwapAmount('-1');
    }, []);

    useEffect(() => {
        const fetchAddress = async () => {
            if (typeof window !== 'undefined' && window.rift && window.rift.getProxyWallet) {
                try {
                    const walletInfo = await window.rift.getProxyWallet();
                    if (walletInfo && walletInfo.address) {
                        setAddress(walletInfo.address);
                    } else {
                        // setError('Unable to retrieve Bitcoin address from wallet info.');
                    }
                    setTotalSwapAmountInSats(lowestFeeReservationParams?.totalSatsInputInlcudingProxyFee.toNumber());
                } catch (err) {
                    setError('Error fetching wallet information.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setError('Rift wallet not detected or getProxyWallet not available.');
                setLoading(false);
            }
        };

        fetchAddress();
    }, [lowestFeeReservationParams]);

    // constantly look for swap status updates from proxy wallet
    useEffect(() => {
        const checkSwapStatus = () => {
            if (
                typeof window === 'undefined' ||
                !window.rift ||
                !window.rift.getRiftSwapStatus ||
                !swapReservationData
            ) {
                setError('Rift wallet not detected or getRiftSwapStatus not available.');
                console.error('Rift wallet not detected or getRiftSwapStatus not available.');
                return; // Early return if any of the required objects or methods doesn't exist
            }

            setError(null);
            window.rift
                .getRiftSwapStatus({ internalId: swapReservationData.nonce })
                .then((status) => {
                    if (status.status === 1) {
                        console.log('Proxy wallet Swap is complete!');
                        setSwapFlowState('3-receive-eth');
                        setBitcoinSwapTransactionHash(status.paymentTxid);
                    }
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

    // fetch reservation details from url
    useEffect(() => {
        const fetchReservationDetails = async () => {
            if (swapReservationURL) {
                try {
                    // [0] decode swap reservaiton details from url
                    const reservationDetails = decodeReservationUrl(swapReservationURL as string);

                    console.log('URL reservationDetails:', reservationDetails);
                    // [1] fetch & decode swap reservation details from contract
                    const swapAggregatorBytecode = swapReservationsAggregatorABI.bytecode;
                    const swapAggregatorAbi = swapReservationsAggregatorABI.abi;
                    const swapReservations = await getSwapReservations(
                        ethersRpcProvider,
                        swapAggregatorBytecode.object,
                        swapAggregatorAbi,
                        selectedInputAsset.riftExchangeContractAddress,
                        [parseInt(reservationDetails.reservationId)], // TODO: update this if we add overwriting slots
                    );

                    const swapReservationData: SwapReservation = swapReservations[0];
                    console.log('swapReservationData from URL:', swapReservationData);
                    const totalInputAmountInSatsIncludingProxyWalletFee =
                        swapReservationData.totalSatsInputInlcudingProxyFee;
                    const totalReservedAmountInµUsdt = swapReservationData.totalSwapOutputAmount;
                    setSwapReservationData(swapReservationData);

                    // [2] convert BigNumber reserved vault indexes to numbers
                    const reservedVaultIndexesConverted = swapReservationData.vaultIndexes.map((index) => index);

                    // [3] fetch the reserved deposit vaults on the reservation
                    const depositVaultBytecode = depositVaultAggregatorABI.bytecode;
                    const depositVaultAbi = depositVaultAggregatorABI.abi;
                    const reservedVaults = await getDepositVaults(
                        ethersRpcProvider,
                        depositVaultBytecode.object,
                        depositVaultAbi,
                        selectedInputAsset.riftExchangeContractAddress,
                        reservedVaultIndexesConverted,
                    );

                    const reservedAmounts = swapReservationData.amountsToReserve;
                    console.log('reservedVaults:', reservedVaults);
                    console.log('reservedAmounts:', reservedAmounts[0].toString());

                    // convert to USDT
                    const totalReservedAmountInUsdt = formatUnits(
                        totalReservedAmountInµUsdt,
                        selectedInputAsset.decimals,
                    );

                    setUsdtOutputSwapAmount(totalReservedAmountInUsdt);

                    setBtcInputSwapAmount(
                        formatUnits(
                            totalInputAmountInSatsIncludingProxyWalletFee.toString(),
                            bitcoinDecimals,
                        ).toString(),
                    );
                } catch (error) {
                    console.error('Error fetching reservation details:', error);
                }
            }
        };

        fetchReservationDetails();
    }, [swapReservationURL]);

    return (
        <>
            <OpenGraph />
            <Flex
                h='100vh'
                width='100%'
                direction='column'
                backgroundImage={'/images/rift_background_low.webp'}
                backgroundSize='cover'
                backgroundPosition='center'>
                <Navbar />
                <Flex direction={'column'} align='center' w='100%' mt={'100px'}>
                    <Flex width='1000px' align={'center'} direction={'column'}>
                        <SwapAmounts />
                        <Flex justify={'center'} w='100%' mt='50px'>
                            <SwapStatusTimeline />
                        </Flex>
                        <>
                            {typeof window !== 'undefined' && window.rift ? (
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
                                    <Text
                                        fontSize='25px'
                                        fontFamily={FONT_FAMILIES.NOSTROMO}
                                        color={colors.textGray}
                                        mb='20px'>
                                        Chrome extension detected!
                                    </Text>
                                    {loading ? (
                                        <Spinner color={colors.textGray} size='xl' />
                                    ) : error ? (
                                        <Text color={colors.textGray} fontFamily={FONT_FAMILIES.AUX_MONO}>
                                            {error}
                                        </Text>
                                    ) : (
                                        <>
                                            {bitcoinUri && bitcoinUri !== '' && (
                                                <QRCode value={bitcoinUri} size={200} />
                                            )}
                                            <Text
                                                mt='20px'
                                                fontSize='16px'
                                                color={colors.textGray}
                                                fontFamily={FONT_FAMILIES.AUX_MONO}>
                                                Bitcoin Address : {address ? address : 'Loading...'}
                                            </Text>
                                            <Text
                                                mt='20px'
                                                fontSize='16px'
                                                color={colors.textGray}
                                                fontFamily={FONT_FAMILIES.AUX_MONO}>
                                                Deposit Amount:{' '}
                                                {totalSwapAmountInSats
                                                    ? formatUnits(totalSwapAmountInSats, bitcoinDecimals) + ' BTC'
                                                    : 'Loading...'}
                                            </Text>
                                        </>
                                    )}
                                </Flex>
                            ) : (
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
                                                Your Rift Proxy Wallet is not detected. If this is your first time
                                                swapping, please add the Rift Chrome Extension below:
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
                    </Flex>
                </Flex>
                <CurrencyModal />
            </Flex>
        </>
    );
};

export default ReservationDetails;
