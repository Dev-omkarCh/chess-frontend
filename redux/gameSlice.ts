import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
    isSearching: boolean;
    activeGameId: string | null;
    queueStartTime: number | null;
    onlineUsers: number;
    usersInQueue: number;
    color: 'w' | 'b' | null;
    white: string | null;
    black: string | null;
    history: string[];
    fen: string;
}

const initialState: GameState = {
    isSearching: false,
    activeGameId: null,
    queueStartTime: null,
    onlineUsers: 0,
    usersInQueue: 0,
    color: null,
    white: null,
    black: null,
    history: [],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        startSearching: (state) => {
            state.isSearching = true;
            state.queueStartTime = Date.now();
        },
        stopSearching: (state) => {
            state.isSearching = false;
            state.queueStartTime = null;
        },
        setGameFound: (state, action: PayloadAction<string>) => {
            state.isSearching = false;
            state.activeGameId = action.payload;
        },
        setStats: (state, action) => {
            state.onlineUsers = action.payload.onlineCount;
            state.usersInQueue = action.payload.inQueueCount;
        },
        setGameState: (state, action) => {
            const { white, black, color, history, fen } = action.payload;
            state.white = white;
            state.black = black;
            state.color = color;
            state.history = history;
            state.fen = fen;
        }
    },
});

export const { startSearching, stopSearching, setGameFound, setStats, setGameState } = gameSlice.actions;
export default gameSlice.reducer;