'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/lib/hooks';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socketRef = useRef<Socket | null>(null);
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Only connect if authenticated and no existing connection
        if (isAuthenticated && user && !socketRef.current) {
            socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000', {
                withCredentials: true, // Send cookies to backend for auth
                transports: ['websocket'], // Force WebSocket for performance
                query: {
                    userId: user._id
                }
            });

            socketRef.current.on('connect', () => {
                console.log('🚀 Socket Connected:', socketRef.current?.id);
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('❌ Socket Connection Error:', err.message);
            });
        }

        // Cleanup: Disconnect when user logs out or component unmounts
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);