"use client"
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, UserCircle2, CalendarDays, EyeOff, Eye } from 'lucide-react';
import { useSignup } from '@/hooks/useSignup';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    gender: '', // 'male', 'female', 'other', 'prefer-not-to-say'
  });

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => setCurrentStep(prev => prev - 1);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const { handleSignup, isLoading, error } = useSignup();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    handleSignup(formData);
  };

  const isStep1Valid = formData.username && formData.email && formData.password;
  const isStep2Valid = formData.fullName && formData.gender;

  //TODO : Implement Error Handling for Signup

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">

      {/* --- LEFT SIDE: STYLISH VISUAL (Same as Login) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/5 flex-col justify-between p-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
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
            Unlock Your <br />
            <span className="text-primary">Potential.</span> Seamlessly.
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            Join the future of intelligent applications. Create your account in minutes.
          </p>

          <ul className="space-y-4 pt-4">
            {["Personalized Experience", "Advanced AI Features", "Secure & Private Data"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="text-primary" size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-muted-foreground">
          © 2026 Nexus AI Platforms. All rights reserved.
        </div>
      </div>

      {/* --- RIGHT SIDE: THE SIGNUP FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
            <p className="text-muted-foreground text-sm">Step {currentStep} of 2</p>
          </div>

          <div className="bg-card text-card-foreground border border-border p-8 rounded-3xl shadow-2xl space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* STEP 1: Account Details */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-semibold">Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
                      <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Choose a unique username"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="name@company.com"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-12 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.password}
                        onChange={handleChange}
                        required
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
                    type="button"
                    onClick={handleNext}
                    disabled={!isStep1Valid}
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
                  >
                    Next Step
                    <ArrowRight size={18} />
                  </button>
                </>
              )}

              {/* STEP 2: Personal Details */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-semibold">Full Name</label>
                    <div className="relative">
                      <UserCircle2 className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="Your full name"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="gender" className="text-sm font-semibold">Gender</label>
                    <div className="relative">
                      <select
                        id="gender"
                        name="gender"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-4 pr-11 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Select your gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                      {/* Custom arrow for select box */}
                      <ArrowRight className="absolute right-3.5 top-3 rotate-90 text-muted-foreground pointer-events-none" size={18} />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-muted text-muted-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStep2Valid || isLoading}
                      className={`flex-1 text-primary-foreground py-3.5 rounded-xl 
                        font-bold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 
                        disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-primary/25
                        ${isLoading ? "bg-primary/50" : "bg-primary"}`
                      }
                    >
                      {isLoading ? <LoadingSpinner /> :
                        <> Create Account <ArrowRight size={18} /> </>
                      }
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Google Login (Moved to bottom) */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 bg-card hover:bg-accent border border-border py-3 rounded-xl font-semibold transition-all group">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}