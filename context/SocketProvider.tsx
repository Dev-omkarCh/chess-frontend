'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setStats } from '@/redux/gameSlice';
import toast from 'react-hot-toast';
import { addNotification, pushNotification } from '@/redux/notificationSlice';
import { Friend, INotification } from '@/types/social';
import { addFriend } from '@/redux/socialSlice';

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

            newSocket.on('notification:new', (data: INotification) => {

                let message = "";

                if (data.type as string === "FRIEND_REQUEST") {
                    message = `New friend request from ${data.sender.username}`;
                }
                if (data.type as string === "FRIEND_REQUEST_ACCEPTED") {
                    message = `${data.sender.username} accepted your friend request`;
                }
                if (data.type as string === "FRIEND_REQUEST_REJECTED") {
                    message = `${data.sender.username} rejected your friend request`;
                }
                const notification: INotification = {
                    _id: data._id,
                    type: data.type,
                    isRead: false,
                    message: message,
                    sender: data.sender,
                    payload: {}, // For redirecting to gameId or profile
                    timestamp: data.timestamp
                }
                if (data.type === "FRIEND_REQUEST") {
                    dispatch(addNotification(notification))
                }
                if (data.type === "FRIEND_REQUEST_ACCEPTED") {
                    console.log("data.payload", data.payload);
                    dispatch(addFriend(data.payload.friend as Friend))
                }
                dispatch(pushNotification(notification))

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