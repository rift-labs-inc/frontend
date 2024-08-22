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
import useWindowSize from '../../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef, ChangeEvent, use } from 'react';
import styled from 'styled-components';
import { colors } from '../../utils/colors';
import { BTCSVG, ETHSVG, InfoSVG } from '../other/SVGs';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import {
    ethToWei,
    weiToEth,
    btcToSats,
    findVaultIndexToOverwrite,
    findVaultIndexWithSameExchangeRate,
    satsToBtc,
    bufferTo18Decimals,
    convertToBitcoinLockingScript,
} from '../../utils/dappHelper';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { BigNumber, ethers } from 'ethers';
import { useStore } from '../../store';
import { FONT_FAMILIES } from '../../utils/font';
import { useDepositLiquidity } from '../../hooks/contract/useDepositLiquidity';
import DepositStatusModal from './DepositStatusModal';
import WhiteText from '../other/WhiteText';
import OrangeText from '../other/OrangeText';
import { AssetTag } from '../other/AssetTag';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { bitcoinDecimals } from '../../utils/constants';
import { CheckCircleIcon, CheckIcon } from '@chakra-ui/icons';
import { HiOutlineXCircle, HiXCircle } from 'react-icons/hi';
import { IoCheckmarkDoneCircle } from 'react-icons/io5';
import { IoMdCheckmarkCircle } from 'react-icons/io';

type ActiveTab = 'swap' | 'liquidity';

export const DepositUI = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';

    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { data: walletClient } = useWalletClient();
    const { chains, error, switchChain } = useSwitchChain();
    const {
        depositLiquidity,
        status: depositLiquidityStatus,
        error: depositLiquidityError,
        txHash,
        resetDepositState,
    } = useDepositLiquidity();
    const ethersRpcProvider = useStore((state) => state.ethersRpcProvider);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const setBitcoinPriceUSD = useStore((state) => state.setBitcoinPriceUSD);
    const setShowManageDepositVaultsScreen = useStore((state) => state.setShowManageDepositVaultsScreen);
    const selectedAsset = useStore((state) => state.selectedAsset);
    const setSelectedAsset = useStore((state) => state.setSelectedAsset);

    const [tokenDepositAmount, setTokenDepositAmount] = useState('');
    const [tokenDepositAmountUSD, setTokenDepositAmountUSD] = useState('0.00');

    const [profitPercentage, setProfitPercentage] = useState('');
    const [profitAmountUSD, setProfitAmountUSD] = useState('0.00');

    const [bitcoinOutputAmount, setBitcoinOutputAmount] = useState('');
    const [bitcoinOutputAmountUSD, setBitcoinOutputAmountUSD] = useState('0.00');

    const [payoutBTCAddress, setPayoutBTCAddress] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tokenPriceUSD = useStore.getState().validAssets[selectedAsset.name].priceUSD;
    const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);

    useEffect(() => {
        if (isWaitingForConnection && isConnected) {
            setIsWaitingForConnection(false);
            proceedWithDeposit();
        }
    }, [isConnected, isWaitingForConnection]);

    // calculate profit amount in USD
    useEffect(() => {
        const profitAmountUSD = `${(
            ((parseFloat(tokenDepositAmount) * parseFloat(profitPercentage)) / 100) *
            (tokenPriceUSD ?? 0)
        ).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        })}`;

        setProfitAmountUSD(!profitPercentage || !tokenDepositAmount || profitPercentage == '-' ? '$0.00' : profitAmountUSD);
    }, [tokenDepositAmount, profitPercentage]);

    // calculate deposit amount in USD
    useEffect(() => {
        const tokenDepositAmountUSD =
            tokenPriceUSD && tokenDepositAmount
                ? (tokenPriceUSD * parseFloat(tokenDepositAmount)).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                  })
                : '$0.00';
        setTokenDepositAmountUSD(tokenDepositAmountUSD);
    }, [tokenDepositAmount]);

    useEffect(() => {
        console.log('IS CONNECTED:', isConnected);
    }, [isConnected]);

    // calculate Bitcoin output amount in USD
    useEffect(() => {
        console.log('bitcoinPriceUSD:', bitcoinPriceUSD);
        const bitcoinOutputAmountUSD =
            bitcoinPriceUSD && bitcoinOutputAmount
                ? (bitcoinPriceUSD * parseFloat(bitcoinOutputAmount)).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                  })
                : '$0.00';
        setBitcoinOutputAmountUSD(bitcoinOutputAmountUSD);
    }, [bitcoinOutputAmount]);

    // ---------- DEPOSIT TOKEN AMOUNT ---------- //
    const handleTokenDepositChange = (e: ChangeEvent<HTMLInputElement>) => {
        const maxDecimals = useStore.getState().validAssets[selectedAsset.name].decimals;
        const tokenValue = e.target.value;

        const validateTokenDepositChange = (value: string) => {
            if (value === '') return true;
            const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
            return regex.test(value);
        };

        if (validateTokenDepositChange(tokenValue)) {
            setTokenDepositAmount(tokenValue);
            calculateBitcoinOutputAmount(tokenValue, undefined);
        }
    };

    // ---------- PROFIT PERCENTAGE ---------- //
    const handleProfitPercentageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const profitPercentageValue = e.target.value.replace('%', '');

        if (validateProfitPercentage(profitPercentageValue)) {
            setProfitPercentage(profitPercentageValue);
            calculateBitcoinOutputAmount(undefined, profitPercentageValue);
        } else {
            console.log('Invalid profit percentage');
        }
    };

    const handleProfitPercentageFocus = (value: string) => {
        // remove percentage sign and plus/minus sign on focus
        let ProfitPercentageValue = value.replace('%', '').replace(/^\+/, '');
        setProfitPercentage(ProfitPercentageValue);
    };

    const handleProfitPercentageBlur = () => {
        // add percentage sign and plus/minus sign on blur
        if (profitPercentage === '-') setProfitPercentage('');
        else if (profitPercentage !== '') {
            let formattedProfitPercentage = profitPercentage;
            if (!formattedProfitPercentage.endsWith('%')) {
                if (!formattedProfitPercentage.startsWith('-') && /^[0-9]/.test(formattedProfitPercentage)) {
                    // Check if it's numeric and not negative
                    formattedProfitPercentage = '+' + formattedProfitPercentage;
                }
                formattedProfitPercentage += '%';
            }
            setProfitPercentage(formattedProfitPercentage);
        }
    };

    const calculateProfitPercent = (bitcoinAmount: string) => {
        const startValue = parseFloat(tokenDepositAmount);
        const endValue =
            parseFloat(bitcoinAmount) * useStore.getState().validAssets[selectedAsset.name].exchangeRateInTokenPerBTC;

        const newProfitPercentage = (((endValue - startValue) / startValue) * 100).toFixed(2);
        if (validateProfitPercentage(newProfitPercentage)) {
            let formattedProfitPercentage = newProfitPercentage;
            if (!formattedProfitPercentage.startsWith('-') && /^[0-9]/.test(formattedProfitPercentage)) {
                // Check if it's numeric and not negative
                formattedProfitPercentage = '+' + formattedProfitPercentage;
            }
            formattedProfitPercentage += '%';
            setProfitPercentage(formattedProfitPercentage);
        }
    };

    const validateProfitPercentage = (value) => {
        // max 2 decimal places and optional minus sign
        if (value === '') return true;
        const regex = /^-?\d*(\.\d{0,2})?$/;
        return regex.test(value);
    };

    // ---------- BITCOIN OUTPUT AMOUNT ---------- //
    const handleBitcoinOutputAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const bitcoinOutputAmountValue = e.target.value;

        if (validateBitcoinOutputAmount(bitcoinOutputAmountValue)) {
            setBitcoinOutputAmount(bitcoinOutputAmountValue === '0.0' ? '' : bitcoinOutputAmountValue);
            calculateProfitPercent(bitcoinOutputAmountValue);
        }
    };

    const calculateBitcoinOutputAmount = (newEthDepositAmount: string | undefined, newProfitPercentage: string | undefined) => {
        if (tokenPriceUSD && bitcoinPriceUSD) {
            console.log('newProfitPercentage:', newProfitPercentage);
            const profitAmountInToken =
                parseFloat(newEthDepositAmount ?? tokenDepositAmount) *
                (parseFloat(newProfitPercentage ?? profitPercentage) / 100);
            const totalTokenUSD =
                parseFloat(newEthDepositAmount ?? tokenDepositAmount) * tokenPriceUSD + profitAmountInToken * tokenPriceUSD;
            const newBitcoinOutputAmount = totalTokenUSD / bitcoinPriceUSD > 0 ? totalTokenUSD / bitcoinPriceUSD : 0;
            const formattedBitcoinOutputAmount = newBitcoinOutputAmount == 0 ? '0.0' : newBitcoinOutputAmount.toFixed(7);

            if (validateBitcoinOutputAmount(formattedBitcoinOutputAmount)) {
                setBitcoinOutputAmount(formattedBitcoinOutputAmount === '0.0' ? '' : formattedBitcoinOutputAmount);
            }
            // Calculate the profit amount in USD

            const profitAmountUSD = `${(
                ((parseFloat(tokenDepositAmount) * parseFloat(newProfitPercentage ?? profitPercentage)) / 100) *
                tokenPriceUSD
            ).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })}`;
            setProfitAmountUSD(profitAmountUSD);

            // Calculate and update the deposit amount in USD
            console.log('tokenDepositAmount:', tokenDepositAmount);
            const tokenDepositAmountUSD =
                tokenPriceUSD && tokenDepositAmount
                    ? (tokenPriceUSD * parseFloat(tokenDepositAmount)).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                      })
                    : '$0.00';
            setTokenDepositAmountUSD(tokenDepositAmountUSD);
        }
    };

    const validateBitcoinOutputAmount = (value: string) => {
        if (value === '') return true;
        const regex = /^\d*\.?\d*$/;
        return regex.test(value);
    };

    // ---------- BTC PAYOUT ADDRESS ---------- //
    const handleBTCPayoutAddressChange = (e) => {
        const BTCPayoutAddress = e.target.value;
        setPayoutBTCAddress(BTCPayoutAddress);
    };

    const validateBitcoinPayoutAddress = (address: string): boolean => {
        const p2pkhRegex = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/; // P2PKH addresses start with 1
        const p2shRegex = /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/; // P2SH addresses start with 3
        const bech32Regex = /^bc1q[a-zA-HJ-NP-Z0-9]{14,74}$/; // Bech32 addresses (SegWit) start with bc1q
        const taprootRegex = /^bc1p[a-zA-HJ-NP-Z0-9]{14,74}$/; // Taproot addresses start with bc1p

        return p2pkhRegex.test(address) || p2shRegex.test(address) || bech32Regex.test(address) || taprootRegex.test(address);
    };

    const BitcoinAddressValidation: React.FC<{ address: string }> = ({ address }) => {
        const isValid = validateBitcoinPayoutAddress(address);

        if (address.length === 0) {
            return <Text>...</Text>;
        }

        return (
            <Flex align='center'>
                {isValid ? (
                    <>
                        <IoMdCheckmarkCircle color='green' size={16} />
                        <Text color='green' ml={2}>
                            Valid address
                        </Text>
                    </>
                ) : (
                    <>
                        <HiXCircle color='red' size={16} />
                        <Text color='red' ml={2}>
                            Invalid address
                        </Text>
                    </>
                )}
            </Flex>
        );
    };
    // ---------- DEPOSIT ---------- //

    const initiateDeposit = async () => {
        if (!isConnected) {
            setIsWaitingForConnection(true);
            openConnectModal();
            return;
        }

        proceedWithDeposit();
    };

    const proceedWithDeposit = async () => {
        console.log('Wallet connection detected!');

        if (chainId !== selectedAsset.contractChainID) {
            console.log('Switching network');
            // TODO: Implement network switching logic here
            throw new Error('Please switch to the correct network');
        }

        if (window.ethereum) {
            // Reset the deposit state before starting a new deposit
            resetDepositState();
            setIsModalOpen(true);

            const vaultIndexToOverwrite = findVaultIndexToOverwrite();
            const vaultIndexWithSameExchangeRate = findVaultIndexWithSameExchangeRate();
            const tokenDecmials = useStore.getState().validAssets[selectedAsset.name].decimals;
            console.log('tokenDecmials:', tokenDecmials);
            const tokenDepositAmountInSmallestTokenUnits = parseUnits(tokenDepositAmount, tokenDecmials);
            console.log('tokenDepositAmountInSmallestTokenUnits:', tokenDepositAmountInSmallestTokenUnits.toString());
            const tokenDepositAmountInSmallestTokenUnitsBufferedTo18Decimals = bufferTo18Decimals(
                tokenDepositAmountInSmallestTokenUnits,
                tokenDecmials,
            );
            console.log(
                'tokenDepositAmountInSmallestTokenUnitsBufferedTo18Decimals:',
                tokenDepositAmountInSmallestTokenUnitsBufferedTo18Decimals.toString(),
            );
            const bitcoinOutputAmountInSats = parseUnits(bitcoinOutputAmount, bitcoinDecimals);
            console.log('bitcoinOutputAmountInSats:', bitcoinOutputAmountInSats.toString());
            const exchangeRate = tokenDepositAmountInSmallestTokenUnitsBufferedTo18Decimals.div(bitcoinOutputAmountInSats);
            console.log('exchangeRate:', exchangeRate.toString());

            const bitcoinPayoutLockingScript = convertToBitcoinLockingScript(payoutBTCAddress);

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            await depositLiquidity({
                signer: signer,
                riftExchangeAbi: selectedAsset.riftExchangeAbi,
                riftExchangeContractAddress: selectedAsset.riftExchangeContractAddress,
                tokenAddress: selectedAsset.tokenAddress,
                btcPayoutLockingScript: bitcoinPayoutLockingScript,
                btcExchangeRate: exchangeRate,
                vaultIndexToOverwrite,
                tokenDepositAmountInSmallestTokenUnits: tokenDepositAmountInSmallestTokenUnits,
                vaultIndexWithSameExchangeRate,
            });
        }
    };

    return (
        <Flex
            w='100%'
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
            <Text fontSize={'13px'} letterSpacing={'-1px'} textAlign={'center'}>
                Create a sell order by setting your <WhiteText>Exchange Rate</WhiteText>. Get payed out in
                <OrangeText> BTC</OrangeText> when your order is filled. Withdraw unreserved liquidity anytime.
            </Text>
            <Flex mt='25px' direction={'column'} overflow={'visible'}>
                {/* Content */}
                <Flex direction='column' align='center' overflow={'visible'}>
                    <Flex w='100%' overflow={'visible'} direction={'column'}>
                        {/* Deposit Input */}
                        <Flex
                            mt='0px'
                            px='10px'
                            bg={selectedAsset.dark_bg_color}
                            w='100%'
                            h='105px'
                            border='2px solid'
                            borderColor={selectedAsset.bg_color}
                            borderRadius={'10px'}>
                            <Flex direction={'column'} py='10px' px='5px'>
                                <Text
                                    color={!tokenDepositAmount ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    You Deposit
                                </Text>
                                <Input
                                    value={tokenDepositAmount}
                                    onChange={(e) => {
                                        handleTokenDepositChange(e);
                                    }}
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
                                    _placeholder={{ color: selectedAsset.light_text_color }}
                                />
                                <Text
                                    color={!tokenDepositAmount ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    mt='2px'
                                    ml='1px'
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    {tokenDepositAmountUSD}
                                </Text>
                            </Flex>
                            <Spacer />
                            <Flex mt='1px' mr='6px'>
                                <AssetTag assetName='USDT' />
                            </Flex>
                        </Flex>
                        {/* Profit Percentage Input */}
                        <Flex
                            mt='10px'
                            px='10px'
                            bg='#161A33'
                            w='100%'
                            h='105px'
                            border='2px solid #303F9F'
                            borderRadius={'10px'}>
                            <Flex direction={'column'} py='10px' px='5px'>
                                <Text
                                    color={!profitPercentage ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    Your Profit %
                                </Text>
                                <Input
                                    value={profitPercentage}
                                    onChange={(e) => {
                                        handleProfitPercentageChange(e);
                                    }}
                                    onBlur={handleProfitPercentageBlur}
                                    onFocus={() => handleProfitPercentageFocus(profitPercentage)}
                                    fontFamily={'Aux'}
                                    border='none'
                                    mt='2px'
                                    mr='-120px'
                                    ml='-5px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='40px'
                                    placeholder='0.0'
                                    _placeholder={{ color: '#5C63A3' }}
                                />
                                <Text
                                    color={!profitPercentage ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    mt='2px'
                                    ml='1px'
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    ≈ {profitAmountUSD}
                                </Text>
                            </Flex>
                            <Spacer />
                            <Flex
                                alignSelf={'center'}
                                mr='6px'
                                w='220px'
                                h='60px'
                                bg='#222753'
                                fontSize={'12px'}
                                align='center'
                                letterSpacing={'-1px'}
                                justify='center'
                                border='2px solid #3C4ABB'
                                borderRadius={'10px'}
                                textAlign='center'
                                direction='column'>
                                <Text color={colors.offWhite}>Your Exchange Rate</Text>
                                <Text>
                                    1 BTC = {/* amount of deposit asset / amount of BTC out ) * deposit asset price in USD */}
                                    {tokenDepositAmount && bitcoinOutputAmount
                                        ? (
                                              (parseFloat(tokenDepositAmount) / parseFloat(bitcoinOutputAmount)) *
                                              tokenPriceUSD
                                          ).toLocaleString('en-US', {
                                              style: 'currency',
                                              currency: 'USD',
                                          })
                                        : '$0.00'}{' '}
                                    {selectedAsset.name}
                                </Text>
                            </Flex>
                        </Flex>
                        {/* Bitcoin Amount Out */}
                        <Flex
                            mt='10px'
                            px='10px'
                            bg='#2E1C0C'
                            w='100%'
                            h='105px'
                            border='2px solid #78491F'
                            borderRadius={'10px'}>
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
                                    mr='-5px'
                                    ml='-5px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='40px'
                                    placeholder='0.0'
                                    _placeholder={{ color: '#805530' }}
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
                            <Flex mt='1px' mr='6px'>
                                <AssetTag assetName='BTC' />
                            </Flex>
                        </Flex>
                        {/* BTC Payout Address */}
                        <Flex
                            mt='10px'
                            px='10px'
                            bg='#1C1C1C'
                            border='2px solid #565656'
                            w='100%'
                            h='105px'
                            borderRadius={'10px'}>
                            <Flex direction={'column'} py='10px' px='5px'>
                                <Text
                                    color={!payoutBTCAddress ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    letterSpacing={'-1px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    Bitcoin Payout Address
                                </Text>
                                <Input
                                    value={payoutBTCAddress}
                                    onChange={handleBTCPayoutAddressChange}
                                    fontFamily={'Aux'}
                                    border='none'
                                    mt='2px'
                                    mr='190px'
                                    ml='-5px'
                                    p='0px'
                                    letterSpacing={'-6px'}
                                    color={colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='36px'
                                    placeholder='bc1q5d7rjq7g6rd2...'
                                    _placeholder={{ color: colors.darkerGray }}
                                    spellCheck={false}
                                />
                                <Text
                                    color={!payoutBTCAddress ? colors.offWhite : colors.textGray}
                                    fontSize={'13px'}
                                    mt='2px'
                                    ml='1px'
                                    letterSpacing={'-1.5px'}
                                    fontWeight={'normal'}
                                    fontFamily={'Aux'}>
                                    {payoutBTCAddress.length > 0 ? (
                                        <BitcoinAddressValidation address={payoutBTCAddress} />
                                    ) : (
                                        '...'
                                    )}
                                </Text>
                            </Flex>
                        </Flex>

                        {/* Deposit Button */}
                        <Flex
                            alignSelf={'center'}
                            bg={
                                isConnected
                                    ? tokenDepositAmount && bitcoinOutputAmount && payoutBTCAddress
                                        ? colors.purpleBackground
                                        : colors.purpleBackgroundDisabled
                                    : colors.purpleBackground
                            }
                            _hover={{ bg: colors.purpleHover }}
                            w='60%'
                            mt='22px'
                            transition={'0.2s'}
                            h='52px'
                            onClick={async () => {
                                if (tokenDepositAmount && bitcoinOutputAmount && payoutBTCAddress) {
                                    initiateDeposit();
                                }
                            }}
                            fontSize={'17px'}
                            align={'center'}
                            userSelect={'none'}
                            cursor={'pointer'}
                            borderRadius={'10px'}
                            justify={'center'}
                            border={
                                isConnected
                                    ? tokenDepositAmount && bitcoinOutputAmount && payoutBTCAddress
                                        ? '3px solid #445BCB'
                                        : '3px solid #3242a8'
                                    : '3px solid #445BCB'
                            }>
                            <Text
                                color={
                                    isConnected
                                        ? tokenDepositAmount && bitcoinOutputAmount && payoutBTCAddress
                                            ? colors.offWhite
                                            : colors.darkerGray
                                        : colors.offWhite
                                }
                                fontFamily='Nostromo'>
                                {isConnected ? 'Deposit Liquidity' : 'Connect Wallet'}
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
            <DepositStatusModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                status={depositLiquidityStatus}
                error={depositLiquidityError}
                txHash={txHash}
            />
        </Flex>
    );
};
