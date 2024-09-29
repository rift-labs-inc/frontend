import { Flex, Text } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { FONT_FAMILIES } from '../../utils/font';
import useHorizontalSelectorInput from '../../hooks/useHorizontalSelectorInput';
import HorizontalButtonSelector from '../other/HorizontalButtonSelector';

interface ActivityChartContainerProps extends PropsWithChildren {
    title: string;
    value: string;
}

const ActivityChartContainer: React.FC<ActivityChartContainerProps> = ({ title, value, children }) => {
    const { options: optionsButton, selected: selectedButton, setSelected: setSelectedButton } = useHorizontalSelectorInput(['Day', 'Month'] as const);

    return (
        <Flex flex={1} bg='#151515' border='3px solid #262626' borderRadius='24px' flexDir='column' p='12px'>
            <Flex>
                <Flex fontFamily={FONT_FAMILIES.AUX_MONO} flexDir='column' flex={1}>
                    <Text fontWeight='300' fontSize='0.8rem' color='#A5A5A5' letterSpacing='-1.5px'>
                        {title}
                    </Text>
                    <Text fontWeight='400' fontSize='1.8rem' letterSpacing='-4px'>
                        {value}
                    </Text>
                </Flex>
                <Flex>
                    <HorizontalButtonSelector options={optionsButton} selectedItem={selectedButton} onSelectItem={setSelectedButton} h='36px' w='180px' fontSize='0.7rem' />
                </Flex>
            </Flex>
            {children}
        </Flex>
    );
};

export default ActivityChartContainer;
