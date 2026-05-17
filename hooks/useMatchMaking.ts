import { useSocket } from "@/context/SocketProvider";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { startSearching, stopSearching } from "@/redux/gameSlice";
import { MatchPreferences } from "@/types/game";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

interface JoinQueueProps {
    preferences: { timeControl: string, type: string, chatEnabled: boolean };
    userDetails: { elo?: number, username?: string, name?: string };
}

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
    const joinQueue = useCallback(({ preferences, userDetails }: JoinQueueProps) => {
        if (!socket) {
            console.log('[MatchMaking] ❌ Cannot join: Socket not connected yet');
            return;
        }
        dispatch(startSearching());

        if (!userDetails.elo) {
            console.log('[MatchMaking] ❌ Cannot join: User has no ELO');
            return;
        }

        socket.emit('match:queue-join', { preferences, userDetails });
    }, [socket, dispatch]); // Re-creates function when socket is no longer null

    const leaveQueue = useCallback(() => {
        if (!socket) return;
        dispatch(stopSearching());
        socket.emit('match:queue-leave');
    }, [socket, dispatch]);

    return { isSearching, joinQueue, leaveQueue, isSocketReady: !!socket };
};