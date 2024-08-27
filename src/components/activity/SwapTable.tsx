import {
    Box,
    Flex,
    Input,
    Table,
    TableCaption,
    TableContainer,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
    TableColumnHeaderProps,
    TableCellProps,
    Image,
    InputGroup,
    InputRightElement,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FONT_FAMILIES } from '../../utils/font';
import { formatAddress } from '../../utils/format';
import { BTC_Tag, ETH_Logo, USDT_Icon, USDT_Tag, WETH_Tag } from '../other/SVGs';
import { FaSearch } from 'react-icons/fa';

const borderColor = '#282828';

type SwapTableItem = {
    timestamp: string;
    from: string;
    to: string;
    txnHash: string;
    lpFee: number;
    amount: number;
    asset: 'eth' | 'btc' | 'usdt';
    status: 'swapping' | 'completed';
};

interface SwapTableProps {}

const SwapTable: React.FC<SwapTableProps> = () => {
    const [search, setSearch] = useState('');

    const data: SwapTableItem[] = [
        {
            timestamp: '8/24/2024',
            from: '0x851bD72efd4FBa497dB5a9865D777BdC420A13E1',
            to: '0xf4e56607fA639AbB1b387E24aa4C0aA1e1A90f7d',
            txnHash: '0x7EA671fE37BE91Fd959F64a2Ffc78B9B1b974173',
            lpFee: 0.5,
            amount: 10.007478882,
            asset: 'eth',
            status: 'swapping',
        },
        {
            timestamp: '8/22/2024',
            from: '0x17131876641C9B988e25B3053d22f616552FFB80',
            to: '0xEDa05E33d5cF0927a53F1De3B24A76C6917DDF2F',
            txnHash: '0x3A9169aA5A9A1573085825E6CEffC86116A9F4ff',
            lpFee: 1.205,
            amount: 1.27568,
            asset: 'usdt',
            status: 'completed',
        },
    ];

    return (
        <Flex
            bg='rgba(25, 25, 25, 0.8)'
            backdropFilter='blur(10px)'
            border={`2.5px solid ${borderColor}`}
            w='100%'
            borderRadius='16px'
            maxW='1200px'
            p='12px'
            flexDir='column'>
            <Flex w='100%' gap='8px'>
                <InputGroup flex={1}>
                    <Input
                        bg='#2B2B2B'
                        border={`1px solid ${borderColor}`}
                        placeholder='Search by address or txn hash'
                        p='16px'
                        borderRadius='20px'
                        h='36px'
                        fontFamily={FONT_FAMILIES.AUX_MONO}
                        fontSize='0.8rem'
                        color='#D2D2D2'
                    />
                    <InputRightElement
                        pointerEvents='none'
                        cursor={'pointer'}
                        mt='-1.5px'
                        mr='4px'
                        children={<FaSearch color={'#888'} />}
                    />
                </InputGroup>
                <Flex
                    bg='#2B2B2B'
                    borderRadius='20px'
                    h='36px'
                    border={`1px solid ${borderColor}`}
                    align='center'
                    justify='center'
                    p='12px'
                    gap='12px'>
                    <Text fontFamily={FONT_FAMILIES.AUX_MONO} fontSize='0.8rem' color='#D2D2D2' fontWeight='300'>
                        My activity
                    </Text>
                    <Flex w='10px' h='10px' borderRadius='20px' bg='#4C4C4C' />
                </Flex>
            </Flex>
            <Box mt='16px'>
                <TableContainer>
                    <Table variant='simple' size='sm'>
                        <Thead>
                            <Tr>
                                <CTh>Timestamp</CTh>
                                <CTh>From</CTh>
                                <CTh>To</CTh>
                                <CTh>Txn Hash</CTh>
                                <CTh>LP Fee</CTh>
                                <CTh>Amount</CTh>
                                <CTh>Asset</CTh>
                                <CTh>Status</CTh>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {data.map((x, i) => (
                                <Tr>
                                    <CTd>{x.timestamp}</CTd>
                                    <CTd>{formatAddress(x.from)}</CTd>
                                    <CTd>{formatAddress(x.to)}</CTd>
                                    <CTd>{formatAddress(x.txnHash)}</CTd>
                                    <CTd>{x.lpFee}%</CTd>
                                    <CTd>{x.amount}</CTd>
                                    <CTd>
                                        {x.asset == 'usdt' ? (
                                            <Image src='/images/usdt_tag.svg' height='16px' />
                                        ) : x.asset == 'btc' ? (
                                            <Image src='/images/btc_tag.svg' height='16px' />
                                        ) : x.asset == 'eth' ? (
                                            <Image src='/images/ETH.svg' height='16px' />
                                        ) : null}
                                    </CTd>
                                    <CTd>
                                        <Flex align='center' justify='flex-start' gap='8px'>
                                            <Flex
                                                w='12px'
                                                h='12px'
                                                borderRadius='8px'
                                                border='2px solid'
                                                bg={x.status == 'swapping' ? null : '#238739'}
                                                borderColor={x.status == 'swapping' ? '#959595' : '#238739'}
                                            />
                                            <Text
                                                textTransform='capitalize'
                                                fontWeight='300'
                                                color={x.status == 'swapping' ? 'null' : '#238739'}>
                                                {x.status}
                                            </Text>
                                        </Flex>
                                    </CTd>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
        </Flex>
    );
};

const CTh = (props: TableColumnHeaderProps) => (
    <Th
        fontFamily={FONT_FAMILIES.AUX_MONO}
        color='#E1E1E1'
        textTransform='none'
        borderColor='#282828'
        pb='12px'
        {...props}
    />
);

const CTd = (props: TableCellProps) => (
    <Td
        fontFamily={FONT_FAMILIES.AUX_MONO}
        color='#959595'
        textTransform='none'
        borderColor='#282828'
        pb='12px'
        {...props}
    />
);

export default SwapTable;
