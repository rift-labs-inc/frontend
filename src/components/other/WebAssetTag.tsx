import { Flex, Text, FlexProps, Image } from '@chakra-ui/react';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { FaChevronDown } from 'react-icons/fa';
import { AssetType } from '../../types';
import useWindowSize from '../../hooks/useWindowSize';

interface WebAssetTagProps {
    asset: AssetType;
    onDropDown?: () => void;
    w?: string | number;
    h?: string | number;
    fontSize?: string;
    borderWidth?: string | number;
    px?: string | number;
    pointer?: boolean;
}

const WebAssetTag: React.FC<WebAssetTagProps> = ({ asset, onDropDown, w, h, fontSize, borderWidth, px, pointer }) => {
    const { isMobile } = useWindowSize();

    const adjustedH = h ?? isMobile ? '30px' : '36px';
    const adjustedFontSize = fontSize ?? `calc(${adjustedH} / 2 + 0px)`;
    const arrowSize = fontSize ?? `calc(${adjustedH} / 4)`;
    const adjustedBorderRadius = `calc(${adjustedH} / 4)`;

    const colorKey = asset == 'WBTC' ? 'btc' : asset.toLowerCase();
    const imgKey = asset == 'WETH' ? 'ETH' : asset;

    const bgColor = colors.assetTag[colorKey].background;
    const borderColor = colors.assetTag[colorKey].border;

    const pX = px ?? '20px';

    return (
        <Flex align='center'>
            <Flex
                userSelect='none'
                aspectRatio={1}
                h={`calc(${adjustedH} + 2px)`}
                bg={borderColor}
                w={w}
                borderRadius='400px'
                mr={`calc(${adjustedH} / 2 * -1)`}
                zIndex={1}
                align='center'
                justify='center'
                cursor={onDropDown || pointer ? 'pointer' : 'auto'}
                onClick={onDropDown}>
                <Image src={`/images/assets/icons/${imgKey}.svg`} h={asset == 'WBTC' ? adjustedH : `calc(${adjustedH} - 14px)`} userSelect='none' />
            </Flex>
            <Flex
                userSelect='none'
                bg={bgColor}
                border={`2px solid ${borderColor}`}
                borderWidth={borderWidth}
                h={adjustedH}
                borderRadius={adjustedBorderRadius}
                align='center'
                pr={pX}
                pl={`calc(${adjustedH} / 2  + ${pX} / 2)`}
                gap='8px'
                cursor={onDropDown || pointer ? 'pointer' : 'auto'}
                onClick={onDropDown}>
                <Text fontSize={adjustedFontSize} color={'white'} fontFamily={FONT_FAMILIES.NOSTROMO} userSelect='none'>
                    {asset}
                </Text>
                {onDropDown && <FaChevronDown fontSize={arrowSize} color={colors.offWhite} style={{ marginRight: '-8px' }} />}
            </Flex>
        </Flex>
    );
};

export default WebAssetTag;
