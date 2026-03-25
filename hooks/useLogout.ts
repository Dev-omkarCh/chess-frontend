import { useState } from "react";
import { logoutUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { clearAuth } from "@/redux/authSlice";
import toast from "react-hot-toast";

export const useLogout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await logoutUser();
            dispatch(clearAuth());
            return result;
        } catch (err: any) {
            console.log("Logout Failed : ", err);
            toast.error(err?.response?.data?.message || "Logout failed");
            setError(err.response?.data?.message || "Logout failed");
        } finally {
            setIsLoading(false);
            router.push("/login");
        }
    };

    return { handleLogout, isLoading, error };
};