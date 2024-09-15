import React from 'react';

const GooSpinner = ({ size = 200, color = '#6B46C1' }) => {
    return (
        <div style={{ width: size, height: size, position: 'relative', marginTop: '-10px' }}>
            <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                    <filter id='goo'>
                        <feGaussianBlur in='SourceGraphic' stdDeviation='10' result='blur' />
                        <feColorMatrix in='blur' mode='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7' result='goo' />
                        <feBlend in='SourceGraphic' in2='goo' />
                    </filter>
                </defs>
            </svg>
            <div className='spinner-container' style={{ filter: 'url(#goo)' }}>
                <div className='orb orb1'></div>
                <div className='orb orb2'></div>
            </div>
            <style jsx>{`
                .spinner-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    animation: rotate 10s linear infinite;
                }
                .orb {
                    position: absolute;
                    width: ${size * 0.4}px;
                    height: ${size * 0.4}px;
                    border-radius: 50%;
                    background-color: ${color};
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                .orb1 {
                    animation: moveOrb1 2.4s ease-in-out infinite;
                }
                .orb2 {
                    animation: moveOrb2 2.4s ease-in-out infinite;
                }
                @keyframes rotate {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                @keyframes moveOrb1 {
                    0%,
                    100% {
                        transform: translate(-50%, -50%) translateX(-${size * 0.3}px);
                    }
                    50% {
                        transform: translate(-50%, -50%) translateX(${size * 0.3}px);
                    }
                }
                @keyframes moveOrb2 {
                    0%,
                    100% {
                        transform: translate(-50%, -50%) translateX(${size * 0.3}px);
                    }
                    50% {
                        transform: translate(-50%, -50%) translateX(-${size * 0.3}px);
                    }
                }
            `}</style>
        </div>
    );
};

export default GooSpinner;
