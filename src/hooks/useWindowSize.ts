import { useState, useEffect } from 'react';

const useWindowSize = () => {
    const [isWindowValid, setIsWindowValid] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    const isLargeDesktop = windowSize.width > 1920;
    const isLaptop = windowSize.width <= 1920;
    const isSmallLaptop = windowSize.width < 1200;
    const isTablet = windowSize.width < 1000;
    const isSmallTablet = windowSize.width < 700;
    const isMobile = windowSize.width < 600;
    const isSmallMobile = windowSize.width < 440;

    const isMonoScroll = isTablet;

    const contentWidth = isSmallTablet ? '100%' : '80%';

    const scaleToSize = <T>(isLargeDesktopSize: T, isLaptopSize: T, isSmallLaptopSize: T, isTabletSize: T, isSmallTabletSize: T, isMobileSize: T) => {
        if (isMobile) return isMobileSize;
        if (isSmallTablet) return isSmallTabletSize;
        if (isTablet) return isTabletSize;
        if (isSmallLaptop) return isSmallLaptopSize;
        if (isLaptop) return isLaptopSize;
        else return isLargeDesktopSize;
    };

    const scaleFontSize = <T>(isLargeDesktopSize: T, isLaptopSize: T, isTabletSize: T) => {
        if (isLargeDesktop) return isLargeDesktopSize;
        if (isLaptop) return isLaptopSize;
        else return isTabletSize;
    };

    const standardFontSize = scaleFontSize('1.2rem', '1.1rem', '1rem');

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            // setIsWindowValid(true);
        };

        handleResize();
        setIsWindowValid(true);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        isWindowValid,
        windowSize,
        scaleToSize,
        scaleFontSize,
        isLargeDesktop,
        isLaptop,
        isSmallLaptop,
        isTablet,
        isSmallTablet,
        isMobile,
        isSmallMobile,
        contentWidth,
        standardFontSize,
        isMonoScroll,
    };
};

export default useWindowSize;
