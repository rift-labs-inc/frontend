import { Flex, Spacer, Text } from '@chakra-ui/react';
import { ReservationState, SwapReservation, ValidAsset } from '../../types';
import { BigNumber } from 'ethers';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { AssetTag } from '../other/AssetTag';
import { formatUnits } from 'ethers/lib/utils';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import { useStore } from '../../store';
import { useEffect, useState } from 'react';
import { fetchReservationDetails } from '../../utils/dappHelper';

interface LightReservationProps {
    reservation: SwapReservation;
    url: string;
    onClick?: () => void;
}

const LightReservation: React.FC<LightReservationProps> = ({ reservation, url, onClick }) => {
    const [btcInputSwapAmount, setBtcInputSwapAmount] = useState<string>('-1');
    const [usdtOutputSwapAmount, setUsdtOutputSwapAmount] = useState<string>('-1');
    const ethersRpcProvider = useStore((state) => state.ethersRpcProvider);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);

    useEffect(() => {
        const fetchData = async () => {
            console.log('usdtOutputSwapAmount', usdtOutputSwapAmount);
            console.log('btcInputSwapAmount', btcInputSwapAmount);
            const reservationDetails = await fetchReservationDetails(url, ethersRpcProvider, selectedInputAsset);
            console.log('reservationDetails', reservationDetails);
            setBtcInputSwapAmount(reservationDetails.btcInputSwapAmount);
            setUsdtOutputSwapAmount(reservationDetails.totalReservedAmountInUsdt);
        };

        fetchData();
    }, [usdtOutputSwapAmount]);

    return (
        <Flex
            _hover={{
                bg: colors.purpleBackground,
                borderColor: colors.purpleBorder,
            }}
            onClick={onClick}
            cursor={'pointer'}
            letterSpacing={'-2px'}
            bg={colors.offBlack}
            w='calc(100% - 4px)'
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
            <Text width='48px' fontSize={'14px'}>
                r-{reservation.indexInContract}
            </Text>
            <Flex flex={1} w='100%' align='center' gap='12px'>
                <Flex flex={1} w='100%' direction='column'>
                    <Flex
                        h='50px'
                        w='100%'
                        bg={colors.currencyCard.btc.background}
                        border='2px solid'
                        borderColor={colors.currencyCard.btc.border}
                        borderRadius={'14px'}
                        pl='15px'
                        pr='10px'
                        align={'center'}>
                        <Text fontSize='16px' color={colors.offWhite} letterSpacing={'-1px'} fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {btcInputSwapAmount !== '-1' ? btcInputSwapAmount : 'Loading...'}
                        </Text>
                        <Spacer />
                        <AssetTag assetName={'BTC'} width='80px' />
                    </Flex>
                </Flex>
                <Flex mt='0px' fontSize='20px' opacity={0.9}>
                    <FaRegArrowAltCircleRight color={selectedInputAsset.border_color} />
                </Flex>
                <Flex flex={1} direction='column'>
                    <Flex
                        h='50px'
                        w='100%'
                        bg={selectedInputAsset.dark_bg_color}
                        border='2px solid'
                        borderColor={selectedInputAsset.bg_color}
                        borderRadius={'14px'}
                        pl='15px'
                        pr='10px'
                        align={'center'}>
                        <Text fontSize='16px' color={colors.offWhite} letterSpacing={'-1px'} fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {usdtOutputSwapAmount !== '-1' ? usdtOutputSwapAmount : 'Loading...'}
                        </Text>
                        <Spacer />
                        <AssetTag assetName={selectedInputAsset.name} width='84px' />
                    </Flex>
                </Flex>
            </Flex>
            <Flex width='120px' justify='flex-end' gap='12px'>
                <Text color={ReservationState[reservation.state] === 'Completed' ? colors.greenOutline : colors.textGray}>{ReservationState[reservation.state]}</Text>
            </Flex>
            <Flex w='30px' justify='flex-end'>
                <IoMdSettings size={'18px'} color={colors.offWhite} />
            </Flex>
        </Flex>
    );
};

export default LightReservation;
