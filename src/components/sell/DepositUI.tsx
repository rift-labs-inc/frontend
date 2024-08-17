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
import { useEffect, useState, useRef, ChangeEvent } from 'react';
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
} from '../../utils/dappHelper';
import { validDepositAssets } from '../../utils/constants';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { BigNumber, ethers } from 'ethers';
import { useStore } from '../../store';
import { FONT_FAMILIES } from '../../utils/font';
import { useDepositLiquidity } from '../../hooks/contract/useDepositLiquidity';
import DepositStatusModal from './DepositStatusModal';
import WhiteText from '../other/WhiteText';
import OrangeText from '../other/OrangeText';

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
    const ethersProvider = useStore((state) => state.ethersProvider);
    const {
        depositLiquidity,
        status: depositLiquidityStatus,
        error: depositLiquidityError,
        txHash,
        resetDepositState,
    } = useDepositLiquidity();
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const setBitcoinPriceUSD = useStore((state) => state.setBitcoinPriceUSD);
    const ethPriceUSD = useStore((state) => state.ethPriceUSD);
    const setEthPriceUSD = useStore((state) => state.setEthPriceUSD);
    const wrappedEthPriceUSD = useStore((state) => state.wrappedEthPriceUSD);
    const setWrappedEthPriceUSD = useStore((state) => state.setWrappedEthPriceUSD);
    const btcToEthExchangeRate = useStore((state) => state.btcToEthExchangeRate);
    const setBtcToEthExchangeRate = useStore((state) => state.setBtcToEthExchangeRate);
    const setShowManageDepositVaultsScreen = useStore((state) => state.setShowManageDepositVaultsScreen);

    const [ethDepositAmount, setEthDepositAmount] = useState('');
    const [ethDepositAmountUSD, setEthDepositAmountUSD] = useState('0.00');

    const [profitPercentage, setProfitPercentage] = useState('');
    const [profitAmountUSD, setProfitAmountUSD] = useState('0.00');

    const [bitcoinOutputAmount, setBitcoinOutputAmount] = useState('');
    const [bitcoinOutputAmountUSD, setBitcoinOutputAmountUSD] = useState('0.00');

    const [payoutBTCAddress, setPayoutBTCAddress] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const selectedDepositAsset = useStore((state) => state.selectedDepositAsset);
    const setSelectedDepositAsset = useStore((state) => state.setSelectedDepositAsset);

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    useEffect(() => {
        // Calculate the profit amount in USD
        const profitAmountUSD = `${(
            ((parseFloat(ethDepositAmount) * parseFloat(profitPercentage)) / 100) *
            ethPriceUSD
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
            // Calculate the profit amount in USD

            const profitAmountUSD = `${(
                ((parseFloat(ethDepositAmount) * parseFloat(profitPercentage)) / 100) *
                ethPriceUSD
            ).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })}`;
            setProfitAmountUSD(profitAmountUSD);

            // Calculate and update the deposit amount in USD
            const ethDepositAmountUSD =
                ethPriceUSD && ethDepositAmount
                    ? (ethPriceUSD * parseFloat(ethDepositAmount)).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                      })
                    : '$0.00';
            setEthDepositAmountUSD(ethDepositAmountUSD);
        }
    };

    const calculatePercentAmount = (bitcoinAmount: string) => {
        const startValue = parseFloat(ethDepositAmount);
        const endValue = parseFloat(bitcoinAmount) * btcToEthExchangeRate;
        const newProfitPercentage = (((endValue - startValue) / startValue) * 100).toFixed(2);

        if (validateProfitPercentage(newProfitPercentage)) {
            setProfitPercentage(newProfitPercentage);
        }
    };

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

    function calculateBitcoinExchangeRate(): number {
        const BitcoinExchangeRate =
            (parseFloat(ethDepositAmount) + parseFloat(ethDepositAmount) * (parseFloat(profitPercentage) / 100)) /
            parseFloat(bitcoinOutputAmount);
        return parseFloat(BitcoinExchangeRate.toFixed(7));
    }

    const initiateDeposit = async () => {
        if (window.ethereum && btcToEthExchangeRate) {
            // Reset the deposit state before starting a new deposit
            resetDepositState();

            setIsModalOpen(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const vaultIndexToOverwrite = findVaultIndexToOverwrite();
            const ethDepositAmountWei = ethToWei(ethDepositAmount);
            const vaultIndexWithSameExchangeRate = findVaultIndexWithSameExchangeRate();
            const exchangeRate = btcToSats(btcToEthExchangeRate);

            await depositLiquidity({
                signer,
                riftExchangeAbi: riftExchangeABI.abi,
                riftExchangeContract: selectedDepositAsset.riftExchangeContractAddress,
                tokenAddress: selectedDepositAsset.address,
                btcPayoutLockingScript: payoutBTCAddress,
                btcExchangeRate: exchangeRate,
                vaultIndexToOverwrite,
                depositAmount: ethDepositAmountWei,
                vaultIndexWithSameExchangeRate,
            });
        }
    };

    return (
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
            <Text fontSize={'13px'} letterSpacing={'-1px'} textAlign={'center'}>
                Create a sell order by setting your <WhiteText>Exchange Rate</WhiteText>. Get payed out in
                <OrangeText> BTC</OrangeText> when your order is filled. Withdraw unreserved liquidity anytime.
            </Text>
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
                                    onChange={(e) => {
                                        handleEthDepositChange(e);
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
                                    _placeholder={{ color: '#5C63A3' }}
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
                        <Flex
                            mt='10px'
                            px='10px'
                            bg='#132B12'
                            w='100%'
                            h='105px'
                            border='2px solid #319C48'
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
                                    _placeholder={{ color: '#578355' }}
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
                                <Text>1 BTC = {calculateBitcoinExchangeRate()}</Text>
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
                                    mr='195px'
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
                                isConnected
                                    ? ethDepositAmount && bitcoinOutputAmount && payoutBTCAddress
                                        ? colors.purpleBackground
                                        : colors.purpleBackgroundDisabled
                                    : colors.purpleBackground
                            }
                            _hover={{ bg: colors.purpleHover }}
                            w='100%'
                            mt='35px'
                            transition={'0.2s'}
                            h='45px'
                            onClick={async () => {
                                if (!isConnected) {
                                    openConnectModal();
                                } else if (chainId !== selectedDepositAsset.contractChainID) {
                                    console.log('Switching network');
                                    // switchChain(contractChainID); TODO: switch chains
                                } else if (ethDepositAmount && bitcoinOutputAmount && payoutBTCAddress && btcToEthExchangeRate) {
                                    initiateDeposit();
                                }
                            }}
                            fontSize={'15px'}
                            align={'center'}
                            userSelect={'none'}
                            cursor={'pointer'}
                            borderRadius={'10px'}
                            justify={'center'}
                            border={
                                isConnected
                                    ? ethDepositAmount && bitcoinOutputAmount && payoutBTCAddress
                                        ? '3px solid #445BCB'
                                        : '3px solid #3242a8'
                                    : '3px solid #445BCB'
                            }>
                            <Text
                                color={
                                    isConnected
                                        ? ethDepositAmount && bitcoinOutputAmount && payoutBTCAddress
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
