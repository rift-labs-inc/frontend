import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export function useSafeWagmi() {
    const [isWagmiReady, setIsWagmiReady] = useState(false);

    useEffect(() => {
        setIsWagmiReady(true);
    }, []);

    const useAccountSafe = () => {
        const account = useAccount();
        if (!isWagmiReady) {
            return { address: undefined, isConnected: false };
        }
        return account;
    };

    return {
        isWagmiReady,
        useAccountSafe,
    };
}
