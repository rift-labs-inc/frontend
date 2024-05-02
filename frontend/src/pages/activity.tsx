import useWindowSize from "../hooks/useWindowSize";
import { useRouter } from "next/router";
import {
  Flex,
  Spacer,
  Text,
  Box,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  Tooltip,
} from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import colors from "../styles/colors";
import { IoCheckbox } from "react-icons/io5";
import { useState } from "react";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { FaCheckSquare } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { useStore } from "../store";
import { toastSuccess } from "../hooks/toast";
import {
  BTCSVG,
  ETHArrow,
  WBTCSVG,
  BTCArrow,
  GreenCheck,
} from "../components/SVGs";

const Activity = () => {
  const { height, width } = useWindowSize();
  const isSmallScreen = width < 1200;
  const router = useRouter();
  const handleNavigation = (route: string) => {
    router.push(route);
  };
  const activityData = useStore((state) => state.activityData);

  const [showMyActivity, setShowMyActivity] = useState(false);

  return (
    <Flex
      h="100vh"
      width="100%"
      direction="column"
      backgroundImage={"/images/rift_background.png"}
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <Navbar />
      <Flex direction={"column"} align="center" w="100%" h="100%" mt="105px">
        {/* LOGOS & TEXT */}
        <Flex direction={"column"} align="center" w="100%">
          <Flex
            sx={{
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
            }}
            bgGradient={`linear(90deg, #394AFF, #FF8F28)`}
            letterSpacing={"2px"}
            mt="-25px"
          >
            <Text
              userSelect={"none"}
              fontSize="46px"
              fontFamily={"Klein"}
              fontWeight="bold"
              px="12px"
            >
              Activi
            </Text>
            <Text
              userSelect={"none"}
              fontSize="46px"
              fontFamily={"Klein"}
              ml="-10px"
              fontWeight="bold"
              sx={{
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
              }}
            >
              ty
            </Text>
          </Flex>
          <Text
            userSelect={"none"}
            fontSize="13px"
            fontFamily={"Aux"}
            color={"#c3c3c3"}
            mt="5px"
            textAlign={"center"}
            mb="20px"
            fontWeight={"normal"}
            textShadow={"0px 0px 4px rgba(0, 0, 0)"}
          >
            Manage the status of your current swaps and see previous bridge
            activity.
          </Text>
        </Flex>
        {/* SEARCH & ACTIVITY DATA */}
        <Flex
          mb="40px"
          w="1200px"
          bg="rgba(10, 10, 10, 0.6)"
          backdropFilter={"blur(10px)"}
          borderRadius={"8px"}
          border={"2px solid #282828"}
          align={"center"}
          direction={"column"}
          mt="55px"
        >
          <Flex w="100%" mt="-55px" mb="8px" h="44px">
            <Flex
              w="100%"
              h="100%"
              border={"2px solid #282828"}
              borderRadius={"8px"}
              backdropFilter={"blur(10px)"}
            >
              {/* SEARCHBAR */}
              <InputGroup>
                <Input
                  w="100%"
                  h="100%"
                  bg="rgba(15, 15, 15, 0.8)"
                  fontFamily="Aux"
                  pl="14px"
                  fontSize="14px"
                  border="none"
                  boxShadow="none"
                  outline="none"
                  placeholder="Search by address or txn hash"
                  _active={{ border: "none", boxShadow: "none" }}
                  _focus={{ border: "none", boxShadow: "none" }}
                  _selected={{ border: "none", boxShadow: "none" }}
                  _placeholder={{ color: colors.textGray }}
                />
                <InputRightElement
                  pointerEvents="none"
                  cursor={"pointer"}
                  mt="-1.5px"
                  mr="4px"
                  children={<FaSearch color={"#888"} />}
                />
              </InputGroup>
            </Flex>
            <Flex
              ml="6px"
              w="180px"
              borderRadius={"8px"}
              onClick={() => setShowMyActivity(!showMyActivity)}
              cursor={"pointer"}
              userSelect={"none"}
              h="100%"
              bg={showMyActivity ? "#181D3D" : "rgba(15, 15, 15, 0.8)"}
              align={"center"}
              border={
                showMyActivity ? "2px solid #445BCB" : "2px solid #282828"
              }
            >
              <Flex direction={"column"}>
                <Text
                  fontFamily={"Aux"}
                  fontWeight={"normal"}
                  ml="15px"
                  color={!showMyActivity ? "#888888" : colors.offWhite}
                  fontSize={"9px"}
                  mr="9px"
                  mt="1px"
                >
                  Filter by
                </Text>
                <Text
                  fontFamily={"Aux"}
                  fontWeight={"normal"}
                  ml="15px"
                  color={!showMyActivity ? colors.offerWhite : colors.offWhite}
                  fontSize={"13px"}
                  mr="9px"
                  mt="-2px"
                >
                  My Activity
                </Text>
              </Flex>
              <Flex mt="1px">
                {showMyActivity ? (
                  <FaCheckSquare color="#829EEA" size={"16px"} />
                ) : (
                  <MdOutlineCheckBoxOutlineBlank color={"#666"} size={"16px"} />
                )}
              </Flex>
            </Flex>
          </Flex>
          {/* ACTIVITY DATA */}
          {height ? (
            <Flex h={height - 300} w="100%">
              <Flex
                fontFamily="aux"
                letterSpacing={"-0.5px"}
                mt="18px"
                w="100%"
                direction="column"
              >
                {/* Data Headers */}
                <Flex
                  pb="10px"
                  w="100%"
                  align="start"
                  fontSize={"14px"}
                  borderBottom="1px solid #333"
                  color={colors.textGray}
                  boxShadow={"0px 10px 12px rgba(0, 0, 0, 0.4)"}
                >
                  <Flex
                    ml="33px"
                    align="start"
                    fontSize={"14px"}
                    color={colors.textGray}
                  >
                    <Flex w="85px" textAlign="left">
                      <Text>Asset</Text>
                    </Flex>
                    <Flex w="125px" textAlign="left">
                      <Text>Amount</Text>
                    </Flex>

                    <Flex w="85px" textAlign="left">
                      <Text>LP Fee</Text>
                    </Flex>

                    <Flex w="200px" textAlign="left">
                      <Text>From</Text>
                    </Flex>
                    <Flex w="180px" textAlign="left">
                      <Text>To</Text>
                    </Flex>

                    <Flex w="180px" textAlign="left">
                      <Text>Txn Hash</Text>
                    </Flex>
                    <Flex w="140px" textAlign="left">
                      <Text>Status</Text>
                    </Flex>
                    <Flex w="160px" textAlign="left">
                      <Text>Timestamp</Text>
                    </Flex>
                  </Flex>
                </Flex>

                {/* Data Rows */}
                <Flex
                  direction="column"
                  sx={{
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                    "-ms-overflow-style": "none",
                    "scrollbar-width": "none",
                  }}
                  overflow="scroll"
                >
                  {activityData.map((order, index) => (
                    <Flex
                      align="start"
                      py="10px"
                      w="100%"
                      textAlign={"left"}
                      fontSize={"14px"}
                      borderTop={index != 0 ? "1px solid #333" : "none"}
                    >
                      <Flex ml="33px" w="85px">
                        {order.asset == "WBTC" && <WBTCSVG />}
                        {order.asset == "BTC" && <BTCSVG />}
                      </Flex>
                      <Flex
                        w="125px"
                        color={colors.offerWhite}
                        textAlign="left"
                        cursor={"pointer"}
                        userSelect={"none"}
                        onClick={() =>
                          copyToClipboard(order.amount, "Amount copied")
                        }
                      >
                        <Tooltip
                          fontFamily={"Aux"}
                          letterSpacing={"-0.5px"}
                          color={colors.textGray}
                          bg={"#121212"}
                          fontSize={"12px"}
                          label="Copy full amount"
                          aria-label="A tooltip"
                        >
                          {formatAmount(order.amount)}
                        </Tooltip>
                      </Flex>

                      <Flex
                        w="85px"
                        textAlign="left"
                        color={colors.textGray}
                        cursor={"pointer"}
                        userSelect={"none"}
                        onClick={() =>
                          copyToClipboard(order.lp_fee, "LP Fee copied")
                        }
                      >
                        <Tooltip
                          fontFamily={"Aux"}
                          letterSpacing={"-0.5px"}
                          color={colors.textGray}
                          bg={"#121212"}
                          fontSize={"12px"}
                          label="Copy full amount"
                          aria-label="A tooltip"
                        >
                          {parseFloat(order.lp_fee).toFixed(2) + "%"}
                        </Tooltip>
                      </Flex>

                      <Flex
                        w="200px"
                        textAlign="left"
                        cursor={"pointer"}
                        userSelect={"none"}
                        onClick={() =>
                          copyToClipboard(order.from_address, "Address copied")
                        }
                      >
                        <Tooltip
                          fontFamily={"Aux"}
                          letterSpacing={"-0.5px"}
                          color={colors.textGray}
                          bg={"#121212"}
                          fontSize={"12px"}
                          label="Copy address"
                          aria-label="A tooltip"
                        >
                          <Text color={colors.offerWhite} mr="19px">
                            {formatAddress(order.from_address)}
                          </Text>
                        </Tooltip>
                        {order.asset == "BTC" ? (
                          <BTCArrow />
                        ) : order.asset == "WBTC" ? (
                          <BTCArrow />
                        ) : (
                          <ETHArrow />
                        )}
                      </Flex>
                      <Flex
                        w="180px"
                        textAlign="left"
                        cursor={"pointer"}
                        userSelect={"none"}
                        onClick={() =>
                          copyToClipboard(order.to_address, "Address copied")
                        }
                      >
                        <Tooltip
                          fontFamily={"Aux"}
                          letterSpacing={"-0.5px"}
                          color={colors.textGray}
                          bg={"#121212"}
                          fontSize={"12px"}
                          label="Copy address"
                          aria-label="A tooltip"
                        >
                          <Text color={colors.offerWhite}>
                            {formatAddress(order.to_address)}
                          </Text>
                        </Tooltip>
                      </Flex>
                      <Flex
                        w="180px"
                        textAlign="left"
                        cursor={"pointer"}
                        userSelect={"none"}
                        onClick={() =>
                          copyToClipboard(order.txn_hash, "TXN hash copied")
                        }
                      >
                        <Tooltip
                          fontFamily={"Aux"}
                          letterSpacing={"-0.5px"}
                          color={colors.textGray}
                          bg={"#121212"}
                          fontSize={"12px"}
                          label="Copy TXN hash"
                          aria-label="A tooltip"
                        >
                          <Text color={colors.textGray}>
                            {formatAddress(order.txn_hash)}
                          </Text>
                        </Tooltip>
                      </Flex>
                      <Flex w="140px" textAlign="left">
                        <Flex mt="3px" mr="5px">
                          {order.status == "Completed" && <GreenCheck />}
                        </Flex>
                        <Text
                          ml={order.status != "Completed" ? "-6px" : ""}
                          userSelect={"none"}
                          color={
                            order.status == "Completed"
                              ? "#238739"
                              : colors.textGray
                          }
                        >
                          {order.status}
                        </Text>
                      </Flex>
                      <Flex w="160px" textAlign="left">
                        <Text color={colors.offerWhite}>
                          {timeAgo(order.timestamp)}
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            </Flex>
          ) : (
            <></>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

const copyToClipboard = (content: string, successText?: string | undefined) => {
  const text = successText
    ? successText
    : "Contract address copied to clipboard.";
  navigator.clipboard.writeText(content);
  toastSuccess({ title: text });
};

function formatAmount(amount) {
  const num = parseFloat(amount);
  const numStr = num.toString();
  const decimalIndex = numStr.indexOf(".");
  if (decimalIndex !== -1) {
    const decimalPlaces = numStr.length - decimalIndex - 1;
    if (decimalPlaces > 6) {
      return num.toFixed(6);
    }
  }
  return numStr;
}

const formatAddress = (address) => {
  return `${address.slice(0, 7)}...${address.slice(-5)}`;
};

const timeAgo = (unixTimestamp) => {
  const seconds = Math.floor(
    // @ts-ignore
    (new Date() - new Date(unixTimestamp * 1000)) / 1000
  );

  let interval = seconds / 86400; // days
  if (interval >= 1) {
    const days = Math.floor(interval);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  interval = seconds / 3600; // hours
  if (interval >= 1) {
    const hours = Math.floor(interval);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  interval = seconds / 60; // minutes
  if (interval >= 1) {
    const minutes = Math.floor(interval);
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }

  return seconds === 1 ? "1 second ago" : `${Math.floor(seconds)} seconds ago`;
};

export default Activity;
