import apiClient from "@/api/axois";
import { LoginUser, SignupUser } from "@/app/(auth)/type";

export const signupUser = async (userData: SignupUser) => {
    const response = await apiClient.post("/api/auth/signup", userData);
    return response.data;
};

export const loginUser = async (userData: LoginUser) => {
    const response = await apiClient.post("/api/auth/login", userData);
    return response.data.data;
}

export const logoutUser = async () => {
    const response = await apiClient.post("/api/auth/logout");
    return response.data.data;
}