import React from 'react';
import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { FONT_FAMILIES } from '../../utils/font';
import { colors } from '../../utils/colors';

const MiniStatusBar = ({ selectedVault }) => {
    if (!selectedVault) return null;

    const totalAmount = BigNumber.from(selectedVault.initialBalance);
    const withdrawnAmount = BigNumber.from(selectedVault.withdrawnAmount);
    const reservedAmount = selectedVault.reservedBalance ? BigNumber.from(selectedVault.reservedBalance) : BigNumber.from(0);
    const trueUnreservedBalance = selectedVault.trueUnreservedBalance ? BigNumber.from(selectedVault.trueUnreservedBalance) : BigNumber.from(0);

    const swappedAmount = selectedVault.initialBalance
        ? BigNumber.from(selectedVault.initialBalance).sub(withdrawnAmount).sub(trueUnreservedBalance).sub(reservedAmount)
        : BigNumber.from(0);

    const calculatePercentage = (amount) => {
        return amount.mul(100).div(totalAmount).toNumber();
    };

    const withdrawnPercentage = calculatePercentage(withdrawnAmount);
    const swappedPercentage = calculatePercentage(swappedAmount);
    const reservedPercentage = calculatePercentage(reservedAmount);
    const fillPercentage = withdrawnPercentage + swappedPercentage + reservedPercentage;

    const formatAmount = (amount) => {
        return `${formatUnits(amount, selectedVault.depositAsset?.decimals)} ${selectedVault.depositAsset?.name}`;
    };

    return (
        <Flex width='120px' align='center' justify='flex-end' gap='12px'>
            <Text color={fillPercentage === 100 ? colors.greenOutline : colors.textGray}>{`${fillPercentage}%`}</Text>
            <Tooltip
                label={`Withdrawn: ${formatAmount(withdrawnAmount)} (${withdrawnPercentage}%) | Swapped: ${formatAmount(
                    swappedAmount,
                )} (${swappedPercentage}%) | Reserved: ${formatAmount(reservedAmount)} (${reservedPercentage}%)`}
                fontFamily={FONT_FAMILIES.AUX_MONO}
                borderRadius='14px'
                bg={colors.greenBackground}
                color={colors.offerWhite}
                hasArrow>
                <Flex
                    width='60px'
                    height='17px'
                    borderRadius='10px'
                    border={`1.5px solid ${fillPercentage === 100 ? colors.greenOutline : colors.borderGrayLight}`}
                    overflow='hidden'>
                    <Flex width={`${withdrawnPercentage}%`} height='100%' bg={colors.redHover} />
                    <Flex width={`${swappedPercentage}%`} height='100%' bg={colors.greenOutline} />
                    <Flex width={`${reservedPercentage}%`} height='100%' bg='orange.600' />
                </Flex>
            </Tooltip>
        </Flex>
    );
};

export default MiniStatusBar;
