import { useState } from "react";
import { signupUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { SignupUser } from "@/app/(auth)/type";
import toast from "react-hot-toast";

export const useSignup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSignup = async (data: SignupUser) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await signupUser(data);
            router.push("/dashboard");
            return result;
        } catch (err: any) {
            console.log(err?.response);
            toast.error(err?.response?.data?.message || "Signup failed");
            setError(err.response?.data?.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return { handleSignup, isLoading, error };
};