export const formatAddress = (address) => {
    return `${address.slice(0, 7)}...${address.slice(-5)}`;
};
