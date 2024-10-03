import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
    return (
        <Html lang='en'>
            <Head>
                {/* Google Analytics */}
                <Script src='https://www.googletagmanager.com/gtag/js?id=G-BLG0ELKF6K' strategy='afterInteractive' />
                <Script id='google-analytics' strategy='afterInteractive'>
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-BLG0ELKF6K');
                    `}
                </Script>
                {/* Twitter Pixel */}
                {/* <Script src='/twitter-pixel.js' strategy='lazyOnload' /> */}
                
                {/* Favicon and manifest links */}
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                <meta name="msapplication-TileColor" content="#da532c" />
                <meta name="theme-color" content="#ffffff" />
                
                {/* Preload font files */}
                <link rel='preload' href='/fonts/KleinHeadline-BoldOblique.ttf' as='font' type='font/ttf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/AuxMono.otf' as='font' type='font/otf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/SF-Pro-Display-Bold.otf' as='font' type='font/otf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/NostromoRegular-Bold.otf' as='font' type='font/otf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/CutiveMono-Regular.ttf' as='font' type='font/ttf' crossOrigin='anonymous' />
                <link rel='preload' href='/fonts/SometypeMono-VariableFont_wght.ttf' as='font' type='font/ttf' crossOrigin='anonymous' />
            </Head>

            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
