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
                  mt="-3px"
                  mr="4px"
                  children={<FaSearch color={"#888"} />}
                />
              </InputGroup>
            </Flex>
            <Flex
              ml="6px"
              w="190px"
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
              <Text
                fontFamily={"Aux"}
                fontWeight={"normal"}
                ml="14.5px"
                color={!showMyActivity ? colors.textGray : colors.offWhite}
                fontSize={"14px"}
                mr="9px"
                mt="1px"
              >
                My Activity
              </Text>
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
                    <Flex w="170px" textAlign="left">
                      <Text>Timestamp</Text>
                    </Flex>
                    <Flex w="180px" textAlign="left">
                      <Text>Txn Hash</Text>
                    </Flex>
                    <Flex w="200px" textAlign="left">
                      <Text>From</Text>
                    </Flex>
                    <Flex w="180px" textAlign="left">
                      <Text>To</Text>
                    </Flex>
                    <Flex w="85px" textAlign="left">
                      <Text>LP Fee</Text>
                    </Flex>
                    <Flex w="125px" textAlign="left">
                      <Text>Amount</Text>
                    </Flex>
                    <Flex w="85px" textAlign="left">
                      <Text>Asset</Text>
                    </Flex>
                    <Flex w="100px" textAlign="left">
                      <Text>Status</Text>
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
                      <Flex ml="33px" w="170px" textAlign="left">
                        <Text color={colors.offerWhite}>
                          {timeAgo(order.timestamp)}
                        </Text>
                      </Flex>
                      <Flex w="180px" textAlign="left">
                        <Text color={colors.textGray}>
                          {formatAddress(order.txn_hash)}
                        </Text>
                      </Flex>
                      <Flex w="200px" textAlign="left">
                        <Text color={colors.offerWhite} mr="19px">
                          {formatAddress(order.from_address)}
                        </Text>
                        {order.asset == "BTC" && <BTCArrow />}
                        {order.asset == "ETH" && <ETHArrow />}
                      </Flex>
                      <Flex w="180px" textAlign="left">
                        <Text color={colors.offerWhite}>
                          {formatAddress(order.to_address)}
                        </Text>
                      </Flex>
                      <Flex
                        w="85px"
                        textAlign="left"
                        cursor={"pointer"}
                        userSelect={"none"}
                        color={colors.textGray}
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
                      <Flex w="85px">
                        {order.asset == "ETH" && <ETHSVG />}
                        {order.asset == "BTC" && <BTCSVG />}
                      </Flex>
                      <Flex w="100px" textAlign="left">
                        <Flex mt="3px" mr="5px">
                          {order.status == "Completed" && <GreenCheck />}
                        </Flex>
                        <Text
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
  return `0x${address.slice(2, 7)}...${address.slice(-5)}`;
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

const BTCSVG = () => {
  return (
    <svg
      width="100"
      height="20"
      viewBox="0 0 200 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="17.5991"
        y="2.90579"
        width="110.58"
        height="40.1668"
        rx="10.5004"
        fill="url(#paint0_linear_4628_619)"
        stroke="#FFA04C"
        stroke-width="2.48735"
      />
      <path
        d="M45.8659 28.4175C42.8085 40.6832 30.3814 48.1393 18.1333 45.0816C5.86728 42.0242 -1.58885 29.5976 1.46879 17.3497C4.52626 5.08408 16.9353 -2.37206 29.2013 0.685592C41.4494 3.72518 48.9236 16.1517 45.8659 28.4175Z"
        fill="url(#paint1_linear_4628_619)"
      />
      <path
        d="M34.563 20.032C35.01 16.9928 32.7037 15.348 29.5215 14.2575L30.5584 10.1277L28.0555 9.50198L27.0543 13.5245C26.3929 13.3636 25.7135 13.2027 25.0341 13.0597L26.0353 9.01928L23.5324 8.39355L22.5134 12.5055C21.9592 12.3803 21.4228 12.2552 20.9044 12.13V12.1121L17.4361 11.254L16.7746 13.9357C16.7746 13.9357 18.6339 14.3648 18.5981 14.3826C19.6172 14.6329 19.7959 15.3123 19.7602 15.8486L18.5802 20.5505C18.6518 20.5684 18.7411 20.5862 18.8484 20.6399C18.759 20.622 18.6696 20.6041 18.5802 20.5684L16.9355 27.1474C16.8103 27.4513 16.4885 27.9162 15.7913 27.7374C15.8092 27.7731 13.9678 27.2904 13.9678 27.2904L12.7163 30.1688L15.988 30.9912C16.5958 31.1521 17.1858 31.2951 17.7757 31.456L16.7388 35.6215L19.2417 36.2472L20.2786 32.1175C20.958 32.2962 21.6374 32.475 22.281 32.6359L21.2619 36.7478L23.7648 37.3735L24.8017 33.208C29.0924 34.0125 32.3104 33.6907 33.6513 29.8112C34.7418 26.7005 33.5976 24.8948 31.345 23.7149C33.0077 23.3394 34.2412 22.2489 34.563 20.032ZM28.8242 28.0771C28.0555 31.1878 22.7994 29.5073 21.101 29.0782L22.4776 23.554C24.176 23.983 29.6466 24.8233 28.8242 28.0771ZM29.6109 19.9784C28.8958 22.821 24.5336 21.3729 23.1212 21.0153L24.3727 16.0095C25.785 16.3671 30.3439 17.0286 29.6109 19.9784Z"
        fill="white"
      />
      <path
        d="M57.5105 31L57.1936 30.6831V14.2308L57.5105 13.9383H70.1605L72.5979 16.3757V20.0074L70.4774 22.5179V22.6398L72.5979 25.1259V28.5626L70.1605 31H57.5105ZM60.3622 21.3724H68.3812L69.4293 20.0318V17.8625L68.3325 16.7657H60.3622V21.3724ZM60.3622 28.1726H68.3325L69.4293 27.0758V25.004L68.3812 23.6635H60.3622V28.1726ZM77.2904 16.7901L76.9735 14.2552L77.2904 13.9383H91.5247L91.8172 14.2552L91.5003 16.7901L91.1347 17.1069H85.9918V30.7075L85.675 31.0244H83.1401L82.8232 30.7075V17.1069H77.656L77.2904 16.7901ZM109.16 13.9383L111.597 16.3757V18.935L111.28 19.2275H108.745L108.428 18.935V17.9113L107.283 16.7657H100.458L99.3612 17.8625V27.0758L100.458 28.1726H107.283L108.428 27.0271V26.0034L108.745 25.7109H111.28L111.597 26.0034V28.5626L109.16 31H98.63L96.1926 28.5626V16.3757L98.63 13.9383H109.16Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4628_619"
          x1="72.8891"
          y1="1.66211"
          x2="72.8891"
          y2="44.3162"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#C16C21" />
          <stop offset="1" stop-color="#C46816" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_4628_619"
          x1="2287.91"
          y1="-1.09841"
          x2="2287.91"
          y2="4576.27"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#F9AA4B" />
          <stop offset="1" stop-color="#F7931A" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const ETHSVG = () => {
  return (
    <svg
      width="100"
      height="20"
      viewBox="0 0 200 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="18.2759"
        y="2.91067"
        width="108.549"
        height="40.8438"
        rx="10.5004"
        fill="url(#paint0_linear_4628_625)"
        stroke="#627EEA"
        stroke-width="2.48735"
      />
      <path
        d="M45.0827 28.6504C42.0253 40.9161 29.5982 48.3722 17.3501 45.3146C5.08408 42.2571 -2.37206 29.8306 0.685591 17.5826C3.74306 5.31699 16.1521 -2.13915 28.4181 0.918502C40.6662 3.95809 48.1404 16.3846 45.0827 28.6504Z"
        fill="url(#paint1_linear_4628_625)"
      />
      <path
        d="M33.7793 20.2649C34.2263 17.2257 31.92 15.5809 28.7378 14.4904L29.7747 10.3606L27.2718 9.73489L26.2707 13.7574C25.6092 13.5965 24.9298 13.4356 24.2505 13.2926L25.2516 9.25219L22.7487 8.62646L21.7297 12.7384C21.1755 12.6132 20.6391 12.4881 20.1207 12.3629V12.3451L16.6524 11.4869L15.9909 14.1686C15.9909 14.1686 17.8502 14.5977 17.8144 14.6155C18.8335 14.8658 19.0122 15.5452 18.9765 16.0815L17.7965 20.7834C17.8681 20.8013 17.9575 20.8192 18.0647 20.8728C17.9753 20.8549 17.8859 20.837 17.7965 20.8013L16.1518 27.3803C16.0266 27.6843 15.7048 28.1491 15.0076 27.9703C15.0255 28.0061 13.1841 27.5233 13.1841 27.5233L11.9326 30.4017L15.2043 31.2241C15.8121 31.385 16.4021 31.528 16.992 31.6889L15.9551 35.8544L18.458 36.4802L19.4949 32.3504C20.1743 32.5291 20.8537 32.7079 21.4973 32.8688L20.4782 36.9807L22.9811 37.6065L24.018 33.4409C28.3087 34.2454 31.5267 33.9236 32.8676 30.0441C33.9581 26.9334 32.8139 25.1277 30.5613 23.9478C32.224 23.5723 33.4575 22.4818 33.7793 20.2649ZM28.0406 28.31C27.2718 31.4207 22.0157 29.7402 20.3173 29.3111L21.6939 23.7869C23.3923 24.2159 28.8629 25.0562 28.0406 28.31ZM28.8272 20.2113C28.1121 23.0539 23.7499 21.6058 22.3375 21.2482L23.589 16.2424C25.0013 16.6 29.5602 17.2615 28.8272 20.2113Z"
        fill="white"
      />
      <path
        d="M22.8836 46.0002C35.5219 46.0002 45.7673 35.7548 45.7673 23.1166C45.7673 10.4783 35.5219 0.23291 22.8836 0.23291C10.2454 0.23291 0 10.4783 0 23.1166C0 35.7548 10.2454 46.0002 22.8836 46.0002Z"
        fill="#627EEA"
      />
      <path
        d="M23.5957 5.95361V18.6397L34.3181 23.431L23.5957 5.95361Z"
        fill="white"
        fill-opacity="0.602"
      />
      <path
        d="M23.5959 5.95361L12.8721 23.431L23.5959 18.6397V5.95361Z"
        fill="white"
      />
      <path
        d="M23.5957 31.6521V40.2721L34.3253 25.4277L23.5957 31.6521Z"
        fill="white"
        fill-opacity="0.602"
      />
      <path
        d="M23.5959 40.2721V31.6507L12.8721 25.4277L23.5959 40.2721Z"
        fill="white"
      />
      <path
        d="M23.5957 29.6568L34.3181 23.431L23.5957 18.6426V29.6568Z"
        fill="white"
        fill-opacity="0.2"
      />
      <path
        d="M12.8721 23.431L23.5959 29.6568V18.6426L12.8721 23.431Z"
        fill="white"
        fill-opacity="0.602"
      />
      <path
        d="M56.5105 31L56.1936 30.6831V14.2552L56.5105 13.9383H70.0867L70.4036 14.2552L70.0623 16.4489L69.648 16.7657H59.3622V21.0799H67.8931L68.2099 21.3967L67.8931 23.5904L67.5275 23.9072H59.3622V28.1726H69.6967L70.0623 28.4895L70.4036 30.6831L70.0867 31H56.5105ZM75.1003 16.7901L74.7834 14.2552L75.1003 13.9383H89.3346L89.627 14.2552L89.3102 16.7901L88.9446 17.1069H83.8017V30.7075L83.4849 31.0244H80.95L80.6331 30.7075V17.1069H75.4659L75.1003 16.7901ZM110.065 13.9383L110.382 14.2552V30.6831L110.065 31H107.53L107.213 30.6831V23.8829H97.1711V30.6831L96.8543 31H94.3194L94.0025 30.6831V14.2552L94.3194 13.9383H96.8543L97.1711 14.2552V21.0555H107.213V14.2552L107.53 13.9383H110.065Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4628_625"
          x1="72.5503"
          y1="1.66699"
          x2="72.5503"
          y2="44.9982"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#2E40B7" />
          <stop offset="1" stop-color="#2E45B0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_4628_625"
          x1="2287.13"
          y1="-0.865504"
          x2="2287.13"
          y2="4576.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#F9AA4B" />
          <stop offset="1" stop-color="#F7931A" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const BTCArrow = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M29.2856 17.5001C29.2856 10.9908 24.0092 5.71436 17.4999 5.71435C10.9907 5.71435 5.71422 10.9908 5.71422 17.5001C5.71422 24.0093 10.9907 29.2858 17.4999 29.2858C24.0092 29.2858 29.2856 24.0093 29.2856 17.5001ZM17.5046 12.5006C17.2837 12.7216 17.1596 13.0213 17.1596 13.3338C17.1596 13.6463 17.2837 13.9461 17.5046 14.1671L19.6603 16.3215L12.4993 16.3215C12.1867 16.3215 11.8869 16.4457 11.6659 16.6667C11.4449 16.8877 11.3207 17.1875 11.3207 17.5001C11.3207 17.8126 11.4449 18.1124 11.6659 18.3334C11.8869 18.5545 12.1867 18.6786 12.4993 18.6786L19.6603 18.6786L17.5046 20.8342C17.2837 21.0554 17.1596 21.3553 17.1597 21.6679C17.1598 21.9806 17.2841 22.2803 17.5052 22.5013C17.7264 22.7223 18.0263 22.8464 18.3389 22.8463C18.6515 22.8462 18.9513 22.7219 19.1723 22.5007L23.3386 18.3333C23.5595 18.1123 23.6836 17.8126 23.6836 17.5001C23.6836 17.1876 23.5595 16.8878 23.3386 16.6668L19.1735 12.5006C19.064 12.391 18.9341 12.3041 18.791 12.2447C18.6479 12.1854 18.4945 12.1549 18.3397 12.1549C18.1848 12.1549 18.0314 12.1854 17.8883 12.2447C17.7453 12.3041 17.6153 12.391 17.5058 12.5006L17.5046 12.5006Z"
        fill="#E38E43"
      />
    </svg>
  );
};

const ETHArrow = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M29.2856 17.5001C29.2856 10.9908 24.0092 5.71436 17.4999 5.71435C10.9907 5.71435 5.71422 10.9908 5.71422 17.5001C5.71422 24.0093 10.9907 29.2858 17.4999 29.2858C24.0092 29.2858 29.2856 24.0093 29.2856 17.5001ZM17.5046 12.5006C17.2837 12.7216 17.1596 13.0213 17.1596 13.3338C17.1596 13.6463 17.2837 13.9461 17.5046 14.1671L19.6603 16.3215L12.4993 16.3215C12.1867 16.3215 11.8869 16.4457 11.6659 16.6667C11.4449 16.8877 11.3207 17.1875 11.3207 17.5001C11.3207 17.8126 11.4449 18.1124 11.6659 18.3334C11.8869 18.5545 12.1867 18.6786 12.4993 18.6786L19.6603 18.6786L17.5046 20.8342C17.2837 21.0554 17.1596 21.3553 17.1597 21.6679C17.1598 21.9806 17.2841 22.2803 17.5052 22.5013C17.7264 22.7223 18.0263 22.8464 18.3389 22.8463C18.6515 22.8462 18.9513 22.7219 19.1723 22.5007L23.3386 18.3333C23.5595 18.1123 23.6836 17.8126 23.6836 17.5001C23.6836 17.1876 23.5595 16.8878 23.3386 16.6668L19.1735 12.5006C19.064 12.391 18.9341 12.3041 18.791 12.2447C18.6479 12.1854 18.4945 12.1549 18.3397 12.1549C18.1848 12.1549 18.0314 12.1854 17.8883 12.2447C17.7453 12.3041 17.6153 12.391 17.5058 12.5006L17.5046 12.5006Z"
        fill="#627EEA"
      />
    </svg>
  );
};

const GreenCheck = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 31 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="15.5" cy="15.5" r="15.5" fill="#238739" />
      <path
        d="M12.9752 17.9367L9.83105 14.7809L8.48096 16.136L12.9752 20.6469L22.2435 11.3443L20.8934 9.98926L12.9752 17.9367Z"
        fill="#E6E6E6"
      />
    </svg>
  );
};

export default Activity;
