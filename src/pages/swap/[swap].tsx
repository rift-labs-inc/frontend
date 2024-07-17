import { useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../store';
import { Text, Flex, Image, Center, Box, Button, color } from '@chakra-ui/react';
import { Navbar } from '../../components/Navbar';
import { colors } from '../../utils/colors';

const ProjectPage = () => {
    const router = useRouter();
    const { slug } = router.query;

    return (
        <Flex direction={'column'}>
            <Navbar />
            <Center flexDirection='column' my='15px' pt='128px'>
                <Text color={colors.offWhite} fontSize='30px' fontWeight='bold'>
                    RIFT
                </Text>
            </Center>
        </Flex>
    );
};

export default ProjectPage;
