import React from 'react';
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
    Icon,
} from '@chakra-ui/react';
import { DepositStatus } from '../../hooks/contract/useDepositLiquidity';
import { FONT_FAMILIES } from '../../utils/font';
import { colors } from '../../utils/colors';
import { GooSpinner } from 'react-spinners-kit';
import { CheckmarkCircle, AlertCircleOutline, OpenOutline } from 'react-ionicons';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { PiVaultBold } from 'react-icons/pi';
import { IoMdSettings } from 'react-icons/io';
import { etherScanBaseUrl } from '../../utils/constants';
import { useStore } from '../../store';

interface DepositStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: DepositStatus;
    error: string | null;
    txHash: string | null;
}

const DepositStatusModal: React.FC<DepositStatusModalProps> = ({ isOpen, onClose, status, error, txHash }) => {
    // Add txHash here
    const isCompleted = status === DepositStatus.Confirmed;
    const isError = status === DepositStatus.Error;
    const isLoading = !isCompleted && !isError;
    const showManageDepositVaultsScreen = useStore((state) => state.showManageDepositVaultsScreen);
    const setShowManageDepositVaultsScreen = useStore((state) => state.setShowManageDepositVaultsScreen);

    const getStatusMessage = () => {
        switch (status) {
            case DepositStatus.WaitingForWalletConfirmation:
                return 'Waiting for wallet confirmation...';
            case DepositStatus.ApprovingWETH:
                return 'Approving WETH...';
            case DepositStatus.DepositingLiquidity:
                return 'Depositing liquidity...';
            case DepositStatus.Confirmed:
                return 'Deposit success!';
            case DepositStatus.Error:
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
                    Deposit Status
                </ModalHeader>
                {(isCompleted || isError) && <ModalCloseButton />}
                <ModalBody>
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
                            Please confirm the transaction in your wallet
                        </Text>
                        {/* TODO: ONLY SHOW ABOVE if waiting on wallet confirmation */}
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

                                <Button
                                    mt={'10px'}
                                    bg={colors.purpleBackground}
                                    borderWidth={'2px'}
                                    borderColor={colors.purpleBorder}
                                    fontWeight={'normal'}
                                    onClick={() => {
                                        setShowManageDepositVaultsScreen(true);
                                        onClose();
                                    }}
                                    _hover={{ bg: colors.purpleHover }}
                                    borderRadius='md'>
                                    <Flex mt='-2px ' mr='8px'>
                                        <IoMdSettings size={'17px'} color={colors.offWhite} />
                                    </Flex>
                                    <Text fontSize='14px' color={colors.offWhite}>
                                        Manage Deposit Vaults
                                    </Text>
                                </Button>
                            </Flex>
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
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default DepositStatusModal;
