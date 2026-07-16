"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Coffee,
    Heart,
    MessageSquare,
    ShieldCheck,
    Sparkles,
    User,
    ArrowRight,
    Loader2,
    CheckCircle2
} from "lucide-react";
import apiClient from "@/api/axois";

export default function BuyMeCoffee() {
    const [coffeeCount, setCoffeeCount] = useState<number | "custom">(3);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const COFFEE_PRICE_INR = 100;

    const getFinalAmount = () => {
        if (coffeeCount === "custom") {
            const parsed = parseFloat(customAmount);
            return isNaN(parsed) ? 0 : parsed;
        }
        return coffeeCount * COFFEE_PRICE_INR;
    };

    const finalAmount = getFinalAmount();

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (finalAmount <= 0) return;

        setIsSubmitting(true);

        try {
            // 1. Ensure script is fully loaded before continuing!
            const isScriptLoaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");

            if (!isScriptLoaded) {
                alert("Razorpay SDK failed to load. Are you offline or using an ad-blocker?");
                setIsSubmitting(false);
                return;
            }

            // 2. Now securely fetch the Order ID from your backend...
            const orderResponse = await apiClient.post(`/v1/payment/order`,
                {
                    amount: finalAmount,
                    name: name || "Anonymous",
                    message: message,
                });

            const orderData = await orderResponse.data;

            if (!orderData.success) {
                throw new Error(orderData.message || "Failed to create order on server");
            }

            // 3. Configure and launch the payment window
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Frontend Key ID
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Support My Creative Work",
                description: `Buying ${coffeeCount === "custom" ? "Custom Amount" : `${coffeeCount} Cup(s)`} of coffee`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyResponse = await apiClient.post(`/v1/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        const verifyData = await verifyResponse.data;

                        if (verifyData.success) {
                            setPaymentSuccess(true);
                        } else {
                            alert("Payment verification failed.");
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        alert("Something went wrong while verifying payment.");
                    } finally {
                        setIsSubmitting(false);
                    }
                },
                prefill: {
                    name: name || "Anonymous",
                },
                theme: {
                    color: "#00ffff",
                },
                modal: {
                    ondismiss: function () {
                        setIsSubmitting(false);
                    },
                },
            };

            // Now window.Razorpay will definitely be defined!
            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error: any) {
            console.error("Payment Process Interrupted:", error);
            alert(error.message || "Payment service temporarily unavailable.");
            setIsSubmitting(false);
        }
    };
    const loadRazorpayScript = (src: string) => {
        return new Promise((resolve) => {
            // If it's already injected on the window, don't inject it again
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-primary/20 transition-colors duration-300">

            {/* Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 gap-4 px-4 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                <div className="border-l border-foreground h-full" />
                <div className="border-l border-foreground h-full" />
                <div className="border-l border-foreground h-full hidden md:block" />
                <div className="border-l border-foreground h-full hidden md:block" />
                <div className="border-l border-foreground h-full" />
                <div className="border-r border-foreground h-full" />
            </div>

            {/* Deep Gemini Backdrop Radial Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

            <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 relative">

                {/* Left Side: Pitch */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="lg:col-span-5 space-y-6 text-center lg:text-left"
                >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/40 text-xs font-semibold text-primary uppercase tracking-wider backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Support Creative Work
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                            Fuel the <br />
                            <span className="bg-gradient-to-r from-primary via-primary/80 to-number bg-clip-text text-transparent">
                                Next Build.
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-light max-w-md mx-auto lg:mx-0">
                            Your support directly translates to production deployments, database uptime, and the coffee powering late-night code commits.
                        </p>
                    </div>

                    <div className="hidden lg:flex items-center gap-6 pt-4 border-t border-border/60">
                        <div>
                            <div className="text-2xl font-bold text-foreground">100%</div>
                            <div className="text-xs text-muted-foreground">Direct Support</div>
                        </div>
                        <div className="h-8 w-px bg-border/60" />
                        <div>
                            <div className="text-2xl font-bold text-foreground">Secure</div>
                            <div className="text-xs text-muted-foreground">Razorpay Sandbox Ready</div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Payment card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="lg:col-span-7 bg-card/40 border border-border/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden hover:border-primary/20 transition-all duration-500"
                >
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <AnimatePresence mode="wait">
                        {!paymentSuccess ? (
                            <motion.form
                                key="form"
                                onSubmit={handlePayment}
                                className="space-y-6"
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Cups selector */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                                            <Coffee className="w-4 h-4 text-primary" /> Select Cups
                                        </label>
                                        <span className="text-xs font-mono text-muted-foreground">₹{COFFEE_PRICE_INR}/cup</span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2.5">
                                        {[1, 3, 5].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setCoffeeCount(num)}
                                                className={`group relative flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 ${coffeeCount === num
                                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10"
                                                    : "bg-muted/30 hover:bg-card-hover border-border text-foreground"
                                                    }`}
                                            >
                                                <span className="text-lg font-extrabold md:text-xl">☕ {num}</span>
                                                <span className="text-[10px] mt-1 font-mono opacity-80">₹{num * COFFEE_PRICE_INR}</span>
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setCoffeeCount("custom")}
                                            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 ${coffeeCount === "custom"
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10"
                                                : "bg-muted/30 hover:bg-card-hover border-border text-foreground"
                                                }`}
                                        >
                                            <span className="text-xs font-bold">Custom</span>
                                            <span className="text-[10px] mt-1 font-mono opacity-80">Any sum</span>
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {coffeeCount === "custom" && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden mt-3"
                                            >
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                                                        ₹
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="10"
                                                        placeholder="Amount in INR"
                                                        value={customAmount}
                                                        onChange={(e) => setCustomAmount(e.target.value)}
                                                        required
                                                        className="w-full pl-8 pr-4 py-3 bg-muted/20 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Input Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-primary" /> Your Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Anonymous"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all text-foreground"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5 text-primary" /> Message
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Say something nice..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all text-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Submit Action Block */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || finalAmount <= 0}
                                        className="w-full relative overflow-hidden bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm shadow-xl hover:shadow-primary/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                                                <span>Initializing Payment...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="w-4 h-4 fill-current text-primary-foreground group-hover:scale-110 transition-transform" />
                                                <span>Support with ₹{finalAmount.toLocaleString("en-IN")}</span>
                                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60 border-t border-border/40 pt-4">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Powered securely by Razorpay standard SSL connections.</span>
                                </div>
                            </motion.form>
                        ) : (
                            /* Verification Complete State */
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30">
                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">Transaction Confirmed!</h3>
                                    <p className="text-xs text-muted-foreground max-w-sm">
                                        Thank you so much! Your coffee contribution has been verified successfully on the server.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

            </main>
        </div>
    );
}