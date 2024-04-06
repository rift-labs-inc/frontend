import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import { useEffect } from "react";
import { useStore } from "../store";
import { AppProps } from "next/app";
import "../styles/custom-fonts.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
