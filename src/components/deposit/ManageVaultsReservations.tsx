import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useHorizontalSelectorInput from '../../hooks/useHorizontalSelectorInput';
import { useStore } from '../../store';
import { DepositVault, SwapReservation } from '../../types';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import HorizontalButtonSelector from '../HorizontalButtonSelector';
import VaultSettings from './VaultSettings';
import LightVault from './LightVault';
import { useAccount } from 'wagmi';
import { ConnectWalletButton } from '../ConnectWalletButton';
import LightReservation from './LightReservation';
import { createReservationUrl } from '../../utils/dappHelper';
import { useRouter } from 'next/router';
import { opaqueBackgroundColor } from '../../utils/constants';
import { useContractData } from '../providers/ContractDataProvider';

export const ManageVaultsReservations = ({}) => {
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
    const [hideCompletedVaults, setHideCompletedVaults] = useState(false);
    const vaultsToDisplay = hideCompletedVaults ? userActiveDepositVaults : userActiveDepositVaults.concat(userCompletedDepositVaults);
    const { address, isConnected } = useAccount();
    const { refreshAllDepositData, loading } = useContractData();
    const allSwapReservations = useStore((state) => state.allSwapReservations);
    const userSwapReservations = allSwapReservations
        ? allSwapReservations.filter((reservation: SwapReservation) => reservation.owner.toLowerCase() === address?.toLowerCase())
        : [];

    const handleGoBack = () => {
        setSelectedVaultToManage(null);
    };

    const router = useRouter();

    const handleNavigation = (route: string) => {
        router.push(route);
    };
    // useeffect to console log user sawp reservations
    useEffect(() => {
        console.log('allSwapReservations', allSwapReservations);
    }, [allSwapReservations]);

    // Update selected vault with new data
    useEffect(() => {
        if (selectedVaultToManage) {
            const selectedVaultIndex = selectedVaultToManage.index;

            const updatedVault =
                userActiveDepositVaults.find((vault) => vault.index === selectedVaultIndex) || userCompletedDepositVaults.find((vault) => vault.index === selectedVaultIndex);

            if (updatedVault) {
                setSelectedVaultToManage(updatedVault);
            } else {
                console.warn(`Vault with index ${selectedVaultIndex} not found in active or completed vaults.`);
            }
        }
    }, [userActiveDepositVaults, userCompletedDepositVaults, selectedVaultToManage]);

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
                justify='center'
                py='12px'
                align={'center'}
                borderRadius={'20px'}
                mt={selectedVaultToManage ? '56px' : '16px'}
                border='2px solid'
                {...opaqueBackgroundColor}
                borderColor={colors.borderGray}
                flexDir='column'>
                <Text textAlign={'center'} fontSize={'16px'} px='20px' mb='30px'>
                    Connect your wallet to see active deposit vaults and swap reservations
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
            {loading ? (
                <>
                    {' '}
                    <Flex
                        w='100%'
                        maxW='1000px'
                        h='200px'
                        px='24px'
                        justify='center'
                        py='12px'
                        align={'center'}
                        {...opaqueBackgroundColor}
                        borderRadius={'20px'}
                        mt={'16px'}
                        border='2px solid'
                        borderColor={colors.borderGray}
                        flexDir='column'>
                        <Spinner size='lg' thickness='3px' color={colors.textGray} speed='0.65s' />
                    </Flex>
                </>
            ) : (
                <Flex
                    w='100%'
                    maxW='1000px'
                    h='650px'
                    px='24px'
                    justify={
                        loading ? 'center' : (vaultsToDisplay && vaultsToDisplay.length > 0) || (userSwapReservations && userSwapReservations.length) > 0 ? 'flex-start' : 'center'
                    }
                    py='12px'
                    align={'center'}
                    {...opaqueBackgroundColor}
                    borderRadius={'20px'}
                    mt={'16px'}
                    border='2px solid'
                    borderColor={colors.borderGray}
                    flexDir='column'>
                    {selectedVaultToManage ? (
                        <VaultSettings selectedVaultToManage={selectedVaultToManage} handleGoBack={handleGoBack} selectedInputAsset={selectedInputAsset} />
                    ) : (
                        <>
                            {(vaultsToDisplay && vaultsToDisplay.length > 0) || (userSwapReservations && userSwapReservations.length > 0) ? (
                                <Flex
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
                                    <Text width='120px' ml='20px' mr='52px'>
                                        STATUS
                                    </Text>
                                </Flex>
                            ) : null}
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
                                overflowY={
                                    (selectedButtonVaultsVsReservations === 'Vaults' && vaultsToDisplay && vaultsToDisplay.length > 0) ||
                                    (selectedButtonVaultsVsReservations === 'Reservations' && userSwapReservations && userSwapReservations.length > 0)
                                        ? 'scroll'
                                        : 'hidden'
                                }
                                direction='column'
                                w='100%'>
                                {(userSwapReservations == null || userSwapReservations.length === 0) && (vaultsToDisplay == null || vaultsToDisplay.length === 0) ? (
                                    <Flex justify={'center'} fontSize={'16px'} alignItems={'center'}>
                                        <Text>No active swaps found with your address</Text>
                                    </Flex>
                                ) : (
                                    <>
                                        {userSwapReservations &&
                                            userSwapReservations.length > 0 &&
                                            userSwapReservations.map((reservation: SwapReservation, index: number) => (
                                                <LightReservation
                                                    key={index}
                                                    reservation={reservation}
                                                    url={createReservationUrl(reservation.nonce, reservation.indexInContract.toString())}
                                                    onClick={() => {
                                                        const reservationUrl = createReservationUrl(reservation.nonce, reservation.indexInContract.toString());
                                                        handleNavigation(`/swap/${reservationUrl}`);
                                                    }}
                                                />
                                            ))}
                                        {vaultsToDisplay &&
                                            vaultsToDisplay.length > 0 &&
                                            vaultsToDisplay.map((vault: DepositVault, index: number) => (
                                                <LightVault key={index} vault={vault} onClick={() => setSelectedVaultToManage(vault)} selectedInputAsset={selectedInputAsset} />
                                            ))}
                                    </>
                                )}
                            </Flex>
                        </>
                    )}
                </Flex>
            )}
        </Flex>
    );
};
