import React from 'react';

const GooSpinner = ({ size = 100, color = '#6B46C1' }) => {
    const ballStyle: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: '50%',
        position: 'absolute',
    };

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <div className='goo-ball' style={ballStyle}></div>
            <div className='goo-ball' style={ballStyle}></div>
            <style jsx>{`
                .goo-ball {
                    animation: spin-and-split 2s infinite ease-in-out;
                }
                .goo-ball:nth-child(1) {
                    animation-delay: 0s;
                }
                .goo-ball:nth-child(2) {
                    animation-delay: 0.5s;
                }

                @keyframes spin-and-split {
                    0% {
                        transform: translate(0, 0) scale(0.5);
                    }
                    25% {
                        transform: translate(-15%, -15%) scale(0.45);
                    }
                    50% {
                        transform: translate(15%, 15%) scale(0.35);
                    }
                    75% {
                        transform: translate(-15%, -15%) scale(0.45);
                    }
                    100% {
                        transform: translate(0, 0) scale(0.5);
                    }
                }
            `}</style>
        </div>
    );
};

export default GooSpinner;
