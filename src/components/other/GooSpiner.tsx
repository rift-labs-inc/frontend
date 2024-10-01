import { Flex } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

const GooSpinner = ({ size = 100, color = '#6B46C1' }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Dynamically import and register the components
        import('ldrs').then(({ ring, treadmill }) => {
            ring.register();
            treadmill.register();
        });
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <Flex w={`${size}px`} mt='-15px' h={`${size}px`} justifyContent='center' alignItems='center'>
            <l-ring size='50' stroke='6' bg-opacity='0' speed='2' color={color}></l-ring>
        </Flex>
    );
};

export default GooSpinner;
