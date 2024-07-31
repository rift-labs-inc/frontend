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
import { HiOutlineExternalLink } from 'react-icons/hi';
import { etherScanBaseUrl } from '../../utils/constants';

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
            case WithdrawStatus.WithdrawingLiquidity:
                return 'Withdrawing liquidity...';
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={!isLoading} closeOnEsc={!isLoading}>
            <ModalOverlay />
            <ModalContent
                top={'20px'}
                bottom={'20px'}
                bg={colors.offBlack}
                borderWidth={2}
                minH={isCompleted ? '280px' : '280px'}
                w={isError ? '600px' : isCompleted ? '400px' : '450px'}
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
                            <Text mt='10px' mb='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                                Amount
                            </Text>
                            <Input
                                bg={colors.borderGray}
                                borderWidth={2}
                                _focus={{ borderColor: colors.darkerGray, boxShadow: 'none' }}
                                _hover={{ borderColor: colors.darkerGray }}
                                _selected={{ border: 'none' }}
                                borderColor={colors.borderGrayLight}
                                placeholder='0.0'
                                value={withdrawAmount}
                                color={colors.offWhite}
                                fontFamily={FONT_FAMILIES.AUX_MONO}
                                letterSpacing={'-2px'}
                                fontSize={'22px'}
                                h='48px'
                                _placeholder={{ color: colors.textGray }}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                mb={4}
                            />
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
                            {isLoading && <GooSpinner size={100} color={colors.RiftBlue} loading={true} />}
                            <Spacer />
                            <Text
                                fontSize='12px'
                                w='60%'
                                mt='25px'
                                mb='0px'
                                color={colors.textGray}
                                fontWeight={'normal'}
                                textAlign='center'>
                                {status === WithdrawStatus.WaitingForWalletConfirmation
                                    ? 'Please confirm the transaction in your wallet'
                                    : isCompleted
                                    ? ''
                                    : 'Processing your withdrawal'}
                            </Text>
                            <Flex direction={'column'} align={'center'} w='100%' justify={'center'}>
                                {isCompleted && (
                                    <Flex mt='0px' ml='4px' mb='10px'>
                                        <CheckmarkCircle width='55px' height={'55px'} color={colors.greenOutline} />
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
                                <Button
                                    mt={'40px'}
                                    bg={colors.offBlackLighter}
                                    borderWidth={'2px'}
                                    borderColor={colors.offBlackLighter2}
                                    _hover={{ bg: colors.borderGray }}
                                    borderRadius='md'
                                    onClick={() => window.open(getEtherscanUrl(), '_blank')}
                                    isDisabled={!txHash}>
                                    <Flex mt='-4px ' mr='8px'>
                                        <HiOutlineExternalLink size={'17px'} color={colors.textGray} />
                                    </Flex>
                                    <Text fontSize='14px' color={colors.textGray} cursor={'pointer'} fontWeight={'normal'}>
                                        View on Etherscan
                                    </Text>
                                </Button>
                            )}
                            {isError && (
                                <>
                                    <Box mt={4} p={2} bg='#2E1C0C' border='1px solid #78491F' borderRadius='md'>
                                        <Text overflowWrap={'anywhere'} fontSize='12px' color='#FF6B6B'>
                                            {error}
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
