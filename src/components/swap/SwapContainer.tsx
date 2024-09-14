import { Tabs, TabList, Tooltip, TabPanels, Tab, Button, Flex, Text, useColorModeValue, Box, Spacer, Input } from '@chakra-ui/react';
import useWindowSize from '../../hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../utils/colors';
import { useStore } from '../../store';
import { BTCSVG, ETHSVG, InfoSVG } from '../other/SVGs';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ReservationState, ReserveLiquidityParams, SwapReservation } from '../../types';
import { bitcoinDecimals, maxSwapOutputs } from '../../utils/constants';
import { AssetTag } from '../other/AssetTag';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { SwapUI } from './SwapUI';
import { DepositUI } from './DepositUI';
import { DepositConfirmation } from '../deposit/DepositConfirmation';

export const SwapContainer = ({}) => {
    const { isMobile } = useWindowSize();
    const depositMode = useStore((state) => state.depositMode);

    return (
        <Flex align={'center'} justify={'center'} w='100%' maxW='600px' mt='30px' px='20px' direction={'column'} overflow={'visible'}>
            {/* Content */}
            {depositMode ? (
                // DEPOSIT UI
                <DepositUI />
            ) : (
                // SWAP UI
                <SwapUI />
            )}
        </Flex>
    );
};
