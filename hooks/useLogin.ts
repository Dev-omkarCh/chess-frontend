import { useState } from "react";
import { loginUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { LoginUser } from "@/app/(auth)/type";

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (data : LoginUser) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await loginUser(data);
            router.push("/dashboard");
            return result;
        } catch (err : any) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return { handleLogin, isLoading, error };
};