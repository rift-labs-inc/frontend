import React, { useState } from 'react';
import { Flex, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { colors } from '../utils/colors';

const MotionFlex = motion(Flex);

const HorizontalButtonSelector = () => {
    const [selectedOption, setSelectedOption] = useState('Create a Vault');

    const options = ['Create a Vault', 'Manage Vaults'];

    return (
        <Flex
            position='relative'
            bg={colors.offBlack}
            borderRadius='10px'
            border='2px solid'
            borderColor={colors.borderGray}
            height='50px'>
            <MotionFlex
                position='absolute'
                bg={colors.purpleButtonBG}
                height='108%'
                mt='-2px'
                width='50.5%'
                border='2px solid'
                borderColor={colors.purpleBorder}
                borderRadius='10px'
                initial={false}
                animate={{
                    x: selectedOption === 'Create a Vault' ? '-1%' : '99%',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <Button
                h='100%'
                pt='-10px'
                w='200px'
                alignContent={'center'}
                textAlign={'center'}
                // pl='12px'
                _active={{ border: 'none', borderWidth: '0px' }}
                _selected={{ border: 'none', borderWidth: '0px' }}
                fontSize={'14px'}
                key={'Create a Vault'}
                onClick={() => setSelectedOption('Create a Vault')}
                flex={1}
                variant='ghost'
                zIndex={1}
                color={selectedOption === 'Create a Vault' ? colors.offWhite : colors.textGray}
                _hover={{ bg: 'transparent', border: 'none' }}>
                {'Create a Vault'}
            </Button>
            <Button
                // pr='20px'
                w='200px'
                h='100%'
                pt='-10px'
                fontSize={'14px'}
                key={'Manage Vaults'}
                onClick={() => setSelectedOption('Manage Vaults')}
                flex={1}
                variant='ghost'
                zIndex={1}
                color={selectedOption === 'Manage Vaults' ? colors.offWhite : colors.textGray}
                _hover={{ bg: 'transparent' }}>
                {'Manage Vaults'}
            </Button>
        </Flex>
    );
};

export default HorizontalButtonSelector;
