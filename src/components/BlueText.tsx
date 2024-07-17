import { Text, TextProps } from '@chakra-ui/react';
import { colors } from '../utils/colors';

const BlueText: React.FC<TextProps> = ({ children, ...props }) => {
    return (
        <Text as='span' fontWeight='bold' color={colors.text.blue} {...props}>
            {children}
        </Text>
    );
};

export default BlueText;
