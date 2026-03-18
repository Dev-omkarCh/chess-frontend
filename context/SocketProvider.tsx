'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setStats } from '@/redux/gameSlice';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = React.useState<Socket | null>(null);
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    useEffect(() => {
        let newSocket: Socket | null = null;

        if (isAuthenticated && user?._id && !socket) {
            newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000', {
                withCredentials: true,
                transports: ['websocket'],
                query: { userId: user._id }
            });

            newSocket.on('connect', () => {
                console.log('🚀 Socket Connected:', newSocket?.id);
                // Move setSocket inside the connect event to ensure 
                // components only get a VALID, connected socket.
                setSocket(newSocket);
            });

            newSocket.on('match:update-stats', (data: { onlineUsers: number; usersInQueue: number }) => {
                console.log('[Socket] Match stats updated:', data);
                dispatch(setStats(data));
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Socket Connection Error:', err.message);
            });
        }

        return () => {
            // Use the local variable to ensure we disconnect the right one
            if (newSocket) {
                newSocket.disconnect();
                setSocket(null);
            }
        };
        // Removed 'socket' from dependencies to prevent infinite loops
    }, [isAuthenticated, user, dispatch]);

    return (
        <SocketContext.Provider value={{ socket: socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);