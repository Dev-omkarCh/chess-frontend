import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Friend, FriendOnlineStatus, IFriendship } from '@/types/social';
import axios from 'axios';

interface SocialState {
    friends: Friend[];
    pendingRequests: IFriendship[];
    onlineFriendData: string[];
    isLoading: boolean;
    error: string | null;
}

const initialState: SocialState = {
    friends: [],
    pendingRequests: [],
    onlineFriendData: [],
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

        setFriends: (state, action: PayloadAction<Friend[]>) => {
            state.friends = action.payload;
        },

        // Synchronous update for real-time Socket events
        setFriendOnline: (state, action: PayloadAction<FriendOnlineStatus[]>) => {
            const onlineUpdateList = action.payload;

            // Create a Set of online IDs for O(1) lookup speed
            const onlineIds = new Set(onlineUpdateList.map(f => f._id));

            // Update the existing friends list
            state.friends.forEach(friend => {
                if (onlineIds.has(friend._id.toString())) {
                    friend.isOnline = onlineUpdateList.find(f => f._id.toString() === friend._id.toString())?.isOnline || false;
                    // Also update isPlaying if it exists in your payload
                    // const statusData = onlineUpdateList.find(o => o._id === friend._id.toString());
                    // friend.isPlaying = statusData?.isPlaying || false;
                }
            });
        },
        setFriendOffline: (state, action: PayloadAction<string>) => {
            state.onlineFriendData = state.onlineFriendData.filter(id => id !== action.payload);
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

export const { setFriendOnline, setFriendOffline, incomingRequest, removePendingRequest, setFriends } = socialSlice.actions;
export default socialSlice.reducer;