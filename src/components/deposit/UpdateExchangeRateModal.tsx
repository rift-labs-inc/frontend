import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, Text, Flex, Spacer, Button, Input } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { useStore } from '../../store';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { AssetTag } from '../other/AssetTag';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { bitcoinDecimals } from '../../utils/constants';
import { bufferTo18Decimals } from '../../utils/dappHelper';
import WhiteText from '../other/WhiteText';
import OrangeText from '../other/OrangeText';
import { UpdateExchangeRateParams } from '../../types';

const UpdateExchangeRateModal = ({ isOpen, onClose, selectedVault }) => {
    const [usdtUnreservedAmount, setUsdtUnreservedAmount] = useState('');
    const [profitPercentage, setProfitPercentage] = useState('');
    const [btcOutputAmount, setBtcOutputAmount] = useState('');
    const [usdtDepositUnreservedUSD, setUsdtUnreservedAmountUSD] = useState('$0.00');
    const [profitAmountUSD, setProfitAmountUSD] = useState('$0.00');
    const [bitcoinOutputAmountUSD, setBitcoinOutputAmountUSD] = useState('$0.00');
    const currentlyExpiredReservationIndexes = useStore((state) => state.currentlyExpiredReservationIndexes);
    const bitcoinPriceUSD = useStore((state) => state.bitcoinPriceUSD);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const usdtPriceUSD = useStore.getState().validAssets[selectedInputAsset.name].priceUSD;

    useEffect(() => {
        console.log('selectedVault:', selectedVault);
        if (isOpen && selectedVault) {
            setUsdtUnreservedAmount(formatUnits(selectedVault.trueUnreservedBalance, selectedInputAsset.decimals).toString() ?? '0');
        }
    }, [isOpen, selectedVault]);

    useEffect(() => {
        calculateUsdValues();
    }, [usdtUnreservedAmount, btcOutputAmount, profitPercentage]);

    useEffect(() => {
        const usdtDepositUnreservedUSD =
            usdtPriceUSD && usdtUnreservedAmount
                ? (usdtPriceUSD * parseFloat(usdtUnreservedAmount)).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                  })
                : '$0.00';
        setUsdtUnreservedAmountUSD(usdtDepositUnreservedUSD);
    }, [usdtUnreservedAmount]);

    const calculateUsdValues = () => {
        // Calculate deposit amount in USD
        const depositAmountUSD =
            usdtPriceUSD && usdtUnreservedAmount
                ? (usdtPriceUSD * parseFloat(usdtUnreservedAmount)).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                  })
                : '$0.00';
        setUsdtUnreservedAmountUSD(depositAmountUSD);

        // Calculate profit amount in USD
        const profitAmountUSD =
            usdtPriceUSD && usdtUnreservedAmount && profitPercentage
                ? (((parseFloat(usdtUnreservedAmount) * parseFloat(profitPercentage)) / 100) * usdtPriceUSD).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                  })
                : '$0.00';
        setProfitAmountUSD(profitAmountUSD);

        // Calculate Bitcoin output amount in USD
        const btcOutputAmountUSD =
            bitcoinPriceUSD && btcOutputAmount
                ? (bitcoinPriceUSD * parseFloat(btcOutputAmount)).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                  })
                : '$0.00';
        setBitcoinOutputAmountUSD(btcOutputAmountUSD);
    };

    const handleTokenDepositChange = (e) => {
        const maxDecimals = selectedVault.depositAsset.decimals;
        const tokenValue = e.target.value;

        const validateTokenDepositChange = (value) => {
            if (value === '') return true;
            const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
            return regex.test(value);
        };

        if (validateTokenDepositChange(tokenValue)) {
            setUsdtUnreservedAmount(tokenValue);
            calculateBitcoinOutputAmount(tokenValue, undefined);
        }
    };

    const handleProfitPercentageChange = (e) => {
        const profitPercentageValue = e.target.value.replace('%', '');

        if (validateProfitPercentage(profitPercentageValue)) {
            setProfitPercentage(profitPercentageValue);
            calculateBitcoinOutputAmount(undefined, profitPercentageValue);
        } else {
            console.log('Invalid profit percentage');
        }
    };

    const handleProfitPercentageFocus = (value) => {
        let profitPercentageValue = value.replace('%', '').replace(/^\+/, '');
        setProfitPercentage(profitPercentageValue);
    };

    const handleProfitPercentageBlur = () => {
        if (profitPercentage === '-') setProfitPercentage('');
        else if (profitPercentage !== '') {
            let formattedProfitPercentage = profitPercentage;
            if (!formattedProfitPercentage.endsWith('%')) {
                if (!formattedProfitPercentage.startsWith('-') && /^[0-9]/.test(formattedProfitPercentage)) {
                    formattedProfitPercentage = '+' + formattedProfitPercentage;
                }
                formattedProfitPercentage += '%';
            }
            setProfitPercentage(formattedProfitPercentage);
        }
    };

    const calculateProfitPercent = (bitcoinAmount) => {
        const startValue = parseFloat(usdtUnreservedAmount);
        const endValue = parseFloat(bitcoinAmount) * useStore.getState().validAssets[selectedInputAsset.name].exchangeRateInTokenPerBTC;

        const newProfitPercentage = (((endValue - startValue) / startValue) * 100).toFixed(2);
        if (validateProfitPercentage(newProfitPercentage)) {
            let formattedProfitPercentage = newProfitPercentage;
            if (!formattedProfitPercentage.startsWith('-') && /^[0-9]/.test(formattedProfitPercentage)) {
                formattedProfitPercentage = '+' + formattedProfitPercentage;
            }
            formattedProfitPercentage += '%';
            setProfitPercentage(formattedProfitPercentage);
        }
    };

    const validateProfitPercentage = (value) => {
        if (value === '') return true;
        const regex = /^-?\d*(\.\d{0,2})?$/;
        return regex.test(value);
    };

    const handleBitcoinOutputAmountChange = (e) => {
        const bitcoinOutputAmountValue = e.target.value;

        if (validateBitcoinOutputAmount(bitcoinOutputAmountValue)) {
            setBtcOutputAmount(bitcoinOutputAmountValue === '0.0' ? '' : bitcoinOutputAmountValue);
            calculateProfitPercent(bitcoinOutputAmountValue);
        }
    };

    const calculateBitcoinOutputAmount = (newUsdtDepositAmount, newProfitPercentage) => {
        if (usdtPriceUSD && bitcoinPriceUSD) {
            const profitAmountInToken = parseFloat(newUsdtDepositAmount ?? usdtUnreservedAmount) * (parseFloat(newProfitPercentage ?? profitPercentage) / 100);
            const totalTokenUSD = parseFloat(newUsdtDepositAmount ?? usdtUnreservedAmount) * usdtPriceUSD + profitAmountInToken * usdtPriceUSD;
            const newBitcoinOutputAmount = totalTokenUSD / bitcoinPriceUSD > 0 ? totalTokenUSD / bitcoinPriceUSD : 0;
            const formattedBitcoinOutputAmount = newBitcoinOutputAmount == 0 ? '0.0' : newBitcoinOutputAmount.toFixed(7);

            if (validateBitcoinOutputAmount(formattedBitcoinOutputAmount)) {
                setBtcOutputAmount(formattedBitcoinOutputAmount === '0.0' ? '' : formattedBitcoinOutputAmount);
            }
        }
    };

    const validateBitcoinOutputAmount = (value) => {
        if (value === '') return true;
        const regex = /^\d*\.?\d*$/;
        return regex.test(value);
    };

    const handleUpdateExchangeRate = async () => {
        if (!window.ethereum || !selectedVault) {
            console.error('Ethereum provider or selected vault not available');
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const tokenDepositAmountInSmallestTokenUnits = parseUnits(usdtUnreservedAmount, selectedVault.depositAsset.decimals);
        const tokenDepositAmountInSmallestTokenUnitsBufferedTo18Decimals = bufferTo18Decimals(tokenDepositAmountInSmallestTokenUnits, selectedVault.depositAsset.decimals);
        const bitcoinOutputAmountInSats = parseUnits(btcOutputAmount, bitcoinDecimals);
        const exchangeRate = tokenDepositAmountInSmallestTokenUnitsBufferedTo18Decimals.div(bitcoinOutputAmountInSats);

        const clipToDecimals = bitcoinDecimals;
        const precisionBN = BigNumber.from(10).pow(clipToDecimals);
        const clippedExchangeRate = exchangeRate.div(precisionBN).mul(precisionBN);

        const updateExchangeRateParams: UpdateExchangeRateParams = {
            globalVaultIndex: selectedVault.index,
            newExchangeRate: clippedExchangeRate,
            expiredSwapReservationIndexes: currentlyExpiredReservationIndexes,
        };

        try {
            const contract = new ethers.Contract(selectedVault.depositAsset.riftExchangeContractAddress, selectedVault.depositAsset.riftExchangeAbi, signer);
            const tx = await contract.updateExchangeRate(updateExchangeRateParams.globalVaultIndex, updateExchangeRateParams.newExchangeRate, updateExchangeRateParams.expiredSwapReservationIndexes);
            await tx.wait();
            console.log('Exchange rate updated successfully');
            onClose();
        } catch (error) {
            console.error('Failed to update exchange rate:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent bg={colors.offBlackLighter} minW='700px' mx='auto' my='auto' borderRadius='20px' alignItems='center' border={`2px solid ${colors.borderGray}`}>
                <ModalHeader color={colors.offWhite} fontFamily={FONT_FAMILIES.NOSTROMO}>
                    Update Exchange Rate
                </ModalHeader>
                <ModalCloseButton color={colors.offWhite} />
                <ModalBody w='100%'>
                    <Flex
                        w='100%'
                        h='100%'
                        mt='-15px'
                        px='30px'
                        py='8px'
                        flexDir='column'
                        userSelect='none'
                        fontSize='12px'
                        fontFamily={FONT_FAMILIES.AUX_MONO}
                        color='#c3c3c3'
                        fontWeight='normal'
                        gap='0px'>
                        <Text fontSize='13px' letterSpacing='-1px' my='10px' textAlign='center'>
                            Update your sell order by adjusting the <WhiteText>Exchange Rate</WhiteText>. If you have active reservations on this vault, the remaining unreserved liqudity will be fund
                            a new vault with your updated exchange rate
                        </Text>
                        <Flex mt='25px' direction='column' overflow='visible'>
                            {/* Deposit Input */}
                            <Flex mt='0px' px='10px' bg={selectedInputAsset.dark_bg_color} w='100%' h='105px' border='2px solid' borderColor={selectedInputAsset.bg_color} borderRadius='10px'>
                                <Flex direction='column' py='10px' px='5px'>
                                    <Text color={!usdtUnreservedAmount ? colors.offWhite : colors.textGray} fontSize='13px' letterSpacing='-1px' fontWeight='normal' fontFamily='Aux'>
                                        Current Unreserved Liquidity
                                    </Text>
                                    <Input
                                        value={usdtUnreservedAmount}
                                        disabled={true}
                                        onChange={handleTokenDepositChange}
                                        fontFamily='Aux'
                                        border='none'
                                        mt='2px'
                                        mr='-100px'
                                        ml='-5px'
                                        p='0px'
                                        letterSpacing='-6px'
                                        color={colors.offWhite}
                                        _active={{ border: 'none', boxShadow: 'none' }}
                                        _focus={{ border: 'none', boxShadow: 'none' }}
                                        _selected={{ border: 'none', boxShadow: 'none' }}
                                        fontSize='40px'
                                        _placeholder={{
                                            color: selectedInputAsset.light_text_color,
                                        }}
                                    />
                                    <Text color={!usdtUnreservedAmount ? colors.offWhite : colors.textGray} fontSize='13px' mt='2px' ml='1px' letterSpacing='-1px' fontWeight='normal' fontFamily='Aux'>
                                        {usdtDepositUnreservedUSD}
                                    </Text>
                                </Flex>
                                <Spacer />
                                <Flex mt='8px' mr='6px'>
                                    <AssetTag assetName={selectedInputAsset.name} />
                                </Flex>
                            </Flex>
                            {/* Profit Percentage Input */}
                            <Flex mt='10px' px='10px' bg='#161A33' w='100%' h='105px' border='2px solid #303F9F' borderRadius='10px'>
                                <Flex direction='column' py='10px' px='5px'>
                                    <Text color={!profitPercentage ? colors.offWhite : colors.textGray} fontSize='13px' letterSpacing='-1px' fontWeight='normal' fontFamily='Aux'>
                                        Your Profit %
                                    </Text>
                                    <Input
                                        value={profitPercentage}
                                        onChange={(e) => {
                                            handleProfitPercentageChange(e);
                                        }}
                                        onBlur={handleProfitPercentageBlur}
                                        onFocus={() => handleProfitPercentageFocus(profitPercentage)}
                                        fontFamily='Aux'
                                        border='none'
                                        mt='2px'
                                        mr='-120px'
                                        ml='-5px'
                                        p='0px'
                                        letterSpacing='-6px'
                                        color={colors.offWhite}
                                        _active={{ border: 'none', boxShadow: 'none' }}
                                        _focus={{ border: 'none', boxShadow: 'none' }}
                                        _selected={{ border: 'none', boxShadow: 'none' }}
                                        fontSize='40px'
                                        placeholder='0.0'
                                        _placeholder={{ color: '#5C63A3' }}
                                    />
                                    <Text color={!profitPercentage ? colors.offWhite : colors.textGray} fontSize='13px' mt='2px' ml='1px' letterSpacing='-1px' fontWeight='normal' fontFamily='Aux'>
                                        ≈ {profitAmountUSD}
                                    </Text>
                                </Flex>
                                <Spacer />
                                <Flex
                                    alignSelf='center'
                                    mr='6px'
                                    w='220px'
                                    h='60px'
                                    bg='#222753'
                                    fontSize='12px'
                                    align='center'
                                    letterSpacing='-1px'
                                    justify='center'
                                    border='2px solid #3C4ABB'
                                    borderRadius='10px'
                                    textAlign='center'
                                    direction='column'>
                                    <Text color={colors.offWhite}>Your Exchange Rate</Text>
                                    <Text>
                                        1 BTC ={' '}
                                        {usdtUnreservedAmount && btcOutputAmount
                                            ? ((parseFloat(usdtUnreservedAmount) / parseFloat(btcOutputAmount)) * usdtPriceUSD).toLocaleString('en-US', {
                                                  style: 'currency',
                                                  currency: 'USD',
                                              })
                                            : '$0.00'}{' '}
                                        {selectedInputAsset.name}
                                    </Text>
                                </Flex>
                            </Flex>
                            {/* Bitcoin Amount Out */}
                            <Flex mt='10px' px='10px' bg='#2E1C0C' w='100%' h='105px' border='2px solid #78491F' borderRadius='10px'>
                                <Flex direction='column' py='10px' px='5px'>
                                    <Text color={!btcOutputAmount ? colors.offWhite : colors.textGray} fontSize='13px' letterSpacing='-1px' fontWeight='normal' fontFamily='Aux'>
                                        You Receive
                                    </Text>
                                    <Input
                                        value={btcOutputAmount}
                                        onChange={handleBitcoinOutputAmountChange}
                                        fontFamily='Aux'
                                        border='none'
                                        mt='2px'
                                        mr='-5px'
                                        ml='-5px'
                                        p='0px'
                                        letterSpacing='-6px'
                                        color={colors.offWhite}
                                        _active={{ border: 'none', boxShadow: 'none' }}
                                        _focus={{ border: 'none', boxShadow: 'none' }}
                                        _selected={{ border: 'none', boxShadow: 'none' }}
                                        fontSize='40px'
                                        placeholder='0.0'
                                        _placeholder={{ color: '#805530' }}
                                    />
                                    <Text color={!btcOutputAmount ? colors.offWhite : colors.textGray} fontSize='13px' mt='2px' ml='1px' letterSpacing='-1.5px' fontWeight='normal' fontFamily='Aux'>
                                        ≈ {bitcoinOutputAmountUSD}
                                    </Text>
                                </Flex>
                                <Spacer />
                                <Flex mt='8px' mr='6px'>
                                    <AssetTag assetName='BTC' />
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Button
                        bg={colors.purpleButtonBG}
                        color={colors.offWhite}
                        mb='10px'
                        _hover={{ bg: colors.purpleHover }}
                        mt='-5px'
                        w='350px'
                        border='2px solid #445BCB'
                        mr={3}
                        onClick={handleUpdateExchangeRate}>
                        UPDATE EXCHANGE RATE
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UpdateExchangeRateModal;
