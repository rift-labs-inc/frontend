import { extendTheme } from "@chakra-ui/react";
import colors from "./styles/colors";

const fonts = { mono: `'Menlo', monospace` };

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        backgroundColor: "#020202",
        fontFamily: "Nostromo Regular",
        fontWeight: "bold",
        letterSpacing: "-15%",
        color: colors.offWhite,
      },
      text: {
        fontFamily: "Nostromo Regular",
        fontWeight: "bold",
        letterSpacing: "-15%",
        color: colors.offWhite,
      },
    },
  },
  fonts,
  components: {
    Box: {
      variants: {
        project: {
          "&:hover": {
            ".overlay": {
              opacity: 0.5,
            },
            ".text": {
              opacity: 1,
            },
          },
        },
      },
    },
  },
});

export default theme;
