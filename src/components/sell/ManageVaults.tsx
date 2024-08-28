import { Flex, Text } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { useWithdrawLiquidity } from '../../hooks/contract/useWithdrawLiquidity';
import useHorizontalSelectorInput from '../../hooks/useHorizontalSelectorInput';
import { useStore } from '../../store';
import { DepositVault } from '../../types';
import { colors } from '../../utils/colors';
import { getLiquidityProvider } from '../../utils/contractReadFunctions';
import { FONT_FAMILIES } from '../../utils/font';
import vault from '../../utils/vault.json';
import HorizontalButtonSelector from '../HorizontalButtonSelector';
import DetailedVault from './DetailedVault';
import VaultSettings from './VaultSettings';
import LightVault from './LightVault';

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

    const { withdrawLiquidity, resetWithdrawState } = useWithdrawLiquidity();

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
        if (userActiveDepositVaults.length == 0) setUserActiveDepositVaults(vault as any);
    }, [userActiveDepositVaults]);

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
            mt='24px'>
            {!selectedVaultToManage && (
                <Flex justify={'center'}>
                    <HorizontalButtonSelector
                        w='300px'
                        h='40px'
                        fontSize={'14px'}
                        options={optionsButtoActiveVsCompleted}
                        onSelectItem={setSelectedButtonActiveVsCompleted}
                    />
                </Flex>
            )}
            <Flex
                w='100%'
                maxW='1000px'
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
                                fontFamily={FONT_FAMILIES.NOSTROMO}
                                borderColor={colors.borderGray}
                                fontWeight='bold'
                                color={colors.offWhite}
                                gap='12px'>
                                <Text width='48px'>ID</Text>
                                <Flex flex={1} gap='12px'>
                                    <Text flex={1}>SWAP INPUT</Text>
                                    <Flex w='20px' />
                                    <Text flex={1}>SWAP OUTPUT</Text>
                                </Flex>
                                <Text width='120px' mr='72px'>
                                    FILL STATUS
                                </Text>
                            </Flex>
                        )}
                        <style>
                            {`
                                .flex-scroll-dark::-webkit-scrollbar {
                                    width: 8px;
                                    padding-left: 10px;
                                }
                                .flex-scroll-dark::-webkit-scrollbar-track {
                                    background: transparent;
                                    margin-left: 10px;
                                }
                                .flex-scroll-dark::-webkit-scrollbar-thumb {
                                    background-color: #555;
                                    border-radius: 6px;
                                    border: 2px solid #2D2D2D;
                                }
                            `}
                        </style>
                        <Flex
                            className='flex-scroll-dark'
                            overflowY={vaultsToDisplay && vaultsToDisplay.length > 0 ? 'scroll' : 'hidden'}
                            direction='column'
                            w='100%'>
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
};
