import { Text, TextProps } from '@chakra-ui/react';
import { colors } from '../../utils/colors';

const WhiteText: React.FC<TextProps> = ({ children, ...props }) => {
    return (
        <Text as='span' fontWeight='bold' color={colors.offWhite} {...props}>
            {children}
        </Text>
    );
};

export default WhiteText;
