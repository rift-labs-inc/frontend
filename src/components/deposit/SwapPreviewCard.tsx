import { Flex, Spacer, Tooltip, Text, Spinner, calc } from '@chakra-ui/react';
import { calculateBtcOutputAmountFromExchangeRate, calculateOriginalAmountBeforeFee, formatBtcExchangeRate } from '../../utils/dappHelper';
import { DepositVault, SwapReservation, ValidAsset, ReservationState } from '../../types';
import { BigNumber } from 'ethers';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { AssetTag } from '../other/AssetTag';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import { VaultStatusBar } from './VaultStatusBar';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../../store';
import { useEffect, useState } from 'react';
import { fetchReservationDetails } from '../../utils/dappHelper';
import { BITCOIN_DECIMALS, FRONTEND_RESERVATION_EXPIRATION_WINDOW_IN_SECONDS } from '../../utils/constants';
import { copyToClipboard } from '../../utils/frontendHelpers';

interface SwapPreviewCardProps {
    vault?: DepositVault;
    reservation?: SwapReservation;
    url?: string;
    onClick?: () => void;
    selectedInputAsset: ValidAsset;
    isActivityPage?: boolean;
}

const SwapPreviewCard: React.FC<SwapPreviewCardProps> = ({ vault, reservation, url, onClick, selectedInputAsset, isActivityPage }) => {
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
    const [trueUsdtOutputSwapAmount, setTrueUsdtOutputSwapAmount] = useState<string | null>(null);

    useEffect(() => {
        if (reservation && url) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const reservationDetails = await fetchReservationDetails(url, ethersRpcProvider, selectedInputAsset);
                    console.log('reservationDetails:', reservationDetails);
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

    const renderAddress = (address: string | undefined) => {
        if (!address || !isActivityPage) return null;
        const shortenedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

        const handleAddressClick = (e: React.MouseEvent) => {
            e.stopPropagation(); // Prevent triggering the parent onClick
            copyToClipboard(address, 'Address copied to clipboard.');
        };

        return (
            <Text
                fontSize='10px'
                fontFamily={FONT_FAMILIES.NOSTROMO}
                letterSpacing={'1px'}
                color={colors.textGray}
                cursor='pointer'
                onClick={handleAddressClick}
                _hover={{ textDecoration: 'underline' }}>
                {shortenedAddress}
            </Text>
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

    const renderArrayDetailRow = (label: string, array: any[], formatter: (item: any) => string) => (
        <Flex mr='20px' py='4px' fontSize='13px' flexDirection='column'>
            <Text fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.textGray}>
                {label}:
            </Text>
            {array.map((item, index) => (
                <Text key={index} ml='10px' fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.offWhite}>
                    {formatter(item)}
                </Text>
            ))}
        </Flex>
    );

    const isReservationExpired =
        reservation &&
        (reservation.stateOffChain ||
            (reservation.state === 1 && Date.now() / 1000 - BigNumber.from(reservation.reservationTimestamp).toNumber() > FRONTEND_RESERVATION_EXPIRATION_WINDOW_IN_SECONDS) ||
            reservation.stateOffChain ||
            reservation.state === 4);

    const renderDetailRow = (label: string, value: string | number | null | undefined) => (
        <Flex mr='20px' py='4px' fontSize='13px'>
            <Text fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.textGray}>
                {label}:
            </Text>
            <Text ml='3px' fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.offWhite}>
                {value}
            </Text>
        </Flex>
    );

    return (
        <Flex>
            <Flex
                _hover={
                    isActivityPage
                        ? {}
                        : {
                              bg: colors.purpleBackground,
                              borderColor: colors.purpleBorder,
                          }
                }
                onClick={onClick}
                cursor={isActivityPage ? 'normal' : 'pointer'}
                letterSpacing={'-2px'}
                bg={colors.offBlack}
                w='100%'
                mb='10px'
                fontSize={'18px'}
                px='16px'
                py={isActivityPage ? '24px' : '12px'}
                align='flex-start'
                justify='flex-start'
                borderRadius={'10px'}
                border='2px solid '
                color={colors.textGray}
                borderColor={colors.borderGray}
                gap='12px'
                flexDirection={isActivityPage ? 'column' : 'row'}
                height={isActivityPage ? 'auto' : 'unset'}>
                <Flex w='100%'>
                    <Text width='110px' pr='10px' fontSize={'14px'} fontFamily={FONT_FAMILIES.AUX_MONO} fontWeight={'normal'}>
                        {timeAgo}
                    </Text>
                    <Flex flex={1} w='100%' align='center' gap='12px' direction='row'>
                        {isActivityPage && (
                            <Flex w='100px' direction='column'>
                                {renderAddress(vault?.owner || reservation?.owner)}
                            </Flex>
                        )}

                        {/* Input Section */}
                        <Flex flex={1} direction='column'>
                            <Flex
                                h='50px'
                                w='300px'
                                bg={reservation ? colors.currencyCard.btc.background : selectedInputAsset.dark_bg_color}
                                border='2px solid'
                                borderColor={reservation ? colors.currencyCard.btc.border : selectedInputAsset.bg_color}
                                borderRadius={'14px'}
                                pl='15px'
                                pr='10px'
                                align={'center'}>
                                {reservation
                                    ? renderAmount(
                                          formatUnits(reservation.totalSatsInputInlcudingProxyFee.toString(), BITCOIN_DECIMALS),
                                          isLoading,
                                          vault?.btcExchangeRate && calculateBtcOutputAmountFromExchangeRate(vault.initialBalance, vault.depositAsset?.decimals, vault.btcExchangeRate),
                                      )
                                    : renderAmount(vault.initialBalance && formatUnits(BigNumber.from(vault.initialBalance).toString(), vault.depositAsset?.decimals).toString(), false, undefined)}
                                <Spacer />
                                <AssetTag assetName={reservation ? 'BTC' : vault.depositAsset?.name == 'USDT' ? 'ARBITRUM_USDT' : vault.depositAsset?.name} width={reservation ? '80px' : '100px'} />
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
                                w='300px'
                                bg={reservation ? colors.currencyCard.usdt.background : colors.currencyCard.btc.background}
                                border='2px solid'
                                borderColor={reservation ? colors.currencyCard.usdt.border : colors.currencyCard.btc.border}
                                borderRadius={'14px'}
                                pl='15px'
                                pr='10px'
                                align={'center'}>
                                {reservation
                                    ? renderAmount(
                                          reservation ? formatUnits(calculateOriginalAmountBeforeFee(reservation?.totalSwapOutputAmount), selectedInputAsset.decimals) : '...',
                                          isLoading,
                                          undefined,
                                      )
                                    : renderAmount(
                                          btcInputSwapAmount,
                                          isLoading,
                                          vault?.btcExchangeRate && calculateBtcOutputAmountFromExchangeRate(vault.initialBalance, vault.depositAsset?.decimals, vault.btcExchangeRate),
                                      )}
                                <Spacer />
                                <AssetTag assetName={reservation ? 'ARBITRUM_USDT' : 'BTC'} width={reservation ? '100px' : '80px'} />
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
                                {/* status text */}
                                <Text
                                    fontSize={'14px'}
                                    fontFamily={FONT_FAMILIES.AUX_MONO}
                                    color={
                                        isReservationExpired
                                            ? colors.darkerGray
                                            : ReservationState[reservation.stateOffChain || reservation.state] === 'Completed'
                                            ? colors.greenOutline
                                            : colors.offWhite
                                    }>
                                    {isReservationExpired ? 'Expired' : ReservationState[reservation.stateOffChain || reservation.state]}
                                </Text>
                                {/* dot indicating status color */}
                                <Flex
                                    h='10px'
                                    w='10px'
                                    borderRadius='10px'
                                    bg={
                                        isReservationExpired
                                            ? colors.darkerGray
                                            : ReservationState[reservation.stateOffChain || reservation.state] === 'Created'
                                            ? colors.RiftOrange
                                            : ReservationState[reservation.stateOffChain || reservation.state] === 'Completed'
                                            ? colors.greenOutline
                                            : ReservationState[reservation.stateOffChain || reservation.state] === 'Unlocked'
                                            ? colors.purpleBackground
                                            : colors.borderGray
                                    }
                                />
                            </Flex>
                        )}
                    </Flex>

                    {/* settings tooltip */}
                    {!isActivityPage && <SettingsWithTooltip />}
                </Flex>

                {isActivityPage && (
                    <Flex w='100%'>
                        <Flex w='100%' flexDirection='row' gap='1px' mt='16px' fontSize='12px' fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {vault && (
                                <>
                                    {renderDetailRow('D-', vault.index)}
                                    {renderDetailRow(
                                        'Deposit Timestamp',
                                        new Date(BigNumber.from(vault.depositTimestamp).toNumber() * 1000).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
                                    )}
                                    {renderDetailRow('Initial Balance', formatUnits(vault.initialBalance, vault.depositAsset?.decimals))}
                                    {renderDetailRow('BTC Exchange Rate', formatBtcExchangeRate(vault.btcExchangeRate, vault.depositAsset?.decimals))}
                                </>
                            )}
                            {reservation && (
                                <>
                                    {renderDetailRow('R-', reservation.indexInContract)}
                                    {renderDetailRow(
                                        'Reservation Timestamp',
                                        new Date(BigNumber.from(reservation.reservationTimestamp).toNumber() * 1000).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
                                    )}
                                    {renderDetailRow('Total Sats Input', formatUnits(reservation.totalSatsInputInlcudingProxyFee, BITCOIN_DECIMALS))}
                                    {renderDetailRow('Total Swap Output', formatUnits(reservation.totalSwapOutputAmount, selectedInputAsset.decimals))}
                                    {renderDetailRow('State onchain', ReservationState[reservation.stateOffChain || reservation.state])}
                                    {renderArrayDetailRow('Reserved Vaults', reservation.vaultIndexes, (index) => `D-${index}`)}
                                    {renderArrayDetailRow(
                                        'Reserved Amounts',
                                        reservation.amountsToReserve,
                                        (amount) => `${formatUnits(amount, selectedInputAsset.decimals)} ${selectedInputAsset.name}`,
                                    )}
                                </>
                            )}
                        </Flex>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
};

export default SwapPreviewCard;
