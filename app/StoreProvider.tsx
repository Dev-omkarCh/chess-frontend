"use client"
import apiClient from "@/api/axois";
import { AppStore, makeStore } from "@/lib/store";
import { clearAuth, setAuth, setLoading } from "@/redux/authSlice";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";

export default function StoreProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const storeRef = useRef<AppStore>(undefined);

    if (!storeRef.current) {
        storeRef.current = makeStore();

    }

    useEffect(() => {
        // Only fetch if we don't have a user yet (on initial load/refresh)
        const initAuth = async () => {
            try {
                const response = await apiClient.get('/v1/users/credentials');
                storeRef.current?.dispatch(setAuth(response.data.data));
            } catch (err) {
                storeRef.current?.dispatch(clearAuth());
            } finally {
                storeRef.current?.dispatch(setLoading(false));
            }
        };
        initAuth();
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>
}
