"use client"
import apiClient from "@/api/axois";
import { useAppDispatch } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { clearAuth } from "@/redux/authSlice";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const clearTokens = () => {

    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    const router = useRouter();

    const clearTokens = async () => {
        setLoading(true);
        try {
            await apiClient.post("/v1/users/clear-tokens");
            dispatch(clearAuth());
            router.push("/login");
        } catch (error) {
            toast.error("Failed to clear tokens. Please try again.");
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <div className="bg-background min-h-screen font-sans">
            <section id="play" className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">

                {/* Subtle grid texture */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.018]"
                    style={{
                        backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                        backgroundSize: "56px 56px",
                    }}
                />

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                    {/* Subheading */}
                    <p
                        className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                        style={{ animation: "bc-fadeUp 0.75s ease 0.2s both" }}
                    >
                        Click on th button to clear all tokens and get <em className="text-foreground not-italic font-semibold">logout</em> automatically
                    </p>

                    {/* Clear Button */}
                    <div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                        style={{ animation: "bc-fadeUp 0.75s ease 0.3s both" }}
                    >
                        <button
                            className={cn(
                                "group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md",
                                "text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                                "disabled:opacity-50 disabled:pointer-events-none transition-colors",
                                loading ? "cursor-not-allowed" : "cursor-pointer"

                            )}
                            onClick={clearTokens}
                            disabled={loading}
                        >
                            {loading ? "Clearing..." : "Clear Tokens"}
                            {!loading && (
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            )}
                        </button>

                    </div>
                </div>
            </section >
        </div >
    );
}

export default clearTokens
