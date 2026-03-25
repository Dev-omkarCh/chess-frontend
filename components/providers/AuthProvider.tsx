'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
        console.error("Missing Google Client ID in Environment Variables");
    }
    return (
        <GoogleOAuthProvider clientId={clientId || ""}>
            {children}
        </GoogleOAuthProvider>
    );
}