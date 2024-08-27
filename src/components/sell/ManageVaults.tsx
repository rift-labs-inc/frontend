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
import useWindowSize from '../../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
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
    calculateFillPercentage,
    unBufferFrom18Decimals,
    formatBtcExchangeRate,
    calculateBtcOutputAmountFromExchangeRate,
    convertLockingScriptToBitcoinAddress,
} from '../../utils/dappHelper';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { BigNumber, ethers } from 'ethers';
import { useStore } from '../../store';
import HorizontalButtonSelector from '../HorizontalButtonSelector';
import useHorizontalSelectorInput from '../../hooks/useHorizontalSelectorInput';
import { DepositVault } from '../../types';
import { FONT_FAMILIES } from '../../utils/font';
import { ArrowRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { useWithdrawLiquidity, WithdrawStatus } from '../../hooks/contract/useWithdrawLiquidity';
import WithdrawStatusModal from './WithdrawStatusModal';
import { getLiquidityProvider } from '../../utils/contractReadFunctions';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { FaArrowAltCircleRight, FaArrowRight, FaRegArrowAltCircleRight } from 'react-icons/fa';
import { bitcoin_bg_color, bitcoin_border_color, bitcoin_dark_bg_color, bitcoinDecimals } from '../../utils/constants';
import { AssetTag2 } from '../other/AssetTag2';
import { VaultStatusBar } from './VaultStatusBar';

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
    const ethersRpcProvider = useStore((state) => state.ethersRpcProvider);
    const selectedVaultToManage = useStore((state) => state.selectedVaultToManage);
    const setSelectedVaultToManage = useStore((state) => state.setSelectedVaultToManage);
    type TabType = 'Active' | 'Completed';
    const userActiveDepositVaults = useStore((state) => state.userActiveDepositVaults);
    const setUserActiveDepositVaults = useStore((state) => state.setUserActiveDepositVaults);
    const userCompletedDepositVaults = useStore((state) => state.userCompletedDepositVaults);
    const setUserCompletedDepositVaults = useStore((state) => state.setUserCompletedDepositVaults);
    const selectedAsset = useStore((state) => state.selectedAsset);

    const [activeTab, setActiveTab] = useState<TabType>('Active');

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        withdrawLiquidity,
        status: withdrawLiquidityStatus,
        error: withdrawLiquidityError,
        txHash: withdrawTxHash,
        resetWithdrawState,
    } = useWithdrawLiquidity();

    const handleNavigation = (route: string) => {
        router.push(route);
    };
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const vaultsToDisplay =
        selectedButtonActiveVsCompleted === 'Active' ? userActiveDepositVaults : userCompletedDepositVaults;
    const [refreshKey, setRefreshKey] = useState(0);

    const handleGoBack = () => {
        // clear selected vault
        setSelectedVaultToManage(null);
        console.log('selectedButtonActiveVsCompleted:', selectedButtonActiveVsCompleted);
    };

    // open withdraw modal
    const handleOpenWithdrawModal = () => {
        setIsWithdrawModalOpen(true);
        setWithdrawAmount('');
        resetWithdrawState();
    };

    // update activeTab when the selected button changes
    useEffect(() => {
        setActiveTab(selectedButtonActiveVsCompleted);
        console.log('selectedButtonActiveVsCompleted:', selectedButtonActiveVsCompleted);
    }, [selectedButtonActiveVsCompleted]);

    // handle withdraw liquidity
    const handleWithdraw = async () => {
        if (!window.ethereum || !selectedVaultToManage) {
            console.error('Ethereum provider or selected vault not available');
            return;
        }

        resetWithdrawState();

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const withdrawAmountInTokenSmallestUnit = parseUnits(
            withdrawAmount,
            selectedVaultToManage.depositAsset.decimals,
        );

        const globalVaultIndex = selectedVaultToManage.index;

        try {
            // get the liquidity provider's data
            const liquidityProviderData = await getLiquidityProvider(
                provider,
                riftExchangeABI.abi,
                selectedVaultToManage.depositAsset.riftExchangeContractAddress,
                await signer.getAddress(),
            );

            // convert the depositVaultIndexes to strings for comparison
            console.log('liquidityProviderData:', liquidityProviderData);
            const stringIndexes = liquidityProviderData.depositVaultIndexes.map((index) =>
                BigNumber.from(index).toNumber(),
            );
            console.log('stringIndexes:', stringIndexes);

            // find the local index of the globalVaultIndex in the depositVaultIndexes array
            const localVaultIndex = stringIndexes.findIndex(
                (index) => BigNumber.from(index).toNumber() === globalVaultIndex,
            );

            if (localVaultIndex === -1) {
                throw new Error("Selected vault not found in user's deposit vaults");
            }

            const expiredReservationIndexes = [];

            await withdrawLiquidity({
                signer,
                riftExchangeAbi: riftExchangeABI.abi,
                riftExchangeContract: selectedVaultToManage.depositAsset.riftExchangeContractAddress,
                globalVaultIndex,
                localVaultIndex,
                amountToWithdraw: withdrawAmountInTokenSmallestUnit,
                expiredReservationIndexes,
            });

            // TODO: refresh deposit vault data in ContractDataProvider somehow - await refreshUserDepositData();
            const updatedVault = userActiveDepositVaults.find((vault) => vault.index === selectedVaultToManage.index);
            if (updatedVault) {
                setSelectedVaultToManage(updatedVault);
            }
            setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.error('Failed to process withdrawal:', error);
        }
    };

    // update selected vault with new data
    useEffect(() => {
        if (selectedVaultToManage) {
            const selectedVaultIndex = selectedVaultToManage.index;

            // check both active and completed vaults
            const updatedVault =
                userActiveDepositVaults.find((vault) => vault.index === selectedVaultIndex) ||
                userCompletedDepositVaults.find((vault) => vault.index === selectedVaultIndex);

            console.log('updatedVault:', updatedVault);

            if (updatedVault) {
                setSelectedVaultToManage(updatedVault);
            } else {
                console.warn(`Vault with index ${selectedVaultIndex} not found in active or completed vaults.`);
            }
        }
    }, [userActiveDepositVaults, userCompletedDepositVaults, selectedVaultToManage]);

    return selectedVaultToManage ? (
        <Flex
            h='101%'
            w='100%'
            mt='10px'
            px='35px'
            py='30px'
            flexDir={'column'}
            userSelect={'none'}
            fontSize={'12px'}
            borderRadius={'20px'}
            fontFamily={FONT_FAMILIES.NOSTROMO}
            color={'#c3c3c3'}
            fontWeight={'normal'}
            gap={'0px'}>
            <Flex w='100%' mt='-4px' ml='0px'>
                <Button bg='none' w='12px' _hover={{ bg: colors.borderGrayLight }} onClick={() => handleGoBack()}>
                    <ChevronLeftIcon width={'40px'} height={'40px'} bg='none' color={colors.offWhite} />
                </Button>
            </Flex>
            <Flex direction='column' align='center' mt='-26px' mb='20px' w='100%'>
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

            {/* BITCOIN PAYOUT ADDRESS */}
            <Flex w='100%' mt='20px'>
                <Flex w='100%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Bitcoin Payout Address
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg={colors.offBlackLighter}
                        border={'3px solid'}
                        borderColor={colors.borderGrayLight}
                        borderRadius={'14px'}
                        px='15px'
                        align={'center'}>
                        <Text
                            fontSize='16px'
                            color={colors.offWhite}
                            letterSpacing='-1px'
                            fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {convertLockingScriptToBitcoinAddress(selectedVaultToManage.btcPayoutLockingScript)}
                        </Text>

                        <Spacer />
                    </Flex>
                </Flex>
            </Flex>

            {/* SWAP INPUT & SWAP OUTPUT */}
            <Flex w='100%' mt='20px'>
                <Flex w='47%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Input
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg={selectedAsset.dark_bg_color}
                        border='3px solid'
                        borderColor={selectedAsset.bg_color}
                        borderRadius={'14px'}
                        pl='15px'
                        pr='10px'
                        align={'center'}>
                        <Text
                            fontSize='16px'
                            color={colors.offWhite}
                            letterSpacing={'-1px'}
                            fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {formatUnits(
                                BigNumber.from(selectedVaultToManage.initialBalance).toString(),
                                selectedVaultToManage.depositAsset.decimals,
                            ).toString()}
                        </Text>
                        <Spacer />
                        <AssetTag2 assetName={selectedVaultToManage.depositAsset.name} width='84px' />
                    </Flex>
                </Flex>
                <Text
                    mt='46px'
                    pl='12px'
                    fontSize='20px'
                    opacity={0.9}
                    fontWeight={'bold'}
                    color={colors.offWhite}
                    letterSpacing={'-1px'}
                    fontFamily={FONT_FAMILIES.AUX_MONO}>
                    <FaRegArrowAltCircleRight color={colors.RiftOrange} />
                </Text>
                <Spacer />

                <Flex w='47%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Output
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg='#2E1C0C'
                        border={'3px solid'}
                        borderColor={'#78491F'}
                        borderRadius={'14px'}
                        pl='15px'
                        pr='10px'
                        align={'center'}>
                        <Text
                            fontSize='16px'
                            color={colors.offWhite}
                            letterSpacing={'-1px'}
                            fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {selectedVaultToManage.btcExchangeRate &&
                                calculateBtcOutputAmountFromExchangeRate(
                                    selectedVaultToManage.initialBalance,
                                    selectedVaultToManage.depositAsset.decimals,
                                    selectedVaultToManage.btcExchangeRate,
                                )}
                        </Text>

                        <Spacer />
                        <AssetTag2 assetName={'BTC'} width='80px' />
                    </Flex>
                </Flex>
            </Flex>
            {/* ORDER STATUS & REMAINING LIQUIDITY */}
            <Flex w='100%' mt='20px'>
                {/* <Flex w='47%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Remaining
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg={selectedAsset.dark_bg_color}
                        border='3px solid'
                        borderColor={selectedAsset.bg_color}
                        borderRadius={'14px'}
                        pl='15px'
                        pr='10px'
                        key={refreshKey}
                        align={'center'}>
                        <Text
                            fontSize='16px'
                            color={colors.offWhite}
                            letterSpacing={'-1px'}
                            fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {selectedVaultToManage.trueUnreservedBalance
                                ? formatUnits(
                                      selectedVaultToManage.trueUnreservedBalance,
                                      selectedVaultToManage.depositAsset.decimals,
                                  ).toString()
                                : formatUnits(
                                      selectedVaultToManage.unreservedBalance,
                                      selectedVaultToManage.depositAsset.decimals,
                                  ).toString()}
                        </Text>
                        <Spacer />
                        <AssetTag2 assetName={selectedVaultToManage.depositAsset.name} width='84px' />
                    </Flex>
                </Flex>
                <Spacer /> */}

                <Flex w='100%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Status
                    </Text>
                    <VaultStatusBar selectedVault={selectedVaultToManage} />
                </Flex>
            </Flex>

            {/* EXCHANGE RATE */}
            <Flex w='100%' mt='20px'>
                <Flex w='100%' direction='column'>
                    <Text ml='8px' w='100%' fontSize='18px' color={colors.offWhite}>
                        Exchange Rate{' '}
                    </Text>
                    <Flex
                        h='50px'
                        mt='6px'
                        w='100%'
                        bg={colors.offBlackLighter}
                        border={'3px solid'}
                        borderColor={colors.borderGrayLight}
                        borderRadius={'14px'}
                        px='15px'
                        fontSize={'18px'}
                        align={'center'}>
                        <Flex
                            mt='2px'
                            color={colors.offWhite} // Change the default color to gray
                            letterSpacing='-1px'
                            fontFamily={FONT_FAMILIES.AUX_MONO}>
                            <Text color={bitcoin_border_color}>1 BTC</Text>
                            <Text mx='12px' color={bitcoin_border_color}>
                                {' '}
                                ={' '}
                            </Text>
                            <Text color={selectedVaultToManage.depositAsset.border_color_light}>
                                {' '}
                                {selectedVaultToManage.btcExchangeRate &&
                                    Number(
                                        formatBtcExchangeRate(
                                            selectedVaultToManage.btcExchangeRate,
                                            selectedVaultToManage.depositAsset.decimals,
                                        ),
                                    ).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}{' '}
                            </Text>
                            <Text ml='12px' color={selectedVaultToManage.depositAsset.border_color_light}>
                                {' '}
                                {selectedVaultToManage.depositAsset.name}
                            </Text>
                            {/* <Flex mt='-29px' ml='12px'>
                                <AssetTag2 assetName={selectedVaultToManage.depositAsset.name} width='76px' />
                            </Flex> */}
                        </Flex>

                        <Spacer />
                        <Button
                            color={colors.offWhite}
                            bg={colors.purpleButtonBG}
                            borderRadius='10px'
                            border={`3px solid ${colors.purpleBorder}`}
                            px='14px'
                            _hover={{ bg: colors.purpleBorderDark }}
                            mr='-19px'
                            mt='1px'
                            py={'16px'}
                            h='114%'
                            w='280px'>
                            Edit Exchange Rate
                        </Button>
                    </Flex>
                </Flex>
            </Flex>

            {/* WITHDRAW LIQUIDITY BUTTON */}
            <>
                <Flex mt='38px' justify='center'>
                    <Button
                        h='45px'
                        onClick={handleOpenWithdrawModal}
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

                {/* Withdraw Status Modal */}
                <WithdrawStatusModal
                    isOpen={isWithdrawModalOpen}
                    onClose={() => setIsWithdrawModalOpen(false)}
                    status={withdrawLiquidityStatus}
                    error={withdrawLiquidityError}
                    txHash={withdrawTxHash}
                    withdrawAmount={withdrawAmount}
                    setWithdrawAmount={setWithdrawAmount}
                    handleWithdraw={handleWithdraw}
                    clearError={resetWithdrawState}
                    selectedVaultToManage={selectedVaultToManage}
                />
            </>
        </Flex>
    ) : (
        <Flex
            w={'100%'}
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
            {vaultsToDisplay && vaultsToDisplay.length > 0 && (
                <Flex
                    bg={colors.offBlack}
                    w='100%'
                    h='30px'
                    py='5px'
                    mt='5px'
                    mb='9px'
                    pl='18px'
                    align='center'
                    justify='flex-start'
                    borderRadius={'10px'}
                    fontSize={'15px'}
                    // border={'2px solid'}
                    fontFamily={FONT_FAMILIES.NOSTROMO}
                    borderColor={colors.borderGray}
                    fontWeight='bold'
                    color={colors.offWhite}>
                    {/* <Text width='6%'>ID</Text> */}
                    <Text width='20%'>INDEX</Text>
                    <Text width='30%'>SWAP INPUT</Text>
                    <Text width='39%'>SWAP OUTPUT</Text>
                    <Text width='32%'>EXCHANGE RATE</Text>
                </Flex>
            )}
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
            <Flex
                className='flex-scroll-dark'
                overflowY={vaultsToDisplay && vaultsToDisplay.length > 0 ? 'scroll' : 'hidden'}
                direction='column'>
                {' '}
                {vaultsToDisplay && vaultsToDisplay.length > 0 ? (
                    vaultsToDisplay.map((vault: DepositVault, index: number) => {
                        const fillPercentage = calculateFillPercentage(vault);
                        console.log('vault index:', vault.index);

                        return (
                            <Flex
                                key={vault.index}
                                _hover={{
                                    bg: colors.purpleBackground,
                                    borderColor: colors.purpleBorder,
                                }}
                                onClick={() => setSelectedVaultToManage(vault)}
                                cursor={'pointer'}
                                letterSpacing={'-2px'}
                                bg={colors.offBlackLighter}
                                w='100%'
                                h='80px'
                                mb='10px'
                                fontSize={'18px'}
                                pl='18px'
                                align='center'
                                justify='flex-start'
                                borderRadius={'10px'}
                                border='2px solid '
                                color={colors.offWhite}
                                borderColor={colors.borderGrayLight}>
                                <Text width='6%' fontWeight='bold'>
                                    #{vault.index}
                                </Text>
                                {/* <Text width='23%' ml='-8p x' mr='9px'></Text> */}
                                {/* SWAP INPUT & SWAP OUTPUT */}
                                <Flex w='100%' mt='10px'>
                                    <Flex w='47%' direction='column'>
                                        <Flex
                                            h='50px'
                                            mt='6px'
                                            w='100%'
                                            bg={selectedAsset.dark_bg_color}
                                            border='3px solid'
                                            borderColor={selectedAsset.bg_color}
                                            borderRadius={'14px'}
                                            pl='15px'
                                            pr='10px'
                                            align={'center'}>
                                            <Text
                                                fontSize='16px'
                                                color={colors.offWhite}
                                                letterSpacing={'-1px'}
                                                fontFamily={FONT_FAMILIES.AUX_MONO}>
                                                {vault?.initialBalance &&
                                                    formatUnits(
                                                        BigNumber.from(vault.initialBalance).toString(),
                                                        vault.depositAsset?.decimals,
                                                    ).toString()}
                                            </Text>
                                            <Spacer />
                                            <AssetTag2 assetName={vault?.depositAsset?.name} width='84px' />
                                        </Flex>
                                    </Flex>
                                    <Text
                                        mt='20px'
                                        p='12px'
                                        fontSize='20px'
                                        opacity={0.9}
                                        fontWeight={'bold'}
                                        color={colors.offWhite}
                                        letterSpacing={'-1px'}
                                        fontFamily={FONT_FAMILIES.AUX_MONO}>
                                        <FaRegArrowAltCircleRight color={colors.RiftOrange} />
                                    </Text>
                                    <Spacer />

                                    <Flex w='47%' direction='column'>
                                        <Flex
                                            h='50px'
                                            mt='6px'
                                            w='100%'
                                            bg='#2E1C0C'
                                            border={'3px solid'}
                                            borderColor={'#78491F'}
                                            borderRadius={'14px'}
                                            pl='15px'
                                            pr='10px'
                                            align={'center'}>
                                            <Text
                                                fontSize='16px'
                                                color={colors.offWhite}
                                                letterSpacing={'-1px'}
                                                fontFamily={FONT_FAMILIES.AUX_MONO}>
                                                {vault?.btcExchangeRate &&
                                                    calculateBtcOutputAmountFromExchangeRate(
                                                        vault.initialBalance,
                                                        vault.depositAsset.decimals,
                                                        vault.btcExchangeRate,
                                                    )}
                                            </Text>

                                            <Spacer />
                                            <AssetTag2 assetName={'BTC'} width='80px' />
                                        </Flex>
                                    </Flex>
                                </Flex>
                                {/* <Flex width='30%'>
                                    <Text
                                        color={
                                            Number(fillPercentage) > 0 ? colors.greenOutline : colors.textGray
                                        }>{`${fillPercentage}%`}</Text>
                                    <Flex
                                        ml='20px'
                                        mt='5px'
                                        width='60%'
                                        px='20px'
                                        bg={
                                            Number(fillPercentage) > 0
                                                ? Number(fillPercentage) == 100
                                                    ? colors.greenOutline
                                                    : colors.greenBackground
                                                : colors.offBlackLighter2
                                        }
                                        borderRadius='10px'
                                        height='17px'
                                        border={`1.5px solid`}
                                        borderColor={
                                            Number(fillPercentage) > 0 ? colors.greenOutline : colors.borderGrayLight
                                        }>
                                        <Flex
                                            bg={colors.greenOutline}
                                            width={`${fillPercentage}%`}
                                            height='101%'
                                            zIndex={1}
                                            ml='-0.4px'
                                            borderRadius='10px'
                                        />
                                    </Flex>
                                </Flex> */}
                                <Flex width='32%'>
                                    <Text color={colors.textGray} fontWeight={'normal'} letterSpacing={'-2.5px'}>
                                        {vault &&
                                            `${Number(
                                                formatBtcExchangeRate(
                                                    vault.btcExchangeRate,
                                                    vault.depositAsset.decimals,
                                                ),
                                            ).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })} ${vault.depositAsset.name}/BTC`}
                                    </Text>
                                </Flex>
                                {/* <Flex width='35%' flexDirection={'row'}>
                                    <Text mt='26px'>
                                        {formatUnits(vault.initialBalance, vault.depositAsset.decimals)}{' '}
                                    </Text>
                                    <Spacer />
                                    <Flex mt='1px' ml='18px'>
                                        <AssetTag2 width='100px' assetName={selectedAsset.name} />
                                    </Flex>
                                </Flex> */}
                            </Flex>
                        );
                    })
                ) : (
                    <Flex justify={'center'} mt='220px' fontSize={'16px'} alignItems={'center'}>
                        <Text>No {selectedButtonActiveVsCompleted.toLocaleLowerCase()} deposit vaults found</Text>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
};
