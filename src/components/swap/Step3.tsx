import React, { useEffect, useState } from 'react';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { colors } from '../../utils/colors';
import { ChromeLogoSVG, WarningSVG } from '../other/SVGs';
import { FONT_FAMILIES } from '../../utils/font';
import QRCode from 'qrcode.react';
import { useStore } from '../../store';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { bitcoinDecimals } from '../../utils/constants';
import { CheckmarkCircle } from 'react-ionicons';

declare global {
    interface Window {
        rift?: any; // You can replace 'any' with a more specific type if you know the structure of the rift object
    }
}

export const Step3 = () => {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalSwapAmountInSats, setTotalSwapAmountInSats] = useState(0);
    const [bitcoinUri, setBitcoinUri] = useState(null);
    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);
    const bitcoinSwapTransactionHash = useStore((state) => state.bitcoinSwapTransactionHash);

    return (
        <>
            <Flex
                bg={colors.offBlack}
                w='100%'
                mt='20px'
                borderRadius='30px'
                px='20px'
                direction='column'
                py='35px'
                align='center'
                borderWidth={3}
                borderColor={colors.borderGray}>
                <Text fontSize='25px' fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.textGray} mb='20px'>
                    Bitcoin Transaction Confirmed!
                </Text>
                <Text fontSize='17px' fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.textGray} mb='20px'>
                    Output TXID - {bitcoinSwapTransactionHash}
                </Text>
                <Flex mt='-10px' ml='4px'>
                    <CheckmarkCircle width='100px' height={'50px'} color={colors.greenOutline} />
                </Flex>
                <Text
                    fontSize='12px'
                    maxW={'800px'}
                    fontWeight={'normal'}
                    color={colors.textGray}
                    fontFamily={FONT_FAMILIES.AUX_MONO}
                    textAlign='center'
                    mt='20px'
                    flex='1'>
                    A hypernode will now automatically generate a transaction proof and your requested funds will be
                    released to your ETH address upon 6 block confirmations. You can safely close this tab.
                </Text>
            </Flex>
        </>
    );
};
