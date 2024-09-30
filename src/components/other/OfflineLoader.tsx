import { useEffect } from 'react';
import { colors } from '../../utils/colors';
import { Flex, FlexProps } from '@chakra-ui/react';

const OfflineLoader = (props: FlexProps) => {
    useEffect(() => {
        async function getLoader() {
            const { quantum } = await import('ldrs');
            quantum.register();
        }
        getLoader();
    }, []);
    return (
        <Flex {...props}>
            <l-quantum size='80' speed='3' color={colors.RiftOrange}></l-quantum>
        </Flex>
    );
};

export default OfflineLoader;
