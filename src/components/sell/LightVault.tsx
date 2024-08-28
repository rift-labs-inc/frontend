import { Flex, Spacer, Text } from '@chakra-ui/react';
import { calculateFillPercentage, formatBtcExchangeRate } from '../../utils/dappHelper';
import { DepositVault, ValidAsset } from '../../types';
import { BigNumber } from 'ethers';
import { colors } from '../../utils/colors';
import { FONT_FAMILIES } from '../../utils/font';
import { AssetTag2 } from '../other/AssetTag2';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

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
            key={vault.index}
            _hover={{
                bg: colors.purpleBackground,
                borderColor: colors.purpleBorder,
            }}
            onClick={onClick}
            cursor={'pointer'}
            letterSpacing={'-2px'}
            bg={colors.offBlackLighter}
            w='100%'
            h='80px'
            mb='10px'
            fontSize={'18px'}
            pl='18px'
            align='center'
            justify='flex-start'
            borderRadius={'10px'}
            border='2px solid '
            color={colors.textGray}
            borderColor={colors.borderGrayLight}>
            <Text width='8.5%'>#{vault.index}</Text>
            <Flex width='38%' mt='10px'>
                <Flex w='85%' direction='column'>
                    <Flex
                        h='50px'
                        mt='-7px'
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
            </Flex>
            <Flex width='33%'>
                <Text color={colors.textGray} fontWeight={'normal'} letterSpacing={'-2.5px'}>
                    {vault &&
                        `${Number(
                            formatBtcExchangeRate(vault.btcExchangeRate, vault.depositAsset.decimals),
                        ).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })} ${vault.depositAsset.name}/BTC`}
                </Text>
            </Flex>
            <Flex width='10%'>
                <Text
                    color={
                        Number(fillPercentage) > 0 ? colors.greenOutline : colors.textGray
                    }>{`${fillPercentage}%`}</Text>
                <Flex
                    ml='20px'
                    mt='5px'
                    width='10px'
                    px='20px'
                    bg={
                        Number(fillPercentage) > 0
                            ? Number(fillPercentage) == 100
                                ? colors.greenOutline
                                : colors.greenBackground
                            : colors.offBlackLighter2
                    }
                    borderRadius='10px'
                    height='17px'
                    border={`1.5px solid`}
                    borderColor={Number(fillPercentage) > 0 ? colors.greenOutline : colors.borderGrayLight}
                />
            </Flex>
        </Flex>
    );
};

export default LightVault;
