import useWindowSize from "../hooks/useWindowSize";
import { useRouter } from "next/router";
import { Flex, Spacer } from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import colors from "../styles/colors";
import { CategoryTag } from "../components/CategoryTag";

const Activity = () => {
  const { height, width } = useWindowSize();
  const isSmallScreen = width < 1200;
  const router = useRouter();
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <Flex
      h="100vh"
      width="100%"
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
      backgroundImage={"/images/rift_background.png"}
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <Navbar />
      <Spacer />
    </Flex>
  );
};

export default Activity;
