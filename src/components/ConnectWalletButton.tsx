import { Flex, Box, Button, Text } from '@chakra-ui/react';
import { useStore } from '../store';
import useWindowSize from '../hooks/useWindowSize';
import { ETH_Logo, BTC_Logo, ETHSVG } from './SVGs'; // Assuming you also have a BTC logo
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { colors } from '../utils/colors';

export const ConnectWalletButton = ({}) => {
    return (
        <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
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
                                    <button onClick={openChainModal} type='button'>
                                        Wrong network
                                    </button>
                                );
                            }

                            return (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Button
                                        bg={colors.purpleBackground}
                                        border={`2.4px solid ${colors.purpleBorder}`}
                                        h='36px'
                                        color={colors.offWhite}
                                        pt='2px'
                                        mr='2px'
                                        _hover={{ bg: colors.purpleHover }}
                                        _active={{ bg: colors.purpleBackground }}
                                        px='0'
                                        borderRadius={'10px'}
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        cursor={'pointer'}
                                        type='button'>
                                        {chain.hasIcon && (
                                            <>
                                                <Flex px='20px' mr='-2px' fontSize={'16px'}>
                                                    {account.displayBalance
                                                        ? `${parseFloat(account.balanceFormatted).toFixed(3)}`
                                                        : ''}
                                                </Flex>
                                                <Flex pt='2px' mr='-5px'>
                                                    <ETHSVG width='110' height='80' viewBox='0 0 130 50' />
                                                </Flex>
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={openAccountModal}
                                        type='button'
                                        _hover={{ bg: colors.purpleHover }}
                                        _active={{ bg: colors.purpleBackground }}
                                        bg={colors.purpleBackground}
                                        borderRadius={'10px'}
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
