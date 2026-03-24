import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { IFriendship } from '@/types/social';
import axios from 'axios';

interface SocialState {
    friends: IFriendship[];
    pendingRequests: IFriendship[];
    onlineFriendIds: string[];
    isLoading: boolean;
    error: string | null;
}

const initialState: SocialState = {
    friends: [],
    pendingRequests: [],
    onlineFriendIds: [],
    isLoading: false,
    error: null,
};

// Industry Standard: Using AsyncThunks for API calls
export const fetchSocialData = createAsyncThunk(
    'social/fetchData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/v1/friends/my-network');
            return response.data; // Expected { friends: [], pending: [] }
        } catch (err: any) {
            return rejectWithValue(err.response.data.message || 'Failed to fetch social data');
        }
    }
);

const socialSlice = createSlice({
    name: 'social',
    initialState,
    reducers: {
        // Synchronous update for real-time Socket events
        setFriendOnline: (state, action: PayloadAction<string>) => {
            if (!state.onlineFriendIds.includes(action.payload)) {
                state.onlineFriendIds.push(action.payload);
            }
        },
        setFriendOffline: (state, action: PayloadAction<string>) => {
            state.onlineFriendIds = state.onlineFriendIds.filter(id => id !== action.payload);
        },
        incomingRequest: (state, action: PayloadAction<IFriendship>) => {
            state.pendingRequests.unshift(action.payload);
        },
        removePendingRequest: (state, action: PayloadAction<string>) => {
            state.pendingRequests = state.pendingRequests.filter(req => req._id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSocialData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSocialData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.friends = action.payload.friends;
                state.pendingRequests = action.payload.pending;
            })
            .addCase(fetchSocialData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setFriendOnline, setFriendOffline, incomingRequest, removePendingRequest } = socialSlice.actions;
export default socialSlice.reducer;