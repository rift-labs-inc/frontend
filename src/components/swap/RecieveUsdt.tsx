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
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { LuCopy } from 'react-icons/lu';

declare global {
    interface Window {
        rift?: any; // You can replace 'any' with a more specific type if you know the structure of the rift object
    }
}

export const RecieveUsdt = () => {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalSwapAmountInSats, setTotalSwapAmountInSats] = useState(0);
    const [bitcoinUri, setBitcoinUri] = useState(null);
    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);
    const bitcoinSwapTransactionHash = useStore((state) => state.bitcoinSwapTransactionHash);

    return (
        <>
            <Flex mt='-10px' ml='4px'>
                <IoIosCheckmarkCircle size={45} color={colors.greenOutline} />
            </Flex>
            <Text textAlign={'center'} mt='12px' fontSize='25px' fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.greenOutline} mb='20px'>
                Bitcoin Transaction Detected!
            </Text>
            <Text
                fontSize='14px'
                maxW={'900px'}
                fontWeight={'normal'}
                color={colors.textGray}
                fontFamily={FONT_FAMILIES.AUX_MONO}
                textAlign='center'
                mt='15px'
                flex='1'
                letterSpacing={'-1.2px'}>
                A hypernode will now automatically generate a proof of your transaction, and your requested USDT will be released upon 6 block confirmations. You can safely close
                this tab.
            </Text>
            <Flex mt='32px'>
                <Text fontSize='14px' mr='10px' fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.textGray}>
                    TXN Hash:{' '}
                </Text>
                <Text
                    as='a'
                    href={`https://mempool.space/tx/${bitcoinSwapTransactionHash}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    fontSize='14px'
                    fontFamily={FONT_FAMILIES.AUX_MONO}
                    color={colors.offWhite}
                    style={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                    }}
                    textDecoration={'underline'}>
                    {bitcoinSwapTransactionHash}
                </Text>
                <LuCopy
                    color='gray'
                    size={20}
                    style={{
                        cursor: 'pointer',
                        marginLeft: '10px',
                    }}
                    onClick={() => navigator.clipboard.writeText(bitcoinSwapTransactionHash)}
                />
            </Flex>
        </>
    );
};
