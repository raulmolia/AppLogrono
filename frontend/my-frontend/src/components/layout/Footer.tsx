"use client"

import { useState, useEffect } from 'react';

const Clock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const formattedDate = currentTime.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const formattedTime = currentTime.toLocaleTimeString('es-ES');

    return (
        <div className="text-right">
            <div>{formattedDate}</div>
            <div>{formattedTime}</div>
        </div>
    );
};


const Footer = () => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <footer className="bg-white text-black p-4 border-t border-gray-200">
            <div className="container mx-auto flex justify-between items-center">
                <span>© {new Date().getFullYear()} Escolapios Logroño</span>
                {isClient ? <Clock /> : <div className="text-right" style={{ height: '40px' }}></div>}
            </div>
        </footer>
    );
};

export default Footer; 