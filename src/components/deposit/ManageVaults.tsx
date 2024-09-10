import { Flex, Text } from '@chakra-ui/react';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import useHorizontalSelectorInput from '../../hooks/useHorizontalSelectorInput';
import { useStore } from '../../store';
import { DepositVault } from '../../types';
import { colors } from '../../utils/colors';
import { getLiquidityProvider } from '../../utils/contractReadFunctions';
import { FONT_FAMILIES } from '../../utils/font';
// import vault from '../../utils/vault.json';
import HorizontalButtonSelector from '../HorizontalButtonSelector';
import DetailedVault from './DetailedVault';
import VaultSettings from './VaultSettings';
import LightVault from './LightVault';
import { useAccount } from 'wagmi';
import { ConnectWalletButton } from '../ConnectWalletButton';

export const ManageVaults = ({}) => {
    const {
        options: optionsButtonVaultsVsReservations,
        selected: selectedButtonVaultsVsReservations,
        setSelected: setOptionsButtonVaultsVsReservations,
    } = useHorizontalSelectorInput(['Vaults', 'Reservations'] as const);

    const selectedVaultToManage = useStore((state) => state.selectedVaultToManage);
    const setSelectedVaultToManage = useStore((state) => state.setSelectedVaultToManage);
    const userActiveDepositVaults = useStore((state) => state.userActiveDepositVaults);
    const userCompletedDepositVaults = useStore((state) => state.userCompletedDepositVaults);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const withdrawAmount = useStore((state) => state.withdrawAmount);
    const setWithdrawAmount = useStore((state) => state.setWithdrawAmount);
    const [hideCompletedVaults, setHideCompletedVaults] = useState(false); // TODO: add hide completed vaults checkbox in UI
    const vaultsToDisplay = hideCompletedVaults
        ? userActiveDepositVaults
        : userActiveDepositVaults.concat(userCompletedDepositVaults);
    const setUserActiveDepositVaults = useStore((state) => state.setUserActiveDepositVaults);
    const [_refreshKey, setRefreshKey] = useState(0);
    const { address, isConnected } = useAccount();

    const handleGoBack = () => {
        // clear selected vault
        setSelectedVaultToManage(null);
        console.log('selectedButtonVaultsVsReservations:', selectedButtonVaultsVsReservations);
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

    // useEffect(() => {
    //     if (userActiveDepositVaults.length == 0) setUserActiveDepositVaults(vault as any);
    // }, [userActiveDepositVaults]);

    return !isConnected ? (
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
            <Flex
                w='100%'
                maxW='600px'
                h='200px'
                px='24px'
                justify={vaultsToDisplay && vaultsToDisplay.length > 0 ? 'flex-start' : 'center'}
                py='12px'
                align={'center'}
                bg={colors.offBlack}
                borderRadius={'20px'}
                mt={selectedVaultToManage ? '56px' : '16px'}
                border='3px solid'
                borderColor={colors.borderGray}
                flexDir='column'>
                <Text textAlign={'center'} fontSize={'16px'} px='20px' mb='30px'>
                    Connect your wallet to see active deposit vaults and swap resevations
                </Text>

                <ConnectWalletButton />
            </Flex>
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
            align='center'
            mt='24px'>
            {!selectedVaultToManage && (
                <Flex justify={'center'}>
                    <HorizontalButtonSelector
                        w='350px'
                        h='40px'
                        fontSize={'14px'}
                        options={optionsButtonVaultsVsReservations}
                        onSelectItem={setOptionsButtonVaultsVsReservations}
                    />
                </Flex>
            )}
            <Flex
                w='100%'
                maxW='1000px'
                h='650px'
                px='24px'
                justify={vaultsToDisplay && vaultsToDisplay.length > 0 ? 'flex-start' : 'center'}
                py='12px'
                align={'center'}
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
                            {selectedButtonVaultsVsReservations === 'Reservations' ? (
                                <Flex justify={'center'} fontSize={'16px'} alignItems={'center'}>
                                    <Text fontSize='16px' fontWeight='bold' color={colors.offWhite} mt='10px'>
                                        TODO: Populate with user Reservations
                                    </Text>
                                </Flex>
                            ) : vaultsToDisplay && vaultsToDisplay.length > 0 ? (
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
                                    <Text>No deposit vaults found with your address</Text>
                                </Flex>
                            )}
                        </Flex>
                    </>
                )}
            </Flex>
        </Flex>
    );
};
