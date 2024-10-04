import { toastSuccess } from "../hooks/toast";

export const formatAddress = (address) => {
    return `${address.slice(0, 7)}...${address.slice(-5)}`;
};

export const copyToClipboard = (content: string, successText?: string | undefined) => {
    const text = successText ? successText : 'Contract address copied to clipboard.';
    navigator.clipboard.writeText(content);
    toastSuccess({ title: text });
};
