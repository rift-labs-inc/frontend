import React from 'react';
import { BTC_Logo, BTC_Tag, ETH_Icon, USDT_Tag } from './SVGs';
import { Flex, Text } from '@chakra-ui/react';

interface AssetTag2Props {
    assetName: string;
    width?: string;
    height?: string;
    viewBox?: string;
}

export const AssetTag2: React.FC<AssetTag2Props> = ({ assetName, width, height, viewBox }) => {
    const renderAssetSVG = () => {
        switch (assetName?.toUpperCase()) {
            case 'BTC':
                return <BTC_Tag width={width} height={height} viewBox={viewBox} />;
            case 'USDT':
                return <USDT_Tag width={width} height={height} viewBox={viewBox} />;
            default:
                return <Text>Asset not found</Text>;
        }
    };

    return <Flex className='asset-tag'>{renderAssetSVG()}</Flex>;
};
