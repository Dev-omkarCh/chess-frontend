import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    _id: string;
    fullName: string,
    username: string;
    email: string;
    profilePicture: string,
    bio: string,
    role: string,
    gender: "male" | "female" | "other",
    friends: string[],
    isVerified: boolean,
    elo: number,
    lastLogin: string,
    createdAt: string,
    updatedAt: string,
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: true, // Start as true to prevent "flicker" during session check
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
        },
        clearAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setAuth, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;