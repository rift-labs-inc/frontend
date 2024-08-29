import { Flex, Spacer, Text } from '@chakra-ui/react';
import { calculateFillPercentage, formatBtcExchangeRate } from '../../utils/dappHelper';
import { DepositVault, ValidAsset } from '../../types';
import { BigNumber } from 'ethers';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { AssetTag2 } from '../other/AssetTag2';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';

interface LightVaultProps {
    vault: DepositVault;
    onClick: () => void;
    selectedInputAsset: ValidAsset;
}

const LightVault: React.FC<LightVaultProps> = ({ vault, onClick, selectedInputAsset }) => {
    const fillPercentage = calculateFillPercentage(vault);
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
            w='calc(100% - 4px)'
            mb='10px'
            fontSize={'18px'}
            px='16px'
            py='12px'
            align='center'
            justify='flex-start'
            borderRadius={'10px'}
            border='2px solid '
            color={colors.textGray}
            borderColor={colors.borderGrayLight}
            gap='12px'>
            <Text width='48px'>#{vault.index}</Text>
            <Flex flex={1} align='center' gap='12px'>
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
                        <Text
                            fontSize='16px'
                            color={colors.offWhite}
                            letterSpacing={'-1px'}
                            fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {vault?.initialBalance &&
                                formatUnits(
                                    BigNumber.from(vault.initialBalance).toString(),
                                    vault.depositAsset?.decimals,
                                ).toString()}
                        </Text>
                        <Spacer />
                        <AssetTag2 assetName={vault?.depositAsset?.name} width='84px' />
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
                        <Text
                            fontSize='16px'
                            color={colors.offWhite}
                            letterSpacing={'-1px'}
                            fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {vault?.initialBalance &&
                                formatUnits(
                                    BigNumber.from(vault.initialBalance).toString(),
                                    vault.depositAsset?.decimals,
                                ).toString()}
                        </Text>
                        <Spacer />
                        <AssetTag2 assetName={'BTC'} width='80px' />
                    </Flex>
                </Flex>
            </Flex>
            <Flex width='120px' align='center' justify='flex-end' gap='12px'>
                <Text color={fillPercentage > 0 ? colors.greenOutline : colors.textGray}>{`${fillPercentage}%`}</Text>
                <Flex
                    width='60px'
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
            </Flex>
            <Flex w='30px' justify='flex-end'>
                <IoMdSettings size={'18px'} color={colors.offWhite} />
            </Flex>
        </Flex>
    );
};

export default LightVault;
