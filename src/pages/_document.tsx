import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
    return (
        <Html lang='en'>
            <Head>
                {/* Google Analytics */}
                {/* <Script src='https://www.googletagmanager.com/gtag/js?id=G-BLG0ELKF6K' strategy='afterInteractive' async />
                <Script id='google-analytics' strategy='afterInteractive'>
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-BLG0ELKF6K');
                    `}
                </Script> */}
                {/* Twitter Pixel */}
                {/* <Script src='/twitter-pixel.js' strategy='lazyOnload' /> */}
                <link rel='icon' href='/images/assets/favicon.png' />
                <link rel='preload' href='/fonts/KleinHeadline-BoldOblique.ttf' as='font' type='font/ttf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/AuxMono.otf' as='font' type='font/otf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/SF-Pro-Display-Bold.otf' as='font' type='font/otf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/NostromoRegular-Bold.otf' as='font' type='font/otf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/CutiveMono-Regular.ttf' as='font' type='font/otf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/SometypeMono-VariableFont_wght.ttf' as='font' type='font/otf' crossOrigin='anonymous' />
            </Head>

            <body style={{ background: 'black' }}>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
