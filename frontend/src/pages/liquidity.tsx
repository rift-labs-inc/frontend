import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { Flex, Spacer } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';
import colors from '../styles/colors';
import { OpenGraph } from '../components/background/OpenGraph';

const Liquidity = () => {
    const { height, width } = useWindowSize();
    const isSmallScreen = width < 1200;
    const router = useRouter();
    const handleNavigation = (route: string) => {
        router.push(route);
    };

    return (
        <>
            <OpenGraph title='Liquidity' />
            <Flex
                h='100vh'
                width='100%'
                direction='column'
                alignItems='center'
                justifyContent='flex-start'
                backgroundImage={'/images/rift_background.png'}
                backgroundSize='cover'
                backgroundPosition='center'>
                <Navbar />
                <Spacer />
            </Flex>
        </>
    );
};

export default Liquidity;
