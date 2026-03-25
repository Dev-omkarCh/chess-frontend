import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { INotification } from '@/types/social';

interface NotificationState {
    toastStack: INotification[]; // Handling multiple notifications if they come fast
}

const initialState: NotificationState = {
    toastStack: [],
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        // Pushes new notification to the front [0]
        pushNotification: (state, action: PayloadAction<INotification>) => {
            state.toastStack.unshift(action.payload);
        },
        // Dismisses a specific notification
        dismissNotification: (state, action: PayloadAction<string>) => {
            state.toastStack = state.toastStack.filter(n => n._id !== action.payload);
        },
        // Clear all (useful for logout)
        clearAllNotifications: (state) => {
            state.toastStack = [];
        }
    },
});

export const { pushNotification, dismissNotification, clearAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;