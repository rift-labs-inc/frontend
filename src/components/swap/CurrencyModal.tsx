import { Button, Flex, Text } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { useStore } from '../../store';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { AssetType } from '../../types';
import { ReactNode, useEffect } from 'react';
import WebAssetTag from '../other/WebAssetTag';

const CurrencyItem = ({
    asset,
    isComingSoon,
    children,
    isSelected,
    onClick,
}: {
    asset: AssetType;
    isComingSoon?: boolean;
    children?: ReactNode;
    isSelected?: boolean;
    onClick?: () => void;
}) => {
    const colorKey = asset == 'WBTC' ? 'btc' : asset.toLowerCase();
    const bgColor = colors.currencyCard[colorKey].background;
    const borderColor = colors.currencyCard[colorKey].border;

    const selectedColor = colors.currencyCard[colorKey].background;

    return (
        <Flex
            bg={isSelected ? selectedColor : bgColor}
            border={`2px solid ${borderColor}`}
            borderRadius='14px'
            px='18px'
            py='12px'
            opacity={isComingSoon ? 0.6 : 1}
            position='relative'
            userSelect='none'
            cursor={!isComingSoon ? 'pointer' : 'auto'}
            onClick={onClick}>
            <Flex flexDir='column' flex={1} mr='10px'>
                <Flex align='flex-end' gap='10px'>
                    <Text fontFamily={FONT_FAMILIES.NOSTROMO}>{asset}</Text>
                    <Text fontSize='0.7rem' mb='2px' fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.textGray}>
                        {isSelected ? 'Selected' : ''}
                    </Text>
                </Flex>
                <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize={'0.7rem'} letterSpacing={'-1px'} fontWeight='300' color={colors.textGray} wordBreak='break-all'>
                    {isComingSoon ? 'Coming Soon...' : children}
                </Text>
            </Flex>
            <Flex>
                <WebAssetTag asset={asset} pointer={!isComingSoon} />
            </Flex>
            {/* <Text position='absolute' fontSize='0.7rem' fontFamily={FONT_FAMILIES.NOSTROMO} top='8px' right='18px'>
                {isSelected ? 'Selected' : ''}
            </Text> */}
        </Flex>
    );
};

interface CurrencyModalProps {}

const CurrencyModal: React.FC<CurrencyModalProps> = () => {
    const depositMode = useStore((state) => state.depositMode);
    const setDepositMode = useStore((state) => state.setDepositMode);
    const currencyModalTitle = useStore((state) => state.currencyModalTitle);
    const setCurrencyModalTitle = useStore((state) => state.setCurrencyModalTitle);

    const onClose = () => {
        setCurrencyModalTitle('close');
    };

    return (
        <Modal blockScrollOnMount={false} isOpen={currencyModalTitle != 'close'} onClose={onClose} isCentered size='lg'>
            <ModalOverlay outline='none' />
            <ModalContent bg={colors.offBlack} borderRadius={'20px'} mx='20px' border='3px solid' borderColor={colors.borderGray}>
                <ModalHeader fontFamily={FONT_FAMILIES.NOSTROMO} textAlign='center' textTransform='capitalize'>
                    Select {currencyModalTitle} Asset
                </ModalHeader>
                <ModalBody>
                    <Flex flexDir='column' gap='12px' pb='12px'>
                        <CurrencyItem
                            asset='BTC'
                            isSelected={(currencyModalTitle == 'send' && !depositMode) || (currencyModalTitle == 'recieve' && depositMode)}
                            onClick={() => {
                                if (currencyModalTitle == 'deposit' && depositMode) {
                                    setDepositMode(false);
                                } else if (currencyModalTitle == 'recieve' && !depositMode) {
                                    setDepositMode(true);
                                }
                                onClose();
                            }}>
                            Mainnet Bitcoin
                        </CurrencyItem>
                        <CurrencyItem
                            asset='USDT'
                            isSelected={(currencyModalTitle == 'recieve' && !depositMode) || (currencyModalTitle == 'deposit' && depositMode)}
                            onClick={() => {
                                if (currencyModalTitle == 'send' && !depositMode) {
                                    setDepositMode(true);
                                } else if (currencyModalTitle == 'recieve' && depositMode) {
                                    setDepositMode(false);
                                }
                                onClose();
                            }}>
                            Arbitrum USDT
                        </CurrencyItem>

                        <CurrencyItem asset='ETH' isComingSoon>
                            Most secure but can lead to less optimal execution price as the exchange rate between BTC and ETH diverges.
                        </CurrencyItem>
                        <CurrencyItem asset='WETH' isComingSoon>
                            Same tradeoffs as ETH but provided as a convince for users holding WETH
                        </CurrencyItem>
                        <CurrencyItem asset='WBTC' isComingSoon>
                            For LPs who don’t want to manage their position, wBTC provides less volatility in exchange for increased risk (trusting wBTC).
                        </CurrencyItem>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CurrencyModal;
