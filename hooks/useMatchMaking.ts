import { useSocket } from "@/context/SocketProvider";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { startSearching, stopSearching } from "@/redux/gameSlice";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export const useMatchMaking = () => {
    const { socket } = useSocket();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isSearching = useAppSelector((state: RootState) => state.game.isSearching);

    useEffect(() => {
        if (!socket) return;

        console.log('[Socket] ✅ Matchmaking Listeners Active:', socket.id);

        socket.on('match:found', ({ gameId }) => {
            dispatch(stopSearching());
            router.push(`/chess/${gameId}`);
        });

        return () => {
            socket.off('match:found');
        };
    }, [socket, dispatch, router]);

    // Use useCallback to ensure the function "refreshes" when socket changes
    const joinQueue = useCallback((preferences = { timeControl: '10m' }) => {
        if (!socket) {
            console.log('[MatchMaking] ❌ Cannot join: Socket not connected yet');
            return;
        }
        dispatch(startSearching());
        socket.emit('match:queue-join', preferences);
    }, [socket, dispatch]); // Re-creates function when socket is no longer null

    const leaveQueue = useCallback(() => {
        if (!socket) return;
        dispatch(stopSearching());
        socket.emit('match:queue-leave');
    }, [socket, dispatch]);

    return { isSearching, joinQueue, leaveQueue, isSocketReady: !!socket };
};