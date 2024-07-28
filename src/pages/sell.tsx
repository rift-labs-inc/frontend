import { Flex, Image, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { OpenGraph } from '../components/background/OpenGraph';
import HorizontalButtonSelector from '../components/HorizontalButtonSelector';
import OrangeText from '../components/OrangeText';
import WhiteText from '../components/WhiteText';
import { DepositUI } from '../components/DepositUI';
import { Navbar } from '../components/Navbar';
import { toastSuccess } from '../hooks/toast';
import useWindowSize from '../hooks/useWindowSize';
import { colors } from '../utils/colors';
import { FONT_FAMILIES } from '../utils/font';
import useHorizontalSelectorInput from '../hooks/useHorizontalSelectorInput';
import { useEffect, useState } from 'react';
import { getDepositVaults, getLiquidityProvider } from '../utils/dataAggregation';
import riftExchangeABI from '../abis/RiftExchange.json';
import { ethers } from 'ethers';
import { useStore } from '../store';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { contractChainID, riftExchangeContractAddress, weiToEth, satsToBtc } from '../utils/dappHelper';
import { DepositVault } from '../types';

const Sell = () => {
    const { height, width } = useWindowSize();
    const isSmallScreen = width < 1200;
    const router = useRouter();
    const handleNavigation = (route: string) => {
        router.push(route);
    };
    const { options, selected, setSelected } = useHorizontalSelectorInput(['Create a Vault', 'Manage Vaults'] as const);
    const allUserDepositVaults = useStore((state) => state.allUserDepositVaults);

    const ethersProvider = useStore((state) => state.ethersProvider);
    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [myDepositVaults, setMyDepositVaults] = useState<DepositVault[]>([]);

    useEffect(() => {
        if (isConnected && Array.isArray(allUserDepositVaults) && address) {
            getLiquidityProvider(ethersProvider, riftExchangeABI.abi, riftExchangeContractAddress, address)
                .then((result) => {
                    const stringIndexes = result.depositVaultIndexes.map((index) => index.toString());
                    const filteredVaults = allUserDepositVaults
                        .filter((vault, index) => stringIndexes.includes(index.toString()))
                        .map((vault, index) => {
                            if (stringIndexes.includes(index.toString())) {
                                return { ...vault, index: index };
                            }
                            return vault;
                        });

                    console.log('All User Deposit Vaults:', allUserDepositVaults);
                    console.log('My Deposit Vaults:', filteredVaults);
                    setMyDepositVaults(filteredVaults);
                })
                .catch((error) => {
                    console.error('Failed to fetch deposit vault indexes:', error);
                });
        }
    }, [isConnected, allUserDepositVaults, address, ethersProvider]);

    return (
        <>
            <OpenGraph title='Liquidity' />
            <Flex
                h='100vh'
                width='100%'
                direction='column'
                backgroundImage={'/images/rift_background_op.webp'}
                backgroundSize='cover'
                backgroundPosition='center'>
                <Navbar />
                <Flex direction={'column'} align='center' w='100%' h='100%' mt='105px'>
                    {/* LOGOS & TEXT */}
                    <Flex direction={'column'} align='center' w='100%'>
                        <Flex
                            sx={{
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                            }}
                            bgGradient={`linear(-90deg, #394AFF, #FF8F28)`}
                            letterSpacing={'2px'}
                            mt='-25px'>
                            <Text userSelect={'none'} fontSize='60px' fontFamily={'Klein'} fontWeight='bold' px='12px' as='h1'>
                                Sell Ethereum
                            </Text>
                        </Flex>
                    </Flex>
                    {/* Horizontal Button Selector */}
                    <Flex mt={'14px'}>
                        <HorizontalButtonSelector options={options} onSelectItem={setSelected} />
                    </Flex>
                    <Flex
                        w='1300px'
                        bg={colors.offBlack}
                        h='650px'
                        borderRadius={'20px'}
                        mt='14px'
                        border='3px solid'
                        borderColor={colors.borderGray}>
                        <Flex w='50%' h='100%' flexDir='column' p='20px'>
                            {/* Liquidity Distribution Chart */}
                            <Text fontFamily={FONT_FAMILIES.AUX_MONO} color={colors.textGray} fontSize='0.8rem'>
                                Total Liquidity
                            </Text>
                            <Flex gap='8px' align='center'>
                                <Image src='/images/icons/Ethereum.svg' h='26px' />
                                <Text
                                    fontFamily={FONT_FAMILIES.AUX_MONO}
                                    fontSize='50px'
                                    letterSpacing='-8px'
                                    fontWeight='normal'>
                                    323,249.00
                                </Text>
                            </Flex>
                            <Flex flex={1} w='100%'>
                                <ExchangeRateChart />
                            </Flex>
                        </Flex>
                        <Flex
                            w='50%'
                            h='100%'
                            px='30px'
                            py='28px'
                            flexDir={'column'}
                            userSelect={'none'}
                            fontSize={'12px'}
                            fontFamily={FONT_FAMILIES.AUX_MONO}
                            color={'#c3c3c3'}
                            fontWeight={'normal'}
                            gap={'0px'}>
                            {/* Create a Vault */}
                            {selected == 'Create a Vault' ? (
                                <>
                                    <Text fontSize={'12px'} letterSpacing={'-1px'} textAlign={'center'}>
                                        Create a sell order by setting your <WhiteText>Exchange Rate</WhiteText>. Get payed out in
                                        <OrangeText> BTC</OrangeText> when your order is filled. Withdraw unreserved liquidity
                                        anytime.
                                    </Text>
                                    <DepositUI />
                                </>
                            ) : (
                                // MANAGE VAULTS
                                <>
                                    <Text fontSize={'12px'} letterSpacing={'-1px'} mb='15px' textAlign={'center'}>
                                        Manage your <WhiteText>Vault</WhiteText> by setting your{' '}
                                        <WhiteText>Exchange Rate</WhiteText> and
                                        <OrangeText> Reserve Ratio</OrangeText>. Withdraw unreserved liquidity anytime.
                                    </Text>
                                    {myDepositVaults ? (
                                        myDepositVaults.map((vault: DepositVault, index: number) => (
                                            <Flex
                                                bg={colors.offBlack}
                                                w='100%'
                                                h='50px'
                                                py='10px'
                                                mb='10px'
                                                px='15px'
                                                key={vault.index}
                                                align='center'
                                                justify='space-between'
                                                borderRadius={'10px'}
                                                border='2px solid '
                                                borderColor={colors.borderGray}>
                                                <Text fontWeight='bold'>{vault.index}</Text>
                                                <Text fontWeight='bold'>{weiToEth(vault.initialBalance)} ETH</Text>
                                                {/* <Text>{vault.unreservedBalance.toString()} ETH</Text> */}
                                                <Text>1 BTC ≈ {(1 / satsToBtc(vault.btcExchangeRate)).toFixed(8)} ETH</Text>
                                                <Text isTruncated maxWidth='200px'>
                                                    {vault.btcPayoutLockingScript.substring(0, 20)}
                                                </Text>
                                            </Flex>
                                        ))
                                    ) : (
                                        <Text>No deposit vaults found</Text>
                                    )}
                                </>
                            )}
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default Sell;
