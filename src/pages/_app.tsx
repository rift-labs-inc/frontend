import { ChakraProvider, Flex, Text } from '@chakra-ui/react';
import theme from '../theme';
import Head from 'next/head';
import { useEffect } from 'react';
import { useStore } from '../store';
import { AppProps } from 'next/app';
import '../styles/custom-fonts.css';
import testData from '../testData.json';
import assets from '../assets.json';
import { MdClose } from 'react-icons/md';
import colors from '../styles/colors';
import toast, { ToastBar, Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
    const setActivityData = useStore((state) => state.setActivityData);
    const setLiquidityData = useStore((state) => state.setLiquidityData);
    const setAvailableAssets = useStore((state) => state.setAvailableAssets);

    useEffect(() => {
        // TODO: populate all real data from smart contracts
        setActivityData(testData.activity);
        setLiquidityData(testData.liquidity);
        setAvailableAssets(assets.avalible_assets);
    }, [setActivityData, setLiquidityData, setAvailableAssets]);

    return (
        <ChakraProvider theme={theme}>
            {/* <title>Rift Hyperbridge - </title> */}
            <Component {...pageProps} />
            <Toaster
                toastOptions={{
                    position: 'bottom-center',
                    style: {
                        borderRadius: '5px',
                        background: '#333',
                        color: '#fff',
                        minWidth: '300px',
                        maxWidth: '500px',
                        transition: '0.2s all ease-in-out',
                        minHeight: '50px',
                        zIndex: 2,
                    },
                    success: {
                        style: {
                            // backgroundColor: '#2ECC40',
                            background: 'linear-gradient(155deg, rgba(23,139,11,1) 0%, rgba(33,150,34,1) 42%, rgba(46,204,64,1) 100%)',
                        },
                        iconTheme: {
                            primary: '#2ECC40',
                            secondary: colors.offWhite,
                        },
                        duration: 2000,
                    },
                    loading: {
                        style: {
                            background: 'linear-gradient(155deg, rgba(20,41,77,1) 0%, rgba(45,102,196,1) 42%, rgba(48,123,244,1) 100%)',
                        },
                    },
                    error: {
                        style: {
                            background: 'linear-gradient(155deg, rgba(140,29,30,1) 0%, rgba(163,23,24,1) 42%, rgba(219,0,2,1) 100%)',
                        },
                        duration: 4000,
                    },
                }}>
                {(t) => (
                    <ToastBar toast={t}>
                        {({ icon, message }) => {
                            const messages = (message as any).props.children.split(';;');
                            const title = messages[0];
                            const description = messages.length > 1 ? messages[1] : null;
                            return (
                                <>
                                    <Flex
                                        fontFamily={'Aux'}
                                        h='100%'
                                        // pt='5px'
                                    >
                                        {icon}
                                    </Flex>
                                    <Flex
                                        // bg='black'
                                        flex={1}
                                        pl='10px'
                                        pr='10px'
                                        flexDir='column'>
                                        <Text fontFamily={'Aux'} fontWeight='600'>
                                            {title}
                                        </Text>
                                        {description && description != 'undefined' && <Text fontFamily={'Aux'}>{description}</Text>}
                                    </Flex>
                                    {t.type !== 'loading' && (
                                        <Flex
                                            p='3px'
                                            cursor='pointer'
                                            onClick={() => toast.dismiss(t.id)}
                                            color={colors.offWhite}
                                            transition='0.2s color ease-in-out'
                                            _hover={{
                                                color: colors.textGray,
                                            }}>
                                            <MdClose />
                                        </Flex>
                                    )}
                                </>
                            );
                        }}
                    </ToastBar>
                )}
            </Toaster>
        </ChakraProvider>
    );
}

export default MyApp;
