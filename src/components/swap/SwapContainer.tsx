import { Flex } from '@chakra-ui/react';
import useWindowSize from '../../hooks/useWindowSize';
import { useStore } from '../../store';
import { DepositUI } from './DepositUI';
import { SwapUI } from './SwapUI';
import { PausedSwapUI } from './PausedSwapUI';
import { GasFeeTooHigh } from './GasFeeToHigh';

export const SwapContainer = ({}) => {
    const { isMobile } = useWindowSize();
    const depositMode = useStore((state) => state.depositMode);
    const areNewDepositsPaused = useStore((state) => state.areNewDepositsPaused);
    const setIsGasFeeTooHigh = useStore((state) => state.setIsGasFeeTooHigh);
    const isGasFeeTooHigh = useStore((state) => state.isGasFeeTooHigh);

    return (
        <Flex align={'center'} justify={'center'} w='100%' maxW='600px' mt='30px' px='20px' direction={'column'} overflow={'visible'}>
            {/* Content */}
            {areNewDepositsPaused ? (
                <PausedSwapUI />
            ) : isGasFeeTooHigh ? (
                <GasFeeTooHigh />
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
