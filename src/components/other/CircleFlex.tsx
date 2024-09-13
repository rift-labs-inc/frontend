import React from 'react';
import { Flex } from '@chakra-ui/react';
import { CheckSVG } from './SVGs';
import { colors } from '../../utils/colors';

type CircleState = 'not-started' | 'current' | 'completed';

interface CircleFlexProps {
    state: CircleState;
}

const CircleFlex: React.FC<CircleFlexProps> = ({ state }) => {
    switch (state) {
        case 'not-started':
            return <Flex zIndex={2} borderRadius='full' w='30px' h='30px' borderColor='#333' borderWidth='6px' bg='#222' />;
        case 'current':
            return <Flex zIndex={2} borderRadius='full' w='30px' h='30px' bg='#9C5B1F' borderWidth='6px' borderColor={colors.RiftOrange} />;
        case 'completed':
            return <CheckSVG width='30px' />;
        default:
            return null;
    }
};

export default CircleFlex;
