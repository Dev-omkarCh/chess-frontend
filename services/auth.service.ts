import apiClient from "@/api/axois";
import { LoginUser, SignupUser } from "@/app/(auth)/type";

export const signupUser = async (userData: SignupUser) => {
    try {

        const response = await apiClient.post("/auth/signup", userData);
        return response.data;
    }
    catch (error) {
        console.error("Signup error:", error);
        throw error;
    }
};

export const loginUser = async (userData: LoginUser) => {
    try {
        const response = await apiClient.post("/auth/login", userData);
        return response.data.data;
    }
    catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export const logoutUser = async () => {
    try {
        const response = await apiClient.post("/auth/logout");
        return response.data.data;
    }
    catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
}