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

    useEffect(() => {
        if (typeof window !== 'undefined' && address && lowestFeeReservationParams?.totalSwapAmountInSats) {
            const uri = `bitcoin:${address}?amount=${formatUnits(
                lowestFeeReservationParams.totalSwapAmountInSats,
                bitcoinDecimals,
            )}&label=Rift%20Exchange%20Swap`;
            console.log('Bitcoin URI:', uri);
            setBitcoinUri(uri);
        }
    }, [address, lowestFeeReservationParams]);

    useEffect(() => {
        const fetchAddress = async () => {
            if (typeof window !== 'undefined' && window.rift && window.rift.getProxyWallet) {
                try {
                    const walletInfo = await window.rift.getProxyWallet();
                    if (walletInfo && walletInfo.address) {
                        setAddress(walletInfo.address);
                        console.log('walletInfo:', walletInfo);
                    } else {
                        // setError('Unable to retrieve Bitcoin address from wallet info.');
                    }
                    setTotalSwapAmountInSats(lowestFeeReservationParams?.totalSwapAmountInSats);
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
    }, []);

    // constantly look for swap status updates from proxy wallet
    useEffect(() => {
        const checkSwapStatuses = () => {
            if (typeof window !== 'undefined' && window.rift && window.rift.getAllRiftSwapStatuses) {
                setError(null);
                window.rift
                    .getAllRiftSwapStatuses()
                    .then((statuses) => {
                        // console.log('Swap Statuses:', statuses[0]);
                        if (statuses[0].status === 1) {
                            console.log('Proxy wallet Swap is complete!');
                            setSwapFlowState('3-receive-eth');
                            setBitcoinSwapTransactionHash(statuses[0].paymentTxid);
                        }
                    })
                    .catch((err) => {
                        console.error('Error fetching swap statuses:', err);
                    });
            } else {
                setError('Rift wallet not detected or getAllRiftSwapStatuses not available.');
                console.error('Rift wallet not detected or getAllRiftSwapStatuses not available.');
            }
        };

        if (typeof window !== 'undefined') {
            checkSwapStatuses();
            const intervalId = setInterval(checkSwapStatuses, 1000);
            return () => clearInterval(intervalId);
        }
    }, []);

    // fetch reservation details from url
    useEffect(() => {
        const fetchReservationDetails = async () => {
            if (swapReservationURL) {
                try {
                    // [0] decode swap reservaiton details from url
                    const reservationDetails = decodeReservationUrl(swapReservationURL as string);

                    // [1] fetch & decode swap reservation details from contract
                    const swapAggregatorBytecode = swapReservationsAggregatorABI.bytecode;
                    const swapAggregatorAbi = swapReservationsAggregatorABI.abi;
                    const swapReservations = await getSwapReservations(
                        ethersRpcProvider,
                        swapAggregatorBytecode.object,
                        swapAggregatorAbi,
                        selectedInputAsset.riftExchangeContractAddress,
                        [parseInt(reservationDetails.reservationId)],
                    );
                    const swapReservationData: any = swapReservations[0];
                    console.log('swapReservationData:', swapReservationData);

                    // [2] convert BigNumber reserved vault indexes to numbers
                    const reservedVaultIndexesConverted = swapReservationData.vaultIndexes.map((index) =>
                        index.toNumber(),
                    );

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

                    // [4] initialize variables to accumulate the total values
                    let totalReservedAmountInµUsdt = BigNumber.from(0);
                    let totalBtcInputInSats = BigNumber.from(0);

                    // [5] LOOP over reserved deposit vaults and sum sat inputs and µUsdt outputs
                    for (let i = 0; i < reservedVaults.length; i++) {
                        // [0] get the deposit vault and reserved amount
                        const vault = reservedVaults[i];
                        const reservedAmountInµUsdt = BigNumber.from(reservedAmounts[i]);
                        console.log('reservedAmountInµUsdt:', reservedAmountInµUsdt.toString());
                        const btcExchangeRate = vault.btcExchangeRate;

                        // [1] buffer reserved amount to 18 decimals
                        const reservedAmountInµUsdtBufferedTo18Decimals = bufferTo18Decimals(
                            reservedAmountInµUsdt,
                            selectedInputAsset.decimals,
                        );

                        console.log('VAULT:', i);
                        console.log(
                            'reservedAmountInµUsdtBufferedTo18Decimals:',
                            reservedAmountInµUsdtBufferedTo18Decimals.toString(),
                        );
                        console.log('btcExchangeRate:', btcExchangeRate.toString());

                        // [2] divide by exchange rate (which is already in smallest token units buffered to 18 decimals per sat)
                        const inputAmountInSats = reservedAmountInµUsdtBufferedTo18Decimals.div(btcExchangeRate);
                        console.log('inputAmountInSats:', inputAmountInSats.toString());

                        totalReservedAmountInµUsdt = totalReservedAmountInµUsdt.add(reservedAmountInµUsdt);
                        totalBtcInputInSats = totalBtcInputInSats.add(inputAmountInSats);
                    }

                    console.log('totalBtcInputInSats:', totalBtcInputInSats.toString());
                    console.log('totalReservedAmount:', totalReservedAmountInµUsdt.toString());

                    // convert to USDT
                    const totalReservedAmountInUsdt = formatUnits(
                        totalReservedAmountInµUsdt,
                        selectedInputAsset.decimals,
                    );

                    console.log('totalReservedAmountInUsdt:', totalReservedAmountInUsdt);

                    setUsdtOutputSwapAmount(totalReservedAmountInUsdt);
                    console.log('setUsdtOutputSwapAmount:', totalReservedAmountInUsdt);

                    setBtcInputSwapAmount(formatUnits(totalBtcInputInSats, bitcoinDecimals));
                    console.log('setBtcInputSwapAmount:', totalBtcInputInSats);
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
