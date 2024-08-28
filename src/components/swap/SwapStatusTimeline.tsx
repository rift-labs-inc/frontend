import React from 'react';
import { Flex, Text, Spacer } from '@chakra-ui/react';
import useWindowSize from '../../hooks/useWindowSize';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import CircleFlex from '../other/CircleFlex';

// Define an enum for swap states
enum SwapState {
    ReserveLiquidity = 1,
    SendBitcoin = 2,
    ReceiveEthereum = 3,
    Completed = 4,
}

// Custom hook for managing swap state
const useSwapProcess = () => {
    const [currentState, setCurrentState] = React.useState<SwapState>(SwapState.ReserveLiquidity);

    const moveToNextState = () => {
        setCurrentState((prevState) => Math.min(prevState + 1, SwapState.Completed) as SwapState);
    };

    return { currentState, moveToNextState };
};

// SwapStep component
const SwapStep: React.FC<{ step: SwapState; title: string; currentState: SwapState }> = ({ step, title, currentState }) => {
    const isCompleted = currentState > step;
    const isActive = currentState === step;

    const getColor = () => {
        if (isCompleted || isActive) return colors.greenOutline;
        return colors.textGray;
    };

    return (
        <Flex direction='column'>
            <Text fontFamily={FONT_FAMILIES.AUX_MONO} color={getColor()} letterSpacing={'-2px'}>
                STEP {step}
            </Text>
            <Text fontFamily={FONT_FAMILIES.NOSTROMO} color={getColor()} fontSize={'22px'}>
                {title}
            </Text>
        </Flex>
    );
};

export const SwapStatusTimeline: React.FC = () => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const { currentState, moveToNextState } = useSwapProcess();

    return (
        <Flex
            width='100%'
            bg={'#0D1610'}
            border='3px solid'
            borderColor={'#3D5A44'}
            borderRadius={'25px'}
            h='140px'
            direction='column'
            px={'30px'}
            fontFamily={FONT_FAMILIES.AUX_MONO}
            fontWeight={'normal'}
            py='15px'>
            <Flex w='100%'>
                <SwapStep step={SwapState.ReserveLiquidity} title='RESERVE LIQUIDITY' currentState={currentState} />
                <Spacer />
                <SwapStep step={SwapState.SendBitcoin} title='SEND BITCOIN' currentState={currentState} />
                <Spacer />
                <SwapStep step={SwapState.ReceiveEthereum} title='RECEIVE ETHEREUM' currentState={currentState} />
            </Flex>
            <Flex mt='10px'>
                <Flex zIndex={2} mt='-8px'>
                    <CircleFlex state='completed' />
                </Flex>
                <Flex mt='10px' h='10px' w='37.7%' mx='-5px' bg={colors.greenBackground}></Flex>
                <CircleFlex state='not-started' />
                <Flex mt='10px' h='10px' w='30.2%' mx='-5px' bg={colors.offBlackLighter2}></Flex>
                <CircleFlex state='not-started' />
                <Flex mt='10px' h='10px' w='25%' mx='-5px' bg={colors.offBlackLighter2}></Flex>
            </Flex>
        </Flex>
    );
};
