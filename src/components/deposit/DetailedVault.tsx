import { Flex, Spacer, Text } from '@chakra-ui/react';
import { formatBtcExchangeRate } from '../../utils/dappHelper';
import { DepositVault, ValidAsset } from '../../types';
import { BigNumber } from 'ethers';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { AssetTag } from '../other/AssetTag';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import LightVaultStatusBar from './LightVaultStatusBar';

interface DetailedVaultProps {
    vault: DepositVault;
    onClick: () => void;
    selectedInputAsset: ValidAsset;
}

const DetailedVault: React.FC<DetailedVaultProps> = ({ vault, onClick, selectedInputAsset }) => {
    console.log('vault index:', vault.index);

    return (
        <Flex
            _hover={{
                bg: colors.purpleBackground,
                borderColor: colors.purpleBorder,
            }}
            onClick={onClick}
            cursor={'pointer'}
            letterSpacing={'-2px'}
            bg={colors.offBlackLighter}
            w='100%'
            mb='10px'
            fontSize={'18px'}
            px='16px'
            py='12px'
            align='flex-start'
            justify='flex-start'
            borderRadius={'10px'}
            border='2px solid '
            color={colors.textGray}
            borderColor={colors.borderGrayLight}
            gap='12px'>
            <Text width='48px'>#{vault.index}</Text> {/* 64px width for 4 digits */}
            <Flex flexDir='column' flex={1} gap='12px'>
                <Flex w='100%' gap='12px'>
                    <Flex flex={1} mt='3px' h='50px' align='center' gap='8px'>
                        <Flex flex={1} direction='column'>
                            <Flex
                                h='50px'
                                w='100%'
                                bg={selectedInputAsset.dark_bg_color}
                                border='2px solid'
                                borderColor={selectedInputAsset.bg_color}
                                borderRadius={'14px'}
                                pl='15px'
                                pr='10px'
                                align={'center'}>
                                <Text fontSize='16px' color={colors.offWhite} letterSpacing={'-1px'} fontFamily={FONT_FAMILIES.AUX_MONO}>
                                    {vault?.initialBalance && formatUnits(BigNumber.from(vault.initialBalance).toString(), vault.depositAsset?.decimals).toString()}
                                </Text>
                                <Spacer />
                                <AssetTag assetName={vault?.depositAsset?.name} width='84px' />
                            </Flex>
                        </Flex>
                        <Flex mt='0px' fontSize='20px' opacity={0.9}>
                            <FaRegArrowAltCircleRight color={colors.RiftOrange} />
                        </Flex>
                        <Flex flex={1} direction='column'>
                            <Flex
                                h='50px'
                                w='100%'
                                bg={colors.currencyCard.btc.background}
                                border='2px solid'
                                borderColor={colors.currencyCard.btc.border}
                                borderRadius={'14px'}
                                pl='15px'
                                pr='10px'
                                align={'center'}>
                                <Text fontSize='16px' color={colors.offWhite} letterSpacing={'-1px'} fontFamily={FONT_FAMILIES.AUX_MONO}>
                                    {vault?.initialBalance && formatUnits(BigNumber.from(vault.initialBalance).toString(), vault.depositAsset?.decimals).toString()}
                                </Text>
                                <Spacer />
                                <AssetTag assetName={'BTC'} width='80px' />
                            </Flex>
                        </Flex>
                    </Flex>
                    {/* <Flex width='100px' align='center' justify='center' gap='12px'>
                        <Text
                            color={
                                fillPercentage > 0 ? colors.greenOutline : colors.textGray
                            }>{`${fillPercentage}%`}</Text>
                        <Flex
                            width='10px'
                            px='20px'
                            bg={
                                fillPercentage > 0
                                    ? fillPercentage == 100
                                        ? colors.greenOutline
                                        : colors.greenBackground
                                    : colors.offBlackLighter2
                            }
                            borderRadius='10px'
                            height='17px'
                            border={`1.5px solid`}
                            borderColor={fillPercentage > 0 ? colors.greenOutline : colors.borderGrayLight}
                        />
                    </Flex> */}
                </Flex>
                <Flex w='100%'>
                    <LightVaultStatusBar selectedVault={vault} />
                </Flex>
            </Flex>
        </Flex>
    );
};

export default DetailedVault;
