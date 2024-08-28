import { ChevronLeftIcon } from '@chakra-ui/icons';
import { Button, Flex, Spacer, Text } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { useWithdrawLiquidity } from '../../hooks/contract/useWithdrawLiquidity';
import useHorizontalSelectorInput from '../../hooks/useHorizontalSelectorInput';
import { useStore } from '../../store';
import { DepositVault } from '../../types';
import { colors } from '../../utils/colors';
import { bitcoin_border_color } from '../../utils/constants';
import { getLiquidityProvider } from '../../utils/contractReadFunctions';
import {
    calculateBtcOutputAmountFromExchangeRate,
    convertLockingScriptToBitcoinAddress,
    formatBtcExchangeRate,
} from '../../utils/dappHelper';
import { FONT_FAMILIES } from '../../utils/font';
import HorizontalButtonSelector from '../HorizontalButtonSelector';
import { AssetTag2 } from '../other/AssetTag2';
import LightVault from './LightVault';
import { VaultStatusBar } from './VaultStatusBar';
import WithdrawStatusModal from './WithdrawStatusModal';
import vault from '../../utils/vault.json';
import VaultSettings from './VaultSettings';

export const ManageVaults = ({}) => {
    const {
        options: optionsButtoActiveVsCompleted,
        selected: selectedButtonActiveVsCompleted,
        setSelected: setSelectedButtonActiveVsCompleted,
    } = useHorizontalSelectorInput(['Active', 'Completed'] as const);

    const selectedVaultToManage = useStore((state) => state.selectedVaultToManage);
    const setSelectedVaultToManage = useStore((state) => state.setSelectedVaultToManage);
    const userActiveDepositVaults = useStore((state) => state.userActiveDepositVaults);
    const userCompletedDepositVaults = useStore((state) => state.userCompletedDepositVaults);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);

    const {
        withdrawLiquidity,
        status: withdrawLiquidityStatus,
        error: withdrawLiquidityError,
        txHash: withdrawTxHash,
        resetWithdrawState,
    } = useWithdrawLiquidity();

    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const vaultsToDisplay =
        selectedButtonActiveVsCompleted === 'Active' ? userActiveDepositVaults : userCompletedDepositVaults;
    const setUserActiveDepositVaults = useStore((state) => state.setUserActiveDepositVaults);
    const [_refreshKey, setRefreshKey] = useState(0);

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

    useEffect(() => {
        setUserActiveDepositVaults(vault as any);
    }, []);

    return (
        <Flex
            w={'100%'}
            h='100%'
            flexDir={'column'}
            userSelect={'none'}
            fontSize={'12px'}
            fontFamily={FONT_FAMILIES.AUX_MONO}
            color={'#c3c3c3'}
            fontWeight={'normal'}
            gap={'0px'}
            align='center'
            mt='12px'>
            {!selectedVaultToManage && (
                <Flex justify={'center'}>
                    <HorizontalButtonSelector
                        w='300px'
                        h='40px'
                        fontSize={'10px'}
                        options={optionsButtoActiveVsCompleted}
                        onSelectItem={setSelectedButtonActiveVsCompleted}
                    />
                </Flex>
            )}
            <Flex
                w='100%'
                maxW='800px'
                h='650px'
                px='24px'
                py='12px'
                align={'center'}
                justify={'center'}
                bg={colors.offBlack}
                borderRadius={'20px'}
                mt={selectedVaultToManage ? '56px' : '16px'}
                border='3px solid'
                borderColor={colors.borderGray}
                flexDir='column'>
                {selectedVaultToManage ? (
                    <VaultSettings
                        selectedVaultToManage={selectedVaultToManage}
                        handleGoBack={handleGoBack}
                        selectedInputAsset={selectedInputAsset}
                        handleWithdraw={handleWithdraw}
                    />
                ) : (
                    <>
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
                                fontSize={'14px'}
                                // border={'2px solid'}
                                fontFamily={FONT_FAMILIES.NOSTROMO}
                                borderColor={colors.borderGray}
                                fontWeight='bold'
                                color={colors.offWhite}>
                                {/* <Text width='6%'>ID</Text> */}
                                <Text width='8.5%'>ID</Text>
                                <Text width='37.5%'>SWAP INPUT</Text>
                                <Text width='32%'>EXCHANGE RATE</Text>
                                <Text width='20%'>FILL STATUS</Text>
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
                            direction='column'
                            w='100%'>
                            {' '}
                            {vaultsToDisplay && vaultsToDisplay.length > 0 ? (
                                vaultsToDisplay.map((vault: DepositVault, index: number) => (
                                    <LightVault
                                        key={index}
                                        vault={vault}
                                        onClick={() => setSelectedVaultToManage(vault)}
                                        selectedInputAsset={selectedInputAsset}
                                    />
                                ))
                            ) : (
                                <Flex justify={'center'} fontSize={'16px'} alignItems={'center'}>
                                    <Text>
                                        No {selectedButtonActiveVsCompleted.toLocaleLowerCase()} deposit vaults found
                                    </Text>
                                </Flex>
                            )}
                        </Flex>
                    </>
                )}
            </Flex>
        </Flex>
    );

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
                        bg={selectedInputAsset.dark_bg_color}
                        border='3px solid'
                        borderColor={selectedInputAsset.bg_color}
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
            flexDir={'column'}
            userSelect={'none'}
            fontSize={'12px'}
            fontFamily={FONT_FAMILIES.AUX_MONO}
            color={'#c3c3c3'}
            fontWeight={'normal'}
            gap={'0px'}
            align='center'>
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
                w='100%'
                maxW='800px'
                h='650px'
                px='24px'
                py='12px'
                align={'center'}
                justify={'center'}
                bg={colors.offBlack}
                borderRadius={'20px'}
                mt='8px'
                border='3px solid'
                borderColor={colors.borderGray}
                flexDir='column'>
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
                        fontSize={'14px'}
                        // border={'2px solid'}
                        fontFamily={FONT_FAMILIES.NOSTROMO}
                        borderColor={colors.borderGray}
                        fontWeight='bold'
                        color={colors.offWhite}>
                        {/* <Text width='6%'>ID</Text> */}
                        <Text width='8.5%'>ID</Text>
                        <Text width='37.5%'>SWAP INPUT</Text>
                        <Text width='32%'>EXCHANGE RATE</Text>
                        <Text width='20%'>FILL STATUS</Text>
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
                    direction='column'
                    w='100%'>
                    {' '}
                    {vaultsToDisplay && vaultsToDisplay.length > 0 ? (
                        vaultsToDisplay.map((vault: DepositVault, index: number) => (
                            <LightVault
                                key={index}
                                vault={vault}
                                onClick={() => setSelectedVaultToManage(vault)}
                                selectedInputAsset={selectedInputAsset}
                            />
                        ))
                    ) : (
                        <Flex justify={'center'} fontSize={'16px'} alignItems={'center'}>
                            <Text>No {selectedButtonActiveVsCompleted.toLocaleLowerCase()} deposit vaults found</Text>
                        </Flex>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};
