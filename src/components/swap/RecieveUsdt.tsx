import React, { useEffect, useState } from 'react';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { colors } from '../../utils/colors';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { LuCopy } from 'react-icons/lu';
import { FONT_FAMILIES } from '../../utils/font';
import { useStore } from '../../store';

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
    const [confirmations, setConfirmations] = useState(null);
    const [blocksNeeded, setBlocksNeeded] = useState(6); // 6 confirmations needed

    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);
    const bitcoinSwapTransactionHash = useStore((state) => state.bitcoinSwapTransactionHash);

    useEffect(() => {
        const fetchConfirmations = async () => {
            try {
                // Fetch transaction details from mempool.space
                const txResponse = await fetch(`https://mempool.space/api/tx/${bitcoinSwapTransactionHash}`);
                const txData = await txResponse.json();

                if (!txData.status.confirmed) {
                    setConfirmations(0);
                    setBlocksNeeded(6);
                } else {
                    // Fetch latest block height
                    const blockHeightResponse = await fetch('https://mempool.space/api/blocks/tip/height');
                    const latestBlockHeight = await blockHeightResponse.json();

                    const transactionBlockHeight = txData.status.block_height;
                    const currentConfirmations = latestBlockHeight - transactionBlockHeight + 1;

                    setConfirmations(currentConfirmations);
                    setBlocksNeeded(Math.max(0, 6 - currentConfirmations));
                }
            } catch (error) {
                console.error('Error fetching transaction confirmations:', error);
                setError('Could not fetch confirmation data.');
            }
        };

        if (bitcoinSwapTransactionHash) {
            fetchConfirmations();
            const interval = setInterval(fetchConfirmations, 10000);
            return () => clearInterval(interval);
        }
    }, [bitcoinSwapTransactionHash]);

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
                mt='10px'
                flex='1'
                letterSpacing={'-1.2px'}>
                A hypernode will now automatically generate a proof of your transaction, and your requested USDT will be released upon 6 block confirmations. You can safely leave
                this tab or return to see swap status.
            </Text>
            {/* Display confirmations */}
            {confirmations !== null ? (
                <>
                    <Flex mt='32px' align={'flex-start'}>
                        <Text textAlign={'center'} fontSize='14px' fontFamily={FONT_FAMILIES.AUX_MONO} color={confirmations >= 6 ? colors.greenOutline : colors.textGray}>
                            Total Block Confirmations:
                        </Text>
                        <Text
                            ml='8px'
                            textAlign={'center'}
                            fontSize='14px'
                            fontFamily={FONT_FAMILIES.AUX_MONO}
                            color={confirmations >= 6 ? colors.greenOutline : colors.RiftOrange}>
                            {confirmations}/6
                        </Text>
                    </Flex>
                </>
            ) : (
                <Spinner color={colors.greenOutline} mt='20px' />
            )}
            <Flex mt='10px'>
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
                    _hover={{
                        textDecoration: 'underline',
                    }}>
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
