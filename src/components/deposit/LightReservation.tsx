// LightReservation.tsx
import { Flex, Spacer, Text } from '@chakra-ui/react';
import { SwapReservation, ValidAsset } from '../../types';
import { BigNumber } from 'ethers';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { AssetTag } from '../other/AssetTag';
import { formatUnits } from 'ethers/lib/utils';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';

interface LightReservationProps {
    reservation: SwapReservation;
    onClick?: () => void;
    selectedInputAsset: ValidAsset;
}

const LightReservation: React.FC<LightReservationProps> = ({ reservation, onClick, selectedInputAsset }) => {
    // Calculate the total input amount by summing up the amounts to reserve
    const totalInputAmount: BigNumber = reservation.amountsToReserve.reduce((accumulator: BigNumber, currentValue: BigNumber) => accumulator.add(currentValue), BigNumber.from(0));

    // Format the input amount using the asset's decimals
    const inputAmountFormatted = formatUnits(totalInputAmount, selectedInputAsset.decimals);

    // Format the output amount (assuming totalSwapOutputAmount is in Satoshis)
    const outputAmountFormatted = formatUnits(reservation.totalSwapOutputAmount, 8); // 8 decimals for BTC

    return (
        <Flex
            _hover={{
                bg: colors.purpleBackground,
                borderColor: colors.purpleBorder,
            }}
            onClick={onClick}
            cursor={'pointer'}
            letterSpacing={'-2px'}
            bg={colors.offBlackLighter}
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
            borderColor={colors.borderGrayLight}
            gap='12px'>
            <Text width='48px'>#{reservation.nonce}</Text>
            <Flex flex={1} align='center' gap='12px'>
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
                            {inputAmountFormatted}
                        </Text>
                        <Spacer />
                        <AssetTag assetName={selectedInputAsset.name} width='84px' />
                    </Flex>
                </Flex>
                <Flex mt='0px' fontSize='20px' opacity={0.9}>
                    <FaRegArrowAltCircleRight color={colors.RiftOrange} />
                </Flex>
                <Flex flex={1} direction='column'>
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
                            {outputAmountFormatted}
                        </Text>
                        <Spacer />
                        <AssetTag assetName={'BTC'} width='80px' />
                    </Flex>
                </Flex>
            </Flex>
            <Flex width='120px' align='center' justify='flex-end' gap='12px'>
                <Text color={colors.textGray}>{reservation.state}</Text>
            </Flex>
            <Flex w='30px' justify='flex-end'>
                <IoMdSettings size={'18px'} color={colors.offWhite} />
            </Flex>
        </Flex>
    );
};

export default LightReservation;
