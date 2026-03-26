import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { INotification } from '@/types/social';

interface NotificationState {
    toastStack: INotification[]; // Handling multiple notifications if they come fast
    notifications: INotification[];
}

const initialState: NotificationState = {
    toastStack: [],
    notifications: [],
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {

        setNotifications: (state, action: PayloadAction<INotification[]>) => {
            state.notifications = action.payload;
        },

        addNotification: (state, action: PayloadAction<INotification>) => {
            state.notifications.unshift(action.payload);
        },

        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n._id !== action.payload);
            state.toastStack = state.toastStack.filter(n => n._id !== action.payload);
        },

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

export const { pushNotification, dismissNotification, clearAllNotifications, setNotifications, addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;