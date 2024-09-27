import React from 'react';
import { Flex, Box, Tooltip } from '@chakra-ui/react';
import { colors } from '../../utils/colors';
import { DepositVault } from '../../types';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { FONT_FAMILIES } from '../../utils/font';

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

    // New amounts
    const expiredAmount = BigNumber.from(selectedVault.expiredAmount || 0);
    const completedAmount = BigNumber.from(selectedVault.completedAmount || 0);
    const unlockedAmount = BigNumber.from(selectedVault.unlockedAmount || 0);

    // Adjust reservedAmount to exclude expired, completed, and unlocked amounts
    const adjustedReservedAmount = reservedAmount.sub(expiredAmount).sub(completedAmount).sub(unlockedAmount);

    // Calculate percentages
    const calculatePercentage = (amount: BigNumber) => {
        return amount.mul(100).div(totalAmount).toNumber();
    };

    const formatAmount = (amount: BigNumber) => {
        return `${formatUnits(amount, selectedVault.depositAsset.decimals)} ${selectedVault.depositAsset.name}`;
    };

    const withdrawnPercentage = calculatePercentage(withdrawnAmount);
    const swappedPercentage = calculatePercentage(swappedAmount);
    const reservedPercentage = calculatePercentage(adjustedReservedAmount);
    const expiredPercentage = calculatePercentage(expiredAmount);
    const completedPercentage = calculatePercentage(completedAmount);
    const unlockedPercentage = calculatePercentage(unlockedAmount);

    // Dynamically adjust the last section (unreserved) to fill any remaining space
    const unreservedPercentage = 100 - (withdrawnPercentage + swappedPercentage + reservedPercentage + expiredPercentage + completedPercentage + unlockedPercentage);

    const BarSection = ({ percentage, color, tooltipBg, label, amount }) => {
        const showInternalText = percentage >= minPercentageForText;

        return (
            <Tooltip px='14px' py='6px' fontFamily={FONT_FAMILIES.AUX_MONO} label={`${label} - ${amount}`} borderRadius='14px' bg={tooltipBg} color={colors.offerWhite} hasArrow>
                <Flex w={`${percentage}%`} bg={color} h='100%' alignItems='center' justifyContent='center' position='relative' minWidth={showInternalText ? '60px' : '0'}>
                    {showInternalText && (
                        <Box position='absolute' left='4px' right='4px' whiteSpace='nowrap' overflow='hidden' textOverflow='ellipsis' color={colors.offerWhite} mt='1px' fontSize='13px'>
                            <Box as='span' fontFamily='Nostromo'>
                                {label.toUpperCase()}
                            </Box>
                            {' - '}
                            <Box as='span' fontFamily={FONT_FAMILIES.AUX_MONO}>
                                {amount}
                            </Box>
                        </Box>
                    )}
                </Flex>
            </Tooltip>
        );
    };

    return (
        <Flex w='100%' direction='column'>
            <Flex h='50px' mt='6px' border='3px solid' textAlign={'center'} borderColor={colors.borderGrayLight} borderRadius='14px' overflow='hidden'>
                <BarSection percentage={withdrawnPercentage} color={colors.redHover} tooltipBg={colors.red} label='Withdrawn' amount={formatAmount(withdrawnAmount)} />
                <BarSection percentage={swappedPercentage} color={colors.greenOutline} tooltipBg={colors.greenBackground} label='Swapped' amount={formatAmount(swappedAmount)} />
                <BarSection percentage={reservedPercentage} color={'orange.600'} tooltipBg={'orange.700'} label='Reserved' amount={formatAmount(adjustedReservedAmount)} />
                <BarSection percentage={expiredPercentage} color={'gray.500'} tooltipBg={'gray.600'} label='Expired' amount={formatAmount(expiredAmount)} />
                <BarSection percentage={completedPercentage} color={'blue.500'} tooltipBg={'blue.600'} label='Completed' amount={formatAmount(completedAmount)} />
                <BarSection percentage={unlockedPercentage} color={'purple.500'} tooltipBg={'purple.600'} label='Unlocked' amount={formatAmount(unlockedAmount)} />
                <BarSection
                    percentage={unreservedPercentage}
                    color={selectedVault.depositAsset.dark_bg_color}
                    tooltipBg={selectedVault.depositAsset.bg_color}
                    label='Unreserved'
                    amount={formatAmount(unreservedAmount)}
                />
            </Flex>
        </Flex>
    );
};
