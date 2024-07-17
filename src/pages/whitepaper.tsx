import useWindowSize from '../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { Flex, Spacer } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';
import { colors } from '../utils/colors';
import { OpenGraph } from '../components/background/OpenGraph';

const Whitepaper = () => {
    const { height, width } = useWindowSize();
    const isSmallScreen = width < 1200;
    const router = useRouter();
    const handleNavigation = (route: string) => {
        router.push(route);
    };

    return (
        <>
            <OpenGraph title='Whitepaper' />
            <Flex
                h='100vh'
                width='100%'
                direction='column'
                alignItems='center'
                justifyContent='flex-start'
                backgroundImage={'/images/rift_background_op.webp'}
                backgroundSize='cover'
                backgroundPosition='center'>
                <Navbar />
                <Spacer />
            </Flex>
        </>
    );
};

export default Whitepaper;
