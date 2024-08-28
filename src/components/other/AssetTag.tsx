import { Flex, Text } from '@chakra-ui/react';
import useWindowSize from '../../hooks/useWindowSize';
import { BTC_Logo } from './SVGs'; // Import BTC logo as a React component
import React from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { useStore } from '../../store';
import { FONT_FAMILIES } from '../../utils/font';
import { colors } from '../../utils/colors';

interface AssetTagProps {
    assetName: string;
    w?: string | number;
}

export const AssetTag = ({ assetName, w }: AssetTagProps) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);

    let asset = useStore.getState().validAssets[assetName];

    if (assetName === 'selected' && selectedInputAsset) {
        asset = selectedInputAsset;
    } else if (assetName === 'BTC') {
        asset = {
            name: 'BTC',

            icon_svg: BTC_Logo,
            bg_color: '#c26920',
            border_color: '#FFA04C',
            dark_bg_color: '#372412',
            light_text_color: '#7d572e',
        } as any;
    }

    if (!asset) {
        console.error('Asset not found for name:', assetName);
        return <Flex align='center'>Asset not found</Flex>;
    }

    const { icon_svg, bg_color, border_color } = asset;

    return (
        <Flex align='center'>
            <Flex w='36px' mr='-20px' zIndex={'10'}>
                {React.createElement(icon_svg)}{' '}
            </Flex>
            <Flex
                w={assetName.length === 4 ? '100px' : assetName.length === 3 ? '87px' : '150px'}
                h='32px'
                pl='15px'
                border='2px solid'
                borderColor={border_color}
                bg={bg_color}
                borderRadius='9px'
                align='center'
                justify='center'>
                <Text
                    mt='0px'
                    fontWeight={'bold'}
                    color={colors.offWhite}
                    fontFamily={FONT_FAMILIES.NOSTROMO}
                    fontSize={'18px'}>
                    {asset.name}
                </Text>
                {/* <Flex ml='8px'>
                    <IoIosArrowDown size={'16px'} /> //TODO make this a dropdown and when you click on it the select asset modal pops up
                </Flex> */}
            </Flex>
        </Flex>
    );
};
