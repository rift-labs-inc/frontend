import { Box, Button, Flex, FlexProps, Spacer, Text } from "@chakra-ui/react";
import colors from "../styles/colors";
import useWindowSize from "../hooks/useWindowSize";
import { useRouter } from "next/router";
import { IoMenu } from "react-icons/io5";

export const Navbar = ({}) => {
  const { height, width } = useWindowSize();
  const isMobileView = width < 600;
  const router = useRouter();
  const fontSize = isMobileView ? "20px" : "20px";

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <Flex
      width="100%"
      direction={"column"}
      // backdropFilter="blur(10px)" // Apply blur for glass effect
      position="fixed"
      pb="20px"
      top={0}
      left={0}
      right={0}
      zIndex={1000} // Ensure it's above other content
    >
      <Flex direction="row" w="100%" px={"14px"} pt="12px">
        <Flex>
          <Text color={colors.offWhite} fontSize={"15px"} mb="-10px">
            Rift
          </Text>
        </Flex>
        <Spacer />
        <Flex>
          <Text
            color={colors.offWhite}
            fontFamily={"Nostromo Regular"}
            fontWeight={"bold"}
            fontSize={"15px"}
            letterSpacing={"-15%"}
            mb="-10px"
          >
            Connect Wallet
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
