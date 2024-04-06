import { Box, Flex, Text } from "@chakra-ui/react";
import colors from "../styles/colors";
import useWindowSize from "../hooks/useWindowSize";
import { useRouter } from "next/router";

interface Props {
  text?: string;
}

export const CategoryTag = ({ text = "ARCHIVES" }: Props) => {
  const { width } = useWindowSize();
  const isSmallScreen = width < 600;
  const router = useRouter();
  const fontSize = isSmallScreen ? "20px" : "16px";

  // Function to determine color based on text
  const getColor = (text) => {
    const lowerCaseText = text.toLowerCase();
    if (["painting", "drawing", "web"].includes(lowerCaseText)) {
      return "#449AFF";
    } else if (["3d art", "3d animation", "2d animation"].includes(lowerCaseText)) {
      return "#FF4444";
    } else if (["ios", "logo"].includes(lowerCaseText)) {
      return "#E9E9E9";
    } else if (["graphic"].includes(lowerCaseText)) {
      return "#FF9F47"; // New color for "graphic"
    } else if (["apparel"].includes(lowerCaseText)) {
      return "#2A960F"; // New color for "apparel"
    }
    return colors.offWhite; // Default color
  };

  const color = getColor(text);
  const displayText = text.toUpperCase();

  const hexToRGBA = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Flex direction={"column"} alignItems="center">
      <Box bg={hexToRGBA(color, 0.1)} border={`3px solid ${color}`} borderRadius="11px" display="inline-flex" alignItems="center" justifyContent="center" px="10px" py="5px">
        <Text fontWeight="bold" color={color} fontSize={fontSize} my="-2px" mx="3px">
          {displayText}
        </Text>
      </Box>
    </Flex>
  );
};
