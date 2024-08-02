import React from 'react';
import { Flex } from '@chakra-ui/react';
import { CheckSVG } from './SVGs';

type CircleState = 'not-started' | 'current' | 'completed';

interface CircleFlexProps {
    state: CircleState;
}

const CircleFlex: React.FC<CircleFlexProps> = ({ state }) => {
    switch (state) {
        case 'not-started':
            return <Flex zIndex={2} borderRadius='full' w='30px' h='30px' bg='#0D1610' borderWidth='6px' borderColor='#3D5A44' />;
        case 'current':
            return (
                <Flex
                    zIndex={2}
                    borderRadius='full'
                    w='30px'
                    h='30px'
                    bg='#1C3023'
                    borderWidth='6px'
                    borderColor='linear-gradient(90deg, #3D5A44 0%, #0D1610 100%)'
                />
            );
        case 'completed':
            return <CheckSVG width='30px' />;
        default:
            return null;
    }
};

export default CircleFlex;
