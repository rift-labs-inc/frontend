import React, { useEffect, useState } from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { colors } from '../../utils/colors';
import { ChromeLogoSVG, WarningSVG } from '../other/SVGs';
import { FONT_FAMILIES } from '../../utils/font';

declare global {
    interface Window {
        rift?: any; // You can replace 'any' with a more specific type if you know the structure of the rift object
    }
}

export const Step2 = () => {
    const [isRiftExtensionInstalled, setIsRiftExtensionInstalled] = useState(false);

    useEffect(() => {
        setIsRiftExtensionInstalled(!!window.rift);
        console.log('isRiftExtensionInstalled', isRiftExtensionInstalled);
    }, []);

    return (
        <>
            {isRiftExtensionInstalled ? (
                <>
                    <Flex
                        bg={colors.offBlack}
                        w='100%'
                        mt='20px'
                        borderRadius='30px'
                        px='20px'
                        direction='column'
                        py='35px'
                        align='center'
                        borderWidth={3}
                        borderColor={colors.borderGray}>
                        <Flex maxW='600px' mt='20px' direction='column' align='center'>
                            <WarningSVG width='60px' />

                            <Text
                                fontSize='15px'
                                fontWeight='normal'
                                color={colors.textGray}
                                fontFamily={FONT_FAMILIES.AUX_MONO}
                                textAlign='center'
                                mt='20px'
                                flex='1'>
                                Your Rift Proxy Wallet is not detected. If this is your first time swapping, please add the Rift
                                Chrome Extension below:
                            </Text>
                            <Flex
                                width='100%'
                                mt='60px'
                                height='110px'
                                mb='50px'
                                onClick={() => {
                                    window.open('https://chromewebstore.google.com/', '_blank');
                                }}
                                cursor='pointer'
                                flexShrink={0}
                                bg={colors.purpleBackground}
                                align='center'
                                justify='center'
                                borderWidth={3}
                                borderColor={colors.purpleBorder}
                                borderRadius='full'
                                filter='drop-shadow(0px 0px 34.9px rgba(46, 64, 183, 0.33))'>
                                <ChromeLogoSVG width='70px' />
                                <Text fontSize='25px' ml='12px' fontFamily={FONT_FAMILIES.NOSTROMO}>
                                    INSTALL CHROME EXTENSION
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex
                        bg={colors.offBlack}
                        _hover={{ bg: colors.offBlackLighter }}
                        w='400px'
                        mt='25px'
                        transition='0.2s'
                        h='45px'
                        fontSize='15px'
                        align='center'
                        userSelect='none'
                        cursor='pointer'
                        borderRadius='10px'
                        justify='center'
                        borderWidth='2px'
                        borderColor={colors.offBlackLighter2}>
                        <WarningSVG fill={colors.textGray} width='18px' />
                        <Text ml='10px' color={colors.textGray} fontFamily='Nostromo'>
                            Rift Wallet Not Detected
                        </Text>
                    </Flex>
                </>
            ) : (
                <Flex
                    bg={colors.offBlack}
                    w='100%'
                    mt='20px'
                    borderRadius='30px'
                    px='20px'
                    direction='column'
                    py='35px'
                    align='center'
                    borderWidth={3}
                    borderColor={colors.borderGray}>
                    <Text fontSize='25px' fontFamily={FONT_FAMILIES.NOSTROMO} color={colors.textGray}>
                        Chrome extension detected!
                    </Text>
                </Flex>
            )}
        </>
    );
};
