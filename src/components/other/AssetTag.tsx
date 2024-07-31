import { Flex, Box } from '@chakra-ui/react';
import { useStore } from '../../store';
import useWindowSize from '../../hooks/useWindowSize';
import { ETH_Logo, BTC_Logo } from './SVGs'; // Assuming you also have a BTC logo

// Mapping of asset names to their respective SVG components
const svgComponents = {
    ETH: ETH_Logo,
    BTC: BTC_Logo,
};

interface AssetTagProps {
    assetName: string;
}

export const AssetTag = ({ assetName }: AssetTagProps) => {
    const { width } = useWindowSize();
    const isMobileView = width < 600;
    const fontSize = isMobileView ? '20px' : '20px';
    const availableAssets = useStore((state) => state.availableAssets);
    const asset = availableAssets.find((a) => a.name === assetName);

    if (!asset) {
        console.error('Asset not found for name:', assetName);
        return <Flex align='center'>Asset not found</Flex>;
    }

    const { icon_svg, bg_color, border_color } = asset;
    console.log('icon_svg:', icon_svg); // Check the exact value of icon_svg

    const SvgIcon = svgComponents[icon_svg]; // Retrieve the corresponding SVG component
    console.log('SvgIcon:', SvgIcon); // This should show the function/component if found

    if (!SvgIcon) {
        console.error('SVG component not found for icon:', icon_svg);
        return <Flex align='center'>SVG not found</Flex>;
    }

    return (
        <Flex align='center'>
            <Box w='30px' h='30px' bg={bg_color} borderRadius='full' overflow='hidden' mr='10px'>
                <SvgIcon /> // Use the SVG component here
            </Box>
            <Flex
                w='100px'
                h='20px'
                border='3px solid'
                borderColor={border_color}
                bg={bg_color}
                borderRadius='10px'
                align='center'
                justify='center'>
                <Box fontSize={fontSize}>{assetName}</Box>
            </Flex>
        </Flex>
    );
};
