import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';

interface SocketState {
    socket: Socket | null;
    isSocketConnected: boolean
}

const initialState: SocketState = {
    socket: null,
    isSocketConnected: false;
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setSocket: (state, action: PayloadAction<Socket>) => {
            state.socket = action.payload;
            state.isSocketConnected = action.payload.connected;
        },
    },
});

export const { setSocket } = gameSlice.actions;
export default gameSlice.reducer;