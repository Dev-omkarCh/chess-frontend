import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Extend InternalAxiosRequestConfig to include our custom _retry flag
interface CustomRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: NEXT_PUBLIC_API_URL,
    withCredentials: true
});

// Queue to hold requests while token is refreshing
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomRequestConfig;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Add to queue if refresh is already in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Your backend endpoint that verifies the Refresh Cookie and sends a new Access Token
                await axios.post(
                    `${apiClient.defaults.baseURL}/api/v1/users/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                processQueue(null);

                isRefreshing = false;
                originalRequest._retry = false;

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // If refresh fails, the session is dead. Force logout.
                // window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
                originalRequest._retry = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;