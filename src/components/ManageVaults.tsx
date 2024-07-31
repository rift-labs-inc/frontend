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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from '@chakra-ui/react';
import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { colors } from '../utils/colors';
import { BTCSVG, ETHSVG, InfoSVG } from './SVGs';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import {
    ethToWei,
    weiToEth,
    btcToSats,
    findVaultIndexToOverwrite,
    findVaultIndexWithSameExchangeRate,
    satsToBtc,
    calculateFillPercentage,
    withdrawLiquidity,
} from '../utils/dappHelper';
import { contractChainID, riftExchangeContractAddress, wethAddress } from '../utils/constants';
import riftExchangeABI from '../abis/RiftExchange.json';
import { BigNumber, ethers } from 'ethers';
import { useStore } from '../store';
import HorizontalButtonSelector from './HorizontalButtonSelector';
import useHorizontalSelectorInput from '../hooks/useHorizontalSelectorInput';
import { DepositVault } from '../types';
import { FONT_FAMILIES } from '../utils/font';
import { ChevronLeftIcon } from '@chakra-ui/icons';

type ActiveTab = 'swap' | 'liquidity';

export const ManageVaults = ({}) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';
    const {
        options: optionsButtoActiveVsCompleted,
        selected: selectedButtonActiveVsCompleted,
        setSelected: setSelectedButtonActiveVsCompleted,
    } = useHorizontalSelectorInput(['Active', 'Completed'] as const);

    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { data: walletClient } = useWalletClient();
    const { chains, error, switchChain } = useSwitchChain();
    const ethersProvider = useStore((state) => state.ethersProvider);
    const myActiveDepositVaults = useStore((state) => state.myActiveDepositVaults);
    const myCompletedDepositVaults = useStore((state) => state.myCompletedDepositVaults);
    const selectedVaultToManage = useStore((state) => state.selectedVaultToManage);
    const setSelectedVaultToManage = useStore((state) => state.setSelectedVaultToManage);

    const vaultsToDisplay = selectedButtonActiveVsCompleted === 'Active' ? myActiveDepositVaults : myCompletedDepositVaults;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleWithdraw = () => {
        initiateWithdraw(withdrawAmount);
        onClose();
    };

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const initiateWithdraw = async (ethWithdrawAmount: string) => {
        const globalVaultIndex = 1;
        const localVaultIndex = 1;
        // TODO: calculate the global and local vault indexes

        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                console.log('signer:', await signer.getAddress());

                const ethWithdrawAmountWei = ethers.utils.parseEther(ethWithdrawAmount);
                console.log('ethWithdrawAmountWei:', ethWithdrawAmountWei.toString());

                // TODO get expired reservation indexes
                // const expiredReservationIndexes = await getExpiredReservationIndexes();
                const expiredReservationIndexes = [];

                const result = await withdrawLiquidity(
                    signer,
                    riftExchangeABI.abi,
                    riftExchangeContractAddress,
                    globalVaultIndex,
                    localVaultIndex,
                    ethWithdrawAmountWei,
                    expiredReservationIndexes,
                );

                if (result.success) {
                    console.log('Withdrawal initiated successfully');
                } else {
                    console.error('Withdrawal failed:', result.error);
                }
            } catch (error) {
                console.error('Error in initiateWithdraw:', error);
            }
        } else {
            console.error('Ethereum object not found, do you have MetaMask installed?');
        }
    };

    return selectedVaultToManage ? (
        <Flex
            w='50%'
            h='101%'
            mt='-3px'
            px='30px'
            py='28px'
            flexDir={'column'}
            bg='#1C1C1C'
            userSelect={'none'}
            fontSize={'12px'}
            borderTop={'3px solid'}
            borderLeft={'3px solid'}
            borderBottom={'3px solid'}
            borderColor={colors.borderGray}
            borderRadius={'20px'}
            fontFamily={FONT_FAMILIES.NOSTROMO}
            color={'#c3c3c3'}
            fontWeight={'normal'}
            gap={'0px'}>
            <Flex w='100%' mt='-10px' ml='0px'>
                <Button bg='none' w='12px' _hover={{ bg: colors.borderGrayLight }} onClick={() => setSelectedVaultToManage(null)}>
                    <ChevronLeftIcon width={'40px'} height={'40px'} bg='none' color={colors.offWhite} />
                </Button>
            </Flex>
            <Flex direction='column' align='center' mt='-24px' mb='20px' w='100%'>
                <Text fontSize='22px' color={colors.offWhite} textAlign='center' mt='-12px' flex='1'>
                    Manage Deposit Vault #{selectedVaultToManage.index}
                </Text>
                <Text
                    fontSize='12px'
                    color={colors.textGray}
                    fontFamily={FONT_FAMILIES.AUX_MONO}
                    textAlign='center'
                    mt='6px'
                    flex='1'>
                    Edit or Withdraw unreserved liquidity at anytime.{' '}
                </Text>
            </Flex>
            {/* ORDER STATUS & REMAINING LIQUIDITY */}
            <Flex w='100%' mt='0px'>
                <Flex w='47%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Order Status
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        bg={
                            Number(calculateFillPercentage(selectedVaultToManage)) == 100
                                ? colors.greenBackground
                                : colors.offBlack
                        }
                        border={'3px solid'}
                        borderColor={
                            Number(calculateFillPercentage(selectedVaultToManage)) == 100
                                ? colors.greenOutline
                                : colors.borderGray
                        }
                        borderRadius={'14px'}
                        px='15px'
                        align={'center'}>
                        <Text
                            w='90%'
                            fontSize='16px'
                            letterSpacing={'-1px'}
                            fontFamily={FONT_FAMILIES.AUX_MONO}
                            color={
                                Number(calculateFillPercentage(selectedVaultToManage)) > 0 ? colors.greenOutline : colors.textGray
                            }>{`${calculateFillPercentage(selectedVaultToManage)}% FILLED`}</Text>
                        <Flex
                            ml='0px'
                            width='70%'
                            bg={
                                Number(calculateFillPercentage(selectedVaultToManage)) > 0
                                    ? Number(calculateFillPercentage(selectedVaultToManage)) == 100
                                        ? colors.greenOutline
                                        : colors.greenBackground
                                    : colors.offBlackLighter
                            }
                            borderRadius='10px'
                            height='16px'
                            border={`2px solid`}
                            borderColor={
                                Number(calculateFillPercentage(selectedVaultToManage)) > 0
                                    ? colors.greenOutline
                                    : colors.borderGrayLight
                            }>
                            <Flex
                                bg={colors.greenOutline}
                                width={`${calculateFillPercentage(selectedVaultToManage)}%`}
                                height='101%'
                                zIndex={1}
                                ml='-0.4px'
                                borderRadius='10px'
                            />
                        </Flex>
                    </Flex>
                </Flex>
                <Spacer />
                <Flex w='47%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Remaining Liquidity{' '}
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg='#161A33'
                        border='3px solid #303F9F'
                        borderRadius={'14px'}
                        px='15px'
                        align={'center'}>
                        <Text fontSize='16px' color={colors.offWhite} letterSpacing={'-1px'} fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {weiToEth(selectedVaultToManage.unreservedBalance)}
                        </Text>
                        <Spacer />
                        <ETHSVG width='68' height='50' viewBox='0 0 130 52' />
                    </Flex>
                </Flex>
            </Flex>

            {/* SWAP INPUT & SWAP OUTPUT */}
            <Flex w='100%' mt='30px'>
                <Flex w='47%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Swap Input
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg='#161A33'
                        border='3px solid #303F9F'
                        borderRadius={'14px'}
                        px='15px'
                        align={'center'}>
                        <Text fontSize='16px' color={colors.offWhite} letterSpacing={'-1px'} fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {weiToEth(selectedVaultToManage.initialBalance)}
                        </Text>
                        <Spacer />
                        <ETHSVG width='68' height='50' viewBox='0 0 130 52' />
                    </Flex>
                </Flex>
                <Text
                    mt='40px'
                    pl='12px'
                    fontSize='22px'
                    fontWeight={'bold'}
                    color={colors.offWhite}
                    letterSpacing={'-1px'}
                    fontFamily={FONT_FAMILIES.AUX_MONO}>
                    ≈
                </Text>
                <Spacer />

                <Flex w='47%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Swap Output
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg='#2E1C0C'
                        border={'3px solid'}
                        borderColor={'#78491F'}
                        borderRadius={'14px'}
                        px='15px'
                        align={'center'}>
                        <Text fontSize='16px' color={colors.offWhite} letterSpacing={'-1px'} fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {(
                                satsToBtc(BigNumber.from(selectedVaultToManage.btcExchangeRate).toNumber()) *
                                weiToEth(selectedVaultToManage.unreservedBalance)
                            ).toFixed(8)}
                        </Text>

                        <Spacer />
                        <BTCSVG width='68' height='50' viewBox='0 0 130 52' />
                    </Flex>
                </Flex>
            </Flex>

            {/* EXCHANGE RATE */}
            <Flex w='100%' mt='30px'>
                <Flex w='100%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Exchange Rate{' '}
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg={colors.offBlack}
                        border={'3px solid'}
                        borderColor={colors.borderGray}
                        borderRadius={'14px'}
                        px='15px'
                        align={'center'}>
                        <Text
                            fontSize='16px'
                            color={colors.textGray} // Change the default color to gray
                            letterSpacing='-1px'
                            fontFamily={FONT_FAMILIES.AUX_MONO}>
                            1 BTC =
                            <span style={{ color: colors.offWhite }}>
                                {' '}
                                {1 / satsToBtc(BigNumber.from(selectedVaultToManage.btcExchangeRate).toNumber())}
                            </span>{' '}
                            WETH
                        </Text>

                        <Spacer />
                        <Button
                            color={colors.offWhite}
                            bg={colors.purpleBackground}
                            borderRadius='10px'
                            border={`3px solid ${colors.purpleBorder}`}
                            px='14px'
                            _hover={{ bg: colors.purpleBorderDark }}
                            mr='-16px'
                            py={'16px'}
                            h='110%'
                            w='150px'>
                            Edit Rate
                        </Button>
                    </Flex>
                </Flex>
            </Flex>

            {/* BITCOIN PAYOUT ADDRESS */}
            <Flex w='100%' mt='30px'>
                <Flex w='100%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Bitcoin Payout Address
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg='#2E1C0C'
                        border={'3px solid'}
                        borderColor={'#78491F'}
                        borderRadius={'14px'}
                        px='15px'
                        align={'center'}>
                        <Text fontSize='16px' color={colors.offWhite} letterSpacing='-1px' fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {/* TODO: Change this to be the address from the locking script */}
                            {selectedVaultToManage.btcPayoutLockingScript}
                        </Text>

                        <Spacer />
                    </Flex>
                </Flex>
            </Flex>

            {/* WITHDRAW LIQUIDITY BUTTON */}
            <>
                <Flex mt='35px' justify='center'>
                    <Button
                        h='45px'
                        onClick={onOpen}
                        _hover={{ bg: colors.redHover }}
                        bg={colors.redBackground}
                        color={colors.offWhite}
                        border={`3px solid ${colors.red}`}
                        borderRadius='10px'
                        fontSize='15px'
                        w='265px'>
                        Withdraw Liquidity
                    </Button>
                </Flex>

                <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset='slideInBottom'>
                    <ModalOverlay />
                    <ModalContent
                        w='550px'
                        pb={'20px'}
                        borderRadius={'20px'}
                        bg={colors.offBlack}
                        borderWidth={3}
                        borderColor={colors.borderGray}
                        mx={'4px'}>
                        <ModalHeader alignSelf={'center'} fontSize='24px' mt='-4px' color={colors.red}>
                            Withdraw Liquidity
                        </ModalHeader>
                        <ModalCloseButton marginTop={'6px'} />
                        <ModalBody>
                            <Text ml='0px' mb='8px' w='100%' fontSize='18px' color={colors.offWhite}>
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
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                h='45px'
                                onClick={handleWithdraw}
                                _hover={{ bg: colors.redHover }}
                                bg={colors.redBackground}
                                color={colors.offWhite}
                                border={`3px solid ${colors.red}`}
                                borderRadius='10px'
                                fontSize='15px'
                                w='full'>
                                Confirm Withdraw
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </>
        </Flex>
    ) : (
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
            <Flex mb={'16px'} justify={'center'}>
                <HorizontalButtonSelector
                    w='300px'
                    h='40px'
                    fontSize={'10px'}
                    options={optionsButtoActiveVsCompleted}
                    onSelectItem={setSelectedButtonActiveVsCompleted}
                />
            </Flex>
            <Flex
                bg={colors.offBlack}
                w='100%'
                h='30px'
                py='5px'
                mb='9px'
                px='15px'
                align='center'
                justify='flex-start'
                borderRadius={'10px'}
                // border={'2px solid'}
                borderColor={colors.borderGray}
                fontWeight='normal'>
                <Text width='6%'>ID</Text>
                <Text width='12%'>AMOUNT</Text>
                <Text width='14%'>ASSET</Text>
                <Text width='36%'>EXCHANGE RATE</Text>
                <Text width='25%'>ORDER STATUS</Text>
            </Flex>
            <style>
                {`
          .flex-scroll-dark::-webkit-scrollbar {
            width: 12px;
          }
          .flex-scroll-dark::-webkit-scrollbar-track {
            background: #2D2D2D;
          }
          .flex-scroll-dark::-webkit-scrollbar-thumb {
            background-color: #555;
            border-radius: 6px;
            border: 3px solid #2D2D2D;
          }
        `}
            </style>
            <Flex className='flex-scroll-dark' overflowY='scroll' direction='column'>
                {' '}
                {vaultsToDisplay && vaultsToDisplay.length > 0 ? (
                    vaultsToDisplay.map((vault: DepositVault, index: number) => {
                        const fillPercentage = calculateFillPercentage(vault);

                        return (
                            <Flex
                                _hover={{ bg: colors.purpleBackground, borderColor: colors.purpleBorder }}
                                onClick={() => setSelectedVaultToManage(vault)}
                                cursor={'pointer'}
                                letterSpacing={'-1px'}
                                bg={colors.offBlackLighter}
                                w='100%'
                                h='50px'
                                py='10px'
                                mb='10px'
                                px='15px'
                                key={vault.index}
                                align='center'
                                justify='flex-start'
                                borderRadius={'10px'}
                                border='2px solid '
                                borderColor={colors.borderGrayLight}>
                                <Text width='6%' fontWeight='bold'>
                                    #{vault.index}
                                </Text>
                                <Text width='12%' fontWeight='bold'>
                                    {weiToEth(vault.initialBalance)}
                                </Text>
                                <Text width='14%' ml='-8px' mr='9px'>
                                    <ETHSVG />
                                </Text>
                                <Text width='36%'>
                                    {'1 BTC ≈ ' +
                                        (1 / satsToBtc(BigNumber.from(vault.btcExchangeRate).toNumber())).toFixed(8) +
                                        ' WETH'}
                                </Text>
                                <Text
                                    color={Number(fillPercentage) > 0 ? colors.greenOutline : colors.textGray}
                                    fontSize='12px'>{`${fillPercentage}% FILLED`}</Text>
                                <Spacer />
                                <Flex
                                    ml='16px'
                                    width='75px'
                                    bg={
                                        Number(fillPercentage) > 0
                                            ? Number(fillPercentage) == 100
                                                ? colors.greenOutline
                                                : colors.greenBackground
                                            : colors.offBlackLighter
                                    }
                                    borderRadius='10px'
                                    height='16px'
                                    border={`1px solid`}
                                    borderColor={Number(fillPercentage) > 0 ? colors.greenOutline : colors.darkerGray}>
                                    <Flex
                                        bg={colors.greenOutline}
                                        width={`${fillPercentage}%`}
                                        height='101%'
                                        zIndex={1}
                                        ml='-0.4px'
                                        borderRadius='10px'
                                    />
                                </Flex>
                            </Flex>
                        );
                    })
                ) : (
                    <Text>No deposit vaults found</Text>
                )}
            </Flex>
        </Flex>
    );
};
