import { Flex, Spacer, Tooltip, Text, Spinner } from '@chakra-ui/react';
import { calculateBtcOutputAmountFromExchangeRate, formatBtcExchangeRate } from '../../utils/dappHelper';
import { DepositVault, SwapReservation, ValidAsset, ReservationState } from '../../types';
import { BigNumber } from 'ethers';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { AssetTag } from '../other/AssetTag';
import { formatUnits } from 'ethers/lib/utils';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import { VaultStatusBar } from './VaultStatusBar';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../../store';
import { useEffect, useState } from 'react';
import { fetchReservationDetails } from '../../utils/dappHelper';

interface SwapPreviewCardProps {
    vault?: DepositVault;
    reservation?: SwapReservation;
    url?: string;
    onClick: () => void;
    selectedInputAsset: ValidAsset;
}

const SwapPreviewCard: React.FC<SwapPreviewCardProps> = ({ vault, reservation, url, onClick, selectedInputAsset }) => {
    const timestampUnix = vault?.depositTimestamp
        ? BigNumber.from(vault.depositTimestamp).toNumber()
        : reservation?.reservationTimestamp
        ? BigNumber.from(reservation.reservationTimestamp).toNumber()
        : null;

    const timeAgo = timestampUnix ? formatDistanceToNow(new Date(timestampUnix * 1000), { addSuffix: true }) : 'N/A';
    const [btcInputSwapAmount, setBtcInputSwapAmount] = useState<string | null>(null);
    const [usdtOutputSwapAmount, setUsdtOutputSwapAmount] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const ethersRpcProvider = useStore.getState().ethersRpcProvider;

    useEffect(() => {
        if (reservation && url) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const reservationDetails = await fetchReservationDetails(url, ethersRpcProvider, selectedInputAsset);
                    setBtcInputSwapAmount(reservationDetails.btcInputSwapAmount);
                    setUsdtOutputSwapAmount(reservationDetails.totalReservedAmountInUsdt);
                } catch (error) {
                    console.error('Error fetching reservation details:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [reservation, url, ethersRpcProvider, selectedInputAsset]);

    const SettingsWithTooltip = () => {
        const label = vault ? `d-${vault.index} \n settings` : reservation ? `r-${reservation.indexInContract} \n settings` : 'settings';

        return (
            <Tooltip fontFamily={FONT_FAMILIES.AUX_MONO} label={label} fontSize='sm' bg={colors.offBlackLighter3} borderColor={colors.offBlack} color={colors.textGray} borderRadius='md' hasArrow>
                <Flex w='30px' justify='flex-end'>
                    <Flex alignItems='center'>
                        <IoMdSettings size={'18px'} color={colors.textGray} />
                    </Flex>
                </Flex>
            </Tooltip>
        );
    };

    const renderAmount = (amount: string | null, isLoading: boolean, fallbackValue: string | undefined) => {
        if (isLoading) {
            return <Spinner size='sm' color={colors.offWhite} />;
        }
        return (
            <Text fontSize='16px' color={colors.offWhite} letterSpacing={'-1px'} fontFamily={FONT_FAMILIES.AUX_MONO}>
                {amount !== null ? amount : fallbackValue || 'N/A'}
            </Text>
        );
    };

    return (
        <Flex>
            <Flex
                _hover={{
                    bg: colors.purpleBackground,
                    borderColor: colors.purpleBorder,
                }}
                onClick={onClick}
                cursor={'pointer'}
                letterSpacing={'-2px'}
                bg={colors.offBlack}
                w='100%'
                mb='10px'
                fontSize={'18px'}
                px='16px'
                py='12px'
                align='center'
                justify='flex-start'
                borderRadius={'10px'}
                border='2px solid '
                color={colors.textGray}
                borderColor={colors.borderGray}
                gap='12px'>
                <Text width='110px' pr='20px' fontSize={'14px'}>
                    {timeAgo}
                </Text>
                <Flex flex={1} align='center' gap='12px'>
                    {/* Input Section */}
                    <Flex flex={1} direction='column'>
                        <Flex
                            h='50px'
                            w='100%'
                            bg={reservation ? colors.currencyCard.btc.background : selectedInputAsset.dark_bg_color}
                            border='2px solid'
                            borderColor={reservation ? colors.currencyCard.btc.border : selectedInputAsset.bg_color}
                            borderRadius={'14px'}
                            pl='15px'
                            pr='10px'
                            align={'center'}>
                            {reservation
                                ? renderAmount(
                                      btcInputSwapAmount,
                                      isLoading,
                                      vault?.btcExchangeRate && calculateBtcOutputAmountFromExchangeRate(vault.initialBalance, vault.depositAsset?.decimals, vault.btcExchangeRate),
                                  )
                                : renderAmount(vault.initialBalance && formatUnits(BigNumber.from(vault.initialBalance).toString(), vault.depositAsset?.decimals).toString(), false, undefined)}
                            <Spacer />
                            <AssetTag assetName={reservation ? 'BTC' : vault.depositAsset?.name} width={reservation ? '80px' : '84px'} />
                        </Flex>
                    </Flex>

                    {/* Arrow */}
                    <Flex mt='0px' fontSize='20px' opacity={0.9}>
                        <FaRegArrowAltCircleRight color={reservation ? selectedInputAsset.border_color : colors.RiftOrange} />
                    </Flex>

                    {/* Output Section */}
                    <Flex flex={1} direction='column'>
                        <Flex
                            h='50px'
                            w='100%'
                            bg={reservation ? colors.currencyCard.usdt.background : colors.currencyCard.btc.background}
                            border='2px solid'
                            borderColor={reservation ? colors.currencyCard.usdt.border : colors.currencyCard.btc.border}
                            borderRadius={'14px'}
                            pl='15px'
                            pr='10px'
                            align={'center'}>
                            {reservation
                                ? renderAmount(usdtOutputSwapAmount, isLoading, undefined)
                                : renderAmount(
                                      btcInputSwapAmount,
                                      isLoading,
                                      vault?.btcExchangeRate && calculateBtcOutputAmountFromExchangeRate(vault.initialBalance, vault.depositAsset?.decimals, vault.btcExchangeRate),
                                  )}
                            <Spacer />
                            <AssetTag assetName={reservation ? 'USDT' : 'BTC'} width='80px' />
                        </Flex>
                    </Flex>
                </Flex>

                <Flex width='125px' ml='10px'>
                    {/* vault status bar */}
                    {vault && (
                        <Flex w='100%'>
                            <VaultStatusBar mini={true} selectedVault={vault} />
                        </Flex>
                    )}
                    {/* reservation state */}
                    {reservation && (
                        <Flex w='100%' justify='flex-starts' gap='12px' align='center'>
                            {/* Status text */}
                            <Text fontSize={'14px'} fontFamily={FONT_FAMILIES.AUX_MONO} color={ReservationState[reservation.state] === 'Completed' ? colors.greenOutline : colors.offWhite}>
                                {ReservationState[reservation.state]}
                            </Text>
                            {/* Dot indicating status color */}
                            <Flex
                                h='10px'
                                w='10px'
                                borderRadius='50%'
                                bg={
                                    ReservationState[reservation.state] === 'Created'
                                        ? colors.RiftOrange
                                        : ReservationState[reservation.state] === 'Completed'
                                        ? colors.greenOutline
                                        : ReservationState[reservation.state] === 'Unlocked'
                                        ? colors.purpleBackground
                                        : colors.borderGray // Fallback for 'Expired' or any other status
                                }
                            />
                        </Flex>
                    )}
                </Flex>

                {/* Settings tooltip */}
                <SettingsWithTooltip />
            </Flex>
        </Flex>
    );
};

export default SwapPreviewCard;
