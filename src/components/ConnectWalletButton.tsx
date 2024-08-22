import { Flex, Box, Button, Text, Avatar } from '@chakra-ui/react';
import { useStore } from '../store';
import useWindowSize from '../hooks/useWindowSize';
import { ETH_Logo, BTC_Logo, ETHSVG, ETH_Icon, USDT_Icon } from './other/SVGs'; // Assuming you also have a BTC logo
import { ConnectButton, AvatarComponent } from '@rainbow-me/rainbowkit';
import { colors } from '../utils/colors';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { BigNumber, ethers } from 'ethers';
import { getLiquidityProvider } from '../utils/contractReadFunctions';

export const ConnectWalletButton = ({}) => {
    const [usdtBalance, setUsdtBalance] = useState('0');
    const ethersRpcProvider = useStore((state) => state.ethersRpcProvider);
    const { address, isConnected } = useAccount();
    const selectedAsset = useStore((state) => state.selectedAsset);
    const localBalance = useStore(
        (state) => state.validAssets[selectedAsset.name]?.connectedUserBalanceFormatted || '0',
    );

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}>
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button
                                        onClick={openConnectModal}
                                        bg={colors.purpleBackground}
                                        cursor={'pointer'}
                                        color={colors.offWhite}
                                        _active={{ bg: colors.purpleBackground }}
                                        _hover={{ bg: colors.purpleHover }}
                                        borderRadius={'10px'}
                                        border={`2.4px solid ${colors.purpleBorder}`}
                                        type='button'
                                        pt='2px'>
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <Button
                                        onClick={openChainModal}
                                        bg={colors.purpleBackground}
                                        cursor={'pointer'}
                                        color={colors.offWhite}
                                        _active={{ bg: colors.purpleBackground }}
                                        _hover={{ bg: colors.purpleHover }}
                                        borderRadius={'10px'}
                                        border={`2.4px solid ${colors.purpleBorder}`}
                                        type='button'
                                        pt='2px'>
                                        Wrong network
                                    </Button>
                                );
                            }

                            return (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                        border={`2.4px solid ${
                                            selectedAsset.name === 'WETH'
                                                ? colors.purpleBorder
                                                : selectedAsset.border_color
                                        }`}
                                        h='37px'
                                        color={colors.offWhite}
                                        pt='2px'
                                        bg={
                                            selectedAsset.name === 'WETH'
                                                ? colors.purpleBackground
                                                : selectedAsset.dark_bg_color
                                        }
                                        mr='2px'
                                        _hover={{ bg: selectedAsset.bg_color }}
                                        _active={{ bg: selectedAsset.bg_color }}
                                        px='0'
                                        borderRadius={'10px'}
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        cursor={'pointer'}
                                        type='button'>
                                        <>
                                            <Flex mt='-2px' mr='-10px' pl='15px'>
                                                {(() => {
                                                    switch (selectedAsset.name) {
                                                        case 'WETH':
                                                            return (
                                                                <ETH_Icon
                                                                    width={'12'}
                                                                    height={'17'}
                                                                    viewBox='0 0 23 36'
                                                                />
                                                            );
                                                        case 'USDT':
                                                            return (
                                                                <Flex mt='-2px' mr='2px'>
                                                                    <USDT_Icon
                                                                        width='20'
                                                                        height='20'
                                                                        viewBox='0 0 80 80'
                                                                    />
                                                                </Flex>
                                                            );
                                                        default:
                                                            return null;
                                                    }
                                                })()}
                                            </Flex>
                                            <Flex px='20px' mt='-2px' mr='-2px' fontSize={'16px'} fontFamily={'aux'}>
                                                {`${parseFloat(localBalance).toString()} ${selectedAsset.name}`}
                                            </Flex>
                                        </>
                                    </Button>
                                    <Button
                                        onClick={openAccountModal}
                                        type='button'
                                        _hover={{ bg: colors.purpleHover }}
                                        _active={{ bg: colors.purpleBackground }}
                                        bg={colors.purpleBackground}
                                        borderRadius={'10px'}
                                        fontFamily={'aux'}
                                        fontSize={'16px'}
                                        fontWeight={'bold'}
                                        pt='2px'
                                        color={colors.offWhite}
                                        h='37px'
                                        border={`2.4px solid ${colors.purpleBorder}`}>
                                        {account.displayName}
                                    </Button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};
