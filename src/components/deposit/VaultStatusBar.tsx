import React from 'react';
import { Flex, Text, Tooltip, Box, useColorModeValue } from '@chakra-ui/react';
import { colors } from '../../utils/colors';
import { DepositVault } from '../../types';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { FONT_FAMILIES } from '../../utils/font';
import { bitcoin_border_color } from '../../utils/constants';

interface VaultStatusBarProps {
    selectedVault: DepositVault;
    minPercentageForText?: number;
}

export const VaultStatusBar: React.FC<VaultStatusBarProps> = ({ selectedVault, minPercentageForText = 10 }) => {
    const totalAmount = BigNumber.from(selectedVault.initialBalance);
    const withdrawnAmount = BigNumber.from(selectedVault.withdrawnAmount);
    const unreservedAmount = BigNumber.from(selectedVault.trueUnreservedBalance);
    const reservedAmount = BigNumber.from(selectedVault.reservedBalance);
    const swappedAmount = totalAmount.sub(withdrawnAmount).sub(unreservedAmount).sub(reservedAmount);

    const calculatePercentage = (amount: BigNumber) => {
        return amount.mul(100).div(totalAmount).toNumber();
    };

    const formatAmount = (amount: BigNumber) => {
        return `${formatUnits(amount, selectedVault.depositAsset.decimals)} ${selectedVault.depositAsset.name}`;
    };

    const BarSection = ({ percentage, color, tooltipBg, label, amount }) => {
        const showInternalText = percentage >= minPercentageForText;

        return (
            <Tooltip px='14px' py='6px' fontFamily={FONT_FAMILIES.AUX_MONO} label={`${label}: ${amount}`} borderRadius='14px' bg={tooltipBg} color={colors.offerWhite} hasArrow>
                <Flex w={`${percentage}%`} bg={color} h='100%' alignItems='center' justifyContent='center' position='relative' minWidth={showInternalText ? '60px' : '0'}>
                    {showInternalText && (
                        <Box
                            position='absolute'
                            left='4px'
                            right='4px'
                            whiteSpace='nowrap'
                            overflow='hidden'
                            textOverflow='ellipsis'
                            color={colors.offerWhite}
                            mt='1px'
                            fontSize='13px'
                            fontFamily={FONT_FAMILIES.AUX_MONO}>
                            {amount} - {label}
                        </Box>
                    )}
                </Flex>
            </Tooltip>
        );
    };

    return (
        <Flex w='100%' direction='column'>
            <Flex h='50px' mt='6px' border='3px solid' textAlign={'center'} borderColor={colors.borderGrayLight} borderRadius='14px' overflow='hidden'>
                <BarSection
                    percentage={calculatePercentage(withdrawnAmount)}
                    color={colors.redHover}
                    tooltipBg={colors.red}
                    label='Withdrawn'
                    amount={formatAmount(withdrawnAmount)}
                />
                <BarSection
                    percentage={calculatePercentage(swappedAmount)}
                    color={colors.greenOutline}
                    tooltipBg={colors.greenBackground}
                    label='Swapped'
                    amount={formatAmount(swappedAmount)}
                />
                <BarSection percentage={calculatePercentage(reservedAmount)} color={'orange.600'} tooltipBg={'orange.700'} label='Reserved' amount={formatAmount(reservedAmount)} />
                <BarSection
                    percentage={calculatePercentage(unreservedAmount)}
                    color={selectedVault.depositAsset.dark_bg_color}
                    tooltipBg={selectedVault.depositAsset.bg_color}
                    label='Unreserved'
                    amount={formatAmount(unreservedAmount)}
                />
            </Flex>
        </Flex>
    );
};

export default VaultStatusBar;
