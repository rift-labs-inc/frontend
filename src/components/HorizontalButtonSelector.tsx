import React, { useState } from 'react';
import { Flex, Button, FlexProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { colors } from '../utils/colors';
import { FONT_FAMILIES } from '../utils/font';

const MotionFlex = motion(Flex);

interface HorizontalButtonSelectorProps extends FlexProps {
    options?: string[];
    onSelectItem?: (s: string) => void;
    buttonWidth?: string | number;
}
const HorizontalButtonSelector = ({
    options = [],
    buttonWidth = '200px',
    onSelectItem,
    ...props
}: HorizontalButtonSelectorProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const numOptions = options.length;
    const optionWidth = 100 / numOptions;

    return (
        <Flex
            position='relative'
            bg={colors.offBlack}
            borderRadius='10px'
            border='2px solid'
            borderColor={colors.borderGray}
            height='50px'
            {...props}>
            <MotionFlex
                position='absolute'
                bg={colors.purpleButtonBG}
                height='108%'
                mt='-2px'
                width={`${optionWidth}%`}
                border='2px solid'
                borderColor={colors.purpleBorder}
                borderRadius='10px'
                initial={false}
                animate={{
                    // x: `${selectedIndex * animationWidth - 1}%`,
                    x: selectedIndex == 0 ? '-1%' : `${selectedIndex * 100 + (selectedIndex == numOptions - 1 ? 1 : 0)}%`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            {options.map((text, index) => (
                <Button
                    key={index}
                    onClick={() => {
                        setSelectedIndex(index);
                        if (onSelectItem) onSelectItem(options[index]);
                    }}
                    flex={1}
                    zIndex={1}
                    fontSize={'14px'}
                    variant='ghost'
                    h='100%'
                    pt='-10px'
                    w={buttonWidth}
                    alignContent={'center'}
                    textAlign={'center'}
                    color={selectedIndex === index ? colors.offWhite : colors.textGray}
                    fontFamily={FONT_FAMILIES.NOSTROMO}
                    _active={{ border: 'none', borderWidth: '0px' }}
                    _selected={{ border: 'none', borderWidth: '0px' }}
                    _hover={{ bg: 'transparent', border: 'none' }}>
                    {text}
                </Button>
            ))}
        </Flex>
    );
};

export default HorizontalButtonSelector;
