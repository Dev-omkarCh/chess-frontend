import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/authSlice';
import gameSlice from '@/redux/gameSlice';
import notificationSlice from '@/redux/notificationSlice';
import socialSlice from '@/redux/socialSlice';


// makeStore ensures a fresh store is created per request
export const makeStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            game: gameSlice,
            notification: notificationSlice,
            social: socialSlice,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                // Disabling serializableCheck is common in gaming/socket apps
                // to allow storing non-plain objects if absolutely necessary.
                serializableCheck: false,
            }),
    });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];