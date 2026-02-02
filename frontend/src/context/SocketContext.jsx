import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Derive socket URL from VITE_API_BASE_URL or default to localhost
        // API_BASE_URL typically ends with /api, we need the root
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
        const socketUrl = apiBaseUrl.replace('/api', '');

        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ['polling', 'websocket'], // Start with polling then upgrade to websocket
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            timeout: 20000, // Increase connection timeout to 20s
        });

        setSocket(newSocket);

        // Debug connection
        newSocket.on('connect', () => {
            console.log('Socket Connected:', newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err);
        });

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
