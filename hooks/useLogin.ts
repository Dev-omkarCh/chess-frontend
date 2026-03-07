import { useState } from "react";
import { loginUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { LoginUser } from "@/app/(auth)/type";
import { useAppDispatch } from "@/lib/hooks";
import { setAuth } from "@/redux/authSlice";
import toast from "react-hot-toast";

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleLogin = async (data: LoginUser) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await loginUser(data);
            dispatch(setAuth(result.user));
            router.push("/dashboard");
            return result;
        } catch (err: any) {
            console.log("Login Failed : ", err);
            toast.error(err?.response?.data?.message || "Login failed");
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return { handleLogin, isLoading, error };
};