import { Flex } from '@chakra-ui/react';
import useWindowSize from '../../hooks/useWindowSize';
import { useStore } from '../../store';
import { DepositUI } from './DepositUI';
import { SwapUI } from './SwapUI';
import { PausedSwapUI } from './PausedSwapUI';

export const SwapContainer = ({}) => {
    const { isMobile } = useWindowSize();
    const depositMode = useStore((state) => state.depositMode);
    const areNewDepositsPaused = useStore((state) => state.areNewDepositsPaused);
    return (
        <Flex align={'center'} justify={'center'} w='100%' maxW='600px' mt='30px' px='20px' direction={'column'} overflow={'visible'}>
            {/* Content */}
            {areNewDepositsPaused ? (
                <PausedSwapUI />
            ) : depositMode ? (
                // DEPOSIT UI
                <DepositUI />
            ) : (
                // SWAP UI
                <SwapUI />
            )}
        </Flex>
    );
};
