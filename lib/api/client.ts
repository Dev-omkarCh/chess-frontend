import axios, { AxiosError } from 'axios';

/**
 * One shared axios instance for the whole app.
 *
 * .env.local:
 *   NEXT_PUBLIC_API_URL=http://localhost:5000
 *
 * If you already have an axios instance (for auth, etc.), delete this file and
 * import yours in `dashboard.api.ts` instead.
 */
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
    timeout: 10_000,
    // Sends your httpOnly auth cookie. If your backend uses Bearer tokens
    // instead, attach the token in a request interceptor.
    withCredentials: true,
    headers: { Accept: 'application/json' },
});

/** Every failed request is turned into one of these, so the UI never deals with raw axios errors. */
export class ApiError extends Error {
    readonly status?: number;
    readonly code?: string;

    constructor(message: string, status?: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

api.interceptors.response.use(
    response => response,
    (error: AxiosError<{ message?: string; code?: string }>) => {
        // Cancelled requests (component unmounted, source switched) are not errors.
        if (axios.isCancel(error)) return Promise.reject(error);

        const serverMessage = error.response?.data?.message;
        const message =
            serverMessage ??
            (error.code === 'ECONNABORTED'
                ? 'The request timed out. Please try again.'
                : !error.response
                    ? 'Cannot reach the server. Check your connection.'
                    : 'Something went wrong. Please try again.');

        return Promise.reject(new ApiError(message, error.response?.status, error.response?.data?.code));
    }
);

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return 'Something went wrong. Please try again.';
}

export function isAbort(error: unknown): boolean {
    return axios.isCancel(error) || (error instanceof DOMException && error.name === 'AbortError');
}