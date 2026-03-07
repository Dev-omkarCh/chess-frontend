import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/authSlice';

// makeStore ensures a fresh store is created per request
export const makeStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            // Add more slices (like gameSlice) here as you grow
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