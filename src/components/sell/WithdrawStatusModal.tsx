import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Text,
    Flex,
    Box,
    Spacer,
    Button,
    Input,
} from '@chakra-ui/react';
import { WithdrawStatus } from '../../hooks/contract/useWithdrawLiquidity';
import { FONT_FAMILIES } from '../../utils/font';
import { colors } from '../../utils/colors';
import { GooSpinner } from 'react-spinners-kit';
import { CheckmarkCircle, AlertCircleOutline } from 'react-ionicons';
import { HiOutlineExternalLink, HiXCircle } from 'react-icons/hi';
import { etherScanBaseUrl } from '../../utils/constants';
import { AssetTag2 } from '../other/AssetTag2';
import { DepositVault } from '../../types';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

interface WithdrawStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: WithdrawStatus;
    error: string | null;
    txHash: string | null;
    withdrawAmount: string;
    setWithdrawAmount: (amount: string) => void;
    handleWithdraw: () => void;
    clearError: () => void;
    selectedVaultToManage: DepositVault;
}

const WithdrawStatusModal: React.FC<WithdrawStatusModalProps> = ({
    isOpen,
    onClose,
    status,
    error,
    txHash,
    withdrawAmount,
    setWithdrawAmount,
    handleWithdraw,
    clearError,
    selectedVaultToManage,
}) => {
    const [isConfirmStep, setIsConfirmStep] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setWithdrawAmount('');
            setIsConfirmStep(true);
        }
    }, [isOpen, setWithdrawAmount]);

    const isCompleted = status === WithdrawStatus.Confirmed;
    const isError = status === WithdrawStatus.Error;
    const isLoading = !isCompleted && !isError && status !== WithdrawStatus.Idle;

    const getStatusMessage = () => {
        switch (status) {
            case WithdrawStatus.WaitingForWalletConfirmation:
                return 'Waiting for wallet confirmation...';
            case WithdrawStatus.InitiatingWithdrawal:
                return 'Initiating withdrawal...';
            case WithdrawStatus.WithdrawingLiquidity:
                return 'Withdrawing liquidity...';
            case WithdrawStatus.WithdrawalPending:
                return 'Confirming withdrawal...';
            case WithdrawStatus.Confirmed:
                return 'Withdrawal success!';
            case WithdrawStatus.Error:
                if (error && error.toLowerCase().includes('user rejected transaction')) {
                    return 'User rejected transaction';
                }
                return `Error: ${error}`;
            default:
                return 'Processing...';
        }
    };

    const getEtherscanUrl = () => {
        if (!txHash) return '#';
        return `${etherScanBaseUrl}/tx/${txHash}`;
    };

    const handleConfirmWithdraw = () => {
        setIsConfirmStep(false);
        handleWithdraw();
    };

    const validateWithdrawAmount = (value: string) => {
        if (value === '') return '';
        const regex = /^\d*\.?\d*$/;
        if (!regex.test(value)) return withdrawAmount; // Return previous valid value if new input is invalid
        const parts = value.split('.');
        if (parts.length > 1 && parts[1].length > selectedVaultToManage.depositAsset.decimals) {
            return parts[0] + '.' + parts[1].slice(0, selectedVaultToManage.depositAsset.decimals);
        }
        return value;
    };

    const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const validatedAmount = validateWithdrawAmount(e.target.value);
        if (validatedAmount !== null) {
            setWithdrawAmount(validatedAmount);
        }
    };

    const unreservedBalance = formatUnits(
        selectedVaultToManage.trueUnreservedBalance,
        selectedVaultToManage.depositAsset.decimals,
    );

    const isExceedingMax = parseFloat(withdrawAmount) > parseFloat(unreservedBalance);

    const handleSetMax = () => {
        setWithdrawAmount(unreservedBalance);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={!isLoading} closeOnEsc={!isLoading}>
            <ModalOverlay />
            <ModalContent
                top={'20px'}
                bottom={'20px'}
                bg={colors.offBlack}
                borderWidth={2}
                minH={isCompleted ? '280px' : '320px'}
                w={isError ? '600px' : isCompleted ? '400px' : '500px'}
                maxWidth='100%'
                borderColor={colors.borderGray}
                borderRadius='10px'
                fontFamily={FONT_FAMILIES.AUX_MONO}
                color={colors.offWhite}>
                <ModalHeader
                    fontSize='24px'
                    userSelect={'none'}
                    fontFamily={FONT_FAMILIES.NOSTROMO}
                    fontWeight='bold'
                    textAlign='center'>
                    {isConfirmStep ? 'Withdraw Liquidity' : 'Withdrawal Status'}
                </ModalHeader>
                {(isCompleted || isError) && !isConfirmStep && <ModalCloseButton />}
                <ModalBody>
                    {isConfirmStep ? (
                        <Flex direction='column' align='center' justify='center' h='100%'>
                            <Flex
                                direction='column'
                                py='10px'
                                w='100%'
                                borderRadius={'14px'}
                                bg={colors.offBlackLighter}
                                border='2px solid'
                                borderColor={colors.borderGrayLight}
                                px='16px'>
                                <Flex justify='space-between ' w='100%' align='center'>
                                    <Text
                                        color={!withdrawAmount ? colors.offWhite : colors.textGray}
                                        fontSize='13px'
                                        letterSpacing='-1px'
                                        fontWeight='normal'
                                        fontFamily='Aux'>
                                        Amount
                                    </Text>
                                </Flex>
                                <Input
                                    value={withdrawAmount}
                                    onChange={handleWithdrawAmountChange}
                                    fontFamily='Aux'
                                    border='none'
                                    my='5px'
                                    mr='-100px'
                                    ml='-5px'
                                    p='0px'
                                    letterSpacing='-6px'
                                    color={isExceedingMax ? colors.red : colors.offWhite}
                                    _active={{ border: 'none', boxShadow: 'none' }}
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    _selected={{ border: 'none', boxShadow: 'none' }}
                                    fontSize='39px'
                                    placeholder='0.0'
                                    _placeholder={{ color: colors.darkerGray }}
                                />
                                <Text
                                    color={
                                        isExceedingMax
                                            ? colors.redHover
                                            : !withdrawAmount
                                            ? colors.offWhite
                                            : colors.textGray
                                    }
                                    fontSize='13px'
                                    mt='2px'
                                    ml='0px'
                                    letterSpacing='-1px'
                                    fontWeight='normal'
                                    fontFamily='Aux'>
                                    {isExceedingMax
                                        ? `Exceeds max unreserved amount - ${unreservedBalance} ${selectedVaultToManage.depositAsset.name}`
                                        : `${unreservedBalance} ${selectedVaultToManage.depositAsset.name}`}
                                    <Box
                                        ml='10px'
                                        as='span'
                                        color={selectedVaultToManage.depositAsset.border_color_light}
                                        fontSize='13px'
                                        cursor='pointer'
                                        onClick={handleSetMax}
                                        _hover={{ textDecoration: 'underline' }}>
                                        Max
                                    </Box>
                                </Text>
                            </Flex>
                            <Button
                                h='48px'
                                onClick={handleConfirmWithdraw}
                                _hover={{ bg: colors.redHover }}
                                bg={colors.redBackground}
                                color={colors.offWhite}
                                border={`3px solid ${colors.red}`}
                                borderRadius='10px'
                                fontSize='15px'
                                fontFamily={FONT_FAMILIES.NOSTROMO}
                                w='full'
                                mt={'20px'}>
                                Confirm Withdraw
                            </Button>
                        </Flex>
                    ) : (
                        <Flex direction='column' align='center' justify='center' h='100%' pb={'15px'}>
                            {isLoading && <GooSpinner size={100} color={colors.purpleBorder} loading={true} />}
                            <Spacer />
                            <Text
                                fontSize='12px'
                                w={
                                    status != WithdrawStatus.Confirmed &&
                                    status != WithdrawStatus.Error &&
                                    (status === WithdrawStatus.WaitingForWalletConfirmation ||
                                    status === WithdrawStatus.WithdrawalPending
                                        ? '100%'
                                        : '60%')
                                }
                                mt='25px'
                                mb='0px'
                                color={colors.textGray}
                                fontWeight={'normal'}
                                textAlign='center'>
                                {status != WithdrawStatus.Confirmed &&
                                    status != WithdrawStatus.Error &&
                                    (status === WithdrawStatus.WaitingForWalletConfirmation ||
                                    status === WithdrawStatus.WithdrawalPending
                                        ? 'Awaiting blockchain confirmation...'
                                        : 'Please confirm the transaction in your wallet')}
                            </Text>
                            <Flex direction={'column'} align={'center'} w='100%' justify={'center'}>
                                {isCompleted && (
                                    <Flex mt='6px' ml='4px'>
                                        <CheckmarkCircle width='38px' height={'38px'} color={colors.greenOutline} />
                                    </Flex>
                                )}
                                {isError && (
                                    <Flex mt='6px' ml='4px'>
                                        <AlertCircleOutline width='38px' height={'38px'} color={colors.red} />
                                    </Flex>
                                )}
                                <Text
                                    overflowWrap={'anywhere'}
                                    color={isCompleted ? colors.greenOutline : colors.offWhite}
                                    fontSize={getStatusMessage().length > 40 ? '12px' : '20px'}
                                    mt={isLoading ? '20px' : isCompleted ? '5px' : '20px'}
                                    fontWeight='normal'
                                    textAlign='center'>
                                    {getStatusMessage()}
                                </Text>
                            </Flex>
                            {isCompleted && (
                                <Flex direction='column' mt={'40px'} w='100%'>
                                    <Button
                                        mt={'40px'}
                                        bg={colors.offBlackLighter}
                                        borderWidth={'2px'}
                                        borderColor={colors.borderGrayLight}
                                        _hover={{ bg: colors.borderGray }}
                                        borderRadius='md'
                                        onClick={() => window.open(getEtherscanUrl(), '_blank')}
                                        isDisabled={!txHash}>
                                        <Flex mt='-4px ' mr='8px'>
                                            <HiOutlineExternalLink size={'17px'} color={colors.offWhite} />
                                        </Flex>
                                        <Text
                                            fontSize='14px'
                                            color={colors.offWhite}
                                            cursor={'pointer'}
                                            fontWeight={'normal'}>
                                            View on Etherscan
                                        </Text>
                                    </Button>
                                    <Button
                                        mt={'10px'}
                                        bg={colors.borderGray}
                                        borderWidth={'2px'}
                                        borderColor={colors.borderGrayLight}
                                        fontWeight={'normal'}
                                        onClick={() => {
                                            onClose();
                                        }}
                                        _hover={{ bg: colors.offBlackLighter2 }}
                                        borderRadius='md'>
                                        <Flex mt='-2px ' mr='8px'>
                                            <HiXCircle size={'17px'} color={colors.offWhite} />
                                        </Flex>
                                        <Text fontSize='14px' color={colors.offWhite}>
                                            Dismiss
                                        </Text>
                                    </Button>
                                </Flex>
                            )}
                            {isError && (
                                <>
                                    <Box mt={4} p={2} bg='#2E1C0C' border='1px solid #78491F' borderRadius='md'>
                                        <Text overflowWrap={'anywhere'} fontSize='12px' color='#FF6B6B'>
                                            {error && error.toLowerCase().includes('user rejected transaction')
                                                ? 'User rejected transaction'
                                                : `Error: ${error}`}
                                        </Text>
                                    </Box>
                                    <Button
                                        mt={'25px'}
                                        onClick={onClose}
                                        bg={colors.borderGray}
                                        borderWidth={2}
                                        borderColor={colors.offBlackLighter2}
                                        _hover={{ bg: colors.offBlackLighter2 }}
                                        color={colors.offWhite}
                                        fontFamily={FONT_FAMILIES.AUX_MONO}>
                                        Dismiss
                                    </Button>
                                </>
                            )}
                        </Flex>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default WithdrawStatusModal;
