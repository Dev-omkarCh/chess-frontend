"use client"

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLogin } from '@/hooks/useLogin';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { GoogleAuthBtn } from '@/components/auth/GoogleAuthBtn';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin, isLoading, error } = useLogin();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    handleLogin(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  //TODO : Implement Error Handling for Login

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">

      {/* --- LEFT SIDE: THE STYLISH VISUAL --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-card flex-col justify-between p-12 border-r border-border">
        {/* Background Mesh Gradient - Using OKLCH for "Glowing" colors */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-card blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-oklch(0.6_0.2_300)/20 blur-[100px]" />
        </div>

        {/* <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-primary">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
             <Sparkles className="text-primary-foreground" size={20} />
          </div>
          BetterChess AI
        </div> */}

        <div className="space-y-6">
          <h2 className="text-5xl font-bold leading-tight">
            Login with <br />
            <span className="text-primary/80">BetterChess</span> AI.
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            Experience the Chess with AI Powered engine.
            where you can learn from your past games and ask Ai your Areas of Improvement.
            Challege Friends for game.
          </p>

          <ul className="space-y-4 pt-4">
            {["Analyze your games and get feedback from AI", "Challenge friends for game", "Learn from past games"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="text-primary" size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-muted-foreground">
          © 2026 BetterChess AI. All rights reserved.
        </div>
      </div>

      {/* --- RIGHT SIDE: THE LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Login</h1>
            <p className="text-muted-foreground text-sm">Enter your credentials to play your next match</p>
          </div>

          <div className="bg-card text-card-foreground border border-border p-8 rounded-3xl shadow-2xl space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    name="email"
                    id='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold">Password</label>
                  <button type="button" className="text-xs text-primary font-bold hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-12 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                className={`w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold 
                flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all 
                shadow-lg shadow-primary/25 ${isLoading ? "bg-primary/50" : "bg-primary"}`}>
                {isLoading ? <LoadingSpinner /> :
                  <> Login <ArrowRight size={18} /> </>
                }
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <GoogleAuthBtn />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?
            <button
              className="text-primary font-bold hover:underline ml-2"
              onClick={() => router.push("/signup")}
            >Create one</button>
          </p>
        </div>
      </div>
    </div>
  );
}