import { Box, Button, Flex, FlexProps, Spacer, Text } from '@chakra-ui/react';
import colors from '../styles/colors';
import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { IoMenu } from 'react-icons/io5';

export const Navbar = ({}) => {
    const { height, width } = useWindowSize();
    const isMobileView = width < 600;
    const router = useRouter();
    const fontSize = isMobileView ? '20px' : '20px';

    const handleNavigation = (route: string) => {
        router.push(route);
    };

    const navItem = (text: string, route: string) => {
        return (
            <Flex
                _hover={{ background: 'rgba(150, 150, 150, 0.2)' }}
                cursor='pointer'
                borderRadius='6px'
                mr='15px'
                onClick={() => handleNavigation(route)}
                px='10px'
                py='2px'
                position='relative'
                alignItems='center'>
                <Text color={router.pathname == route ? colors.offWhite : '#ccc'} fontSize='18px' fontFamily='Nostromo'>
                    {text}
                </Text>
                {router.pathname === route && (
                    <Flex
                        position={'absolute'}
                        ml='1px'
                        top='29px'
                        w={
                            router.pathname === '/pools'
                                ? '68px'
                                : router.pathname === '/activity'
                                ? '93px'
                                : router.pathname === '/whitepaper'
                                ? '134px'
                                : '57px'
                        }
                        height='2px'
                        bgGradient={`linear(90deg, #394AFF, #FF8F28)`}></Flex>
                )}
            </Flex>
        );
    };

    return (
        <Flex width='100%' direction={'column'} position='fixed' top={0} left={0} right={0} zIndex={1000}>
            <Flex direction='row' w='100%' px={'30px'} pt='25px'>
                {navItem('Swap', '/')}
                {navItem('Lending', '/lending')}
                {navItem('OTC', '/otc')}
                {navItem('Activity', '/activity')}
                {navItem('About', '/about')}
                <Spacer />
                <Flex>{/* CONNECT WALLET BUTTON */}</Flex>
            </Flex>
        </Flex>
    );
};
