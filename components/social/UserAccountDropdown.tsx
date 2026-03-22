"use client"
import React, { useEffect, useState } from 'react';
import {
  User,
  LayoutDashboard,
  LogOut,
  Settings,
  ChevronRight,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { useTheme } from 'next-themes';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/hooks/useLogout';
import LoadingSpinner from '../LoadingSpinner';
import { ThemeToggle } from '../ThemeToggle';

export default function UserAccountDropdown() {

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const { isLoading, handleLogout, error } = useLogout();


  // Prevent hydration mismatch by waiting until mounted
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-10" />;

  const handleNavigate = (path: string) => {
    router.push(path);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        {/* The "Avatar" Button - Standard Gemini Size */}
        <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm md:text-base font-medium shadow-sm cursor-pointer hover:ring-4 hover:ring-blue-500/10 transition-all">
          {user?.fullName?.charAt(0).toUpperCase() || "U"}
        </div>
      </DropdownMenuTrigger>

      {/* Dropdown Content - Using Gemini's 2026 "Soft Card" Specs */}
      <DropdownMenuContent
        align="end"
        className="w-[280px] mt-2 rounded-[24px] p-2 border-border/40 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Section: User Info */}
        <div className="px-4 py-4 mb-1 flex justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-none">{user?.fullName || "User"}</span>
              <span className="text-[12px] text-muted-foreground mt-1">{user?.email}</span>
            </div>
          </div>
          <ThemeToggle classname='flex lg:hidden' />
        </div>

        <DropdownMenuSeparator className="bg-border/50 mx-2" />

        {/* Menu Options: Pill Style */}
        <div className="space-y-1 mt-1">
          <UserMenuItem icon={<User size={18} />} label="My Profile" onclick={() => handleNavigate('/profile')} />
          <UserMenuItem icon={<LayoutDashboard size={18} />} label="Dashboard" onclick={() => handleNavigate('/dashboard')} />
          <UserMenuItem icon={<Settings size={18} />} label="Settings" onclick={() => handleNavigate('/settings')} />
        </div>

        {/* THEME SUB-MENU */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className="items-center gap-3 px-4 py-2.5 rounded-full cursor-pointer outline-none focus:bg-muted transition-all text-foreground hidden lg:flex">
            <span className="opacity-70">
              {theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Palette size={18} />}
            </span>
            <span className="text-sm font-medium flex-1 text-left">Appearance</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent
            className="w-[180px] rounded-[20px] p-1.5 border-border/40 bg-card ml-2 shadow-xl text-foreground focus:text-foreground"
            sideOffset={8}
          >
            <ThemeOption label="Light" value="light" active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={18} />} />
            <ThemeOption label="Dark" value="dark" active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={18} />} />
            <ThemeOption label="System" value="system" active={theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor size={18} />} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>


        <DropdownMenuSeparator className="bg-border/50 mx-2 mt-1" />

        <div className="mt-1">
          <UserMenuItem
            icon={<LogOut size={18} />}
            label="Logout"
            variant="destructive"
            onclick={handleLogout}
            isLoading={isLoading}
          />
        </div>

        {/* Subtle Footer (Optional Gemini detail) */}
        <div className="px-4 py-3 mt-1 flex justify-center border-t border-border/20">
          <button className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Privacy Policy <ChevronRight size={10} />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- INTERNAL COMPONENT FOR PILL ITEMS ---

function UserMenuItem({
  icon,
  label,
  variant = "default",
  onclick,
  isLoading
}: {
  icon: React.ReactNode,
  label: string,
  variant?: "default" | "destructive",
  onclick: () => void,
  isLoading?: boolean
}) {

  return (
    <DropdownMenuItem className={`
      px-4 py-2.5 rounded-full cursor-pointer transition-all
      focus:outline-none
      ${variant === 'destructive'
        ? `text-red-400 focus:bg-red-500/20 focus:text-red-500 ${isLoading ? 'opacity-50 bg-red-500/20 flex justify-center items-center' : ''}`
        : `text-foreground focus:bg-muted focus:text-foreground ${isLoading ? 'opacity-50' : ''}`}
    `}>
      <button onClick={onclick} className='flex items-center gap-3' disabled={isLoading}>
        {isLoading && <LoadingSpinner color='red-500' />}
        {!isLoading && (
          <>
            <span className="opacity-70">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </>
        )}
      </button>
    </DropdownMenuItem>
  );
}

// --- INTERNAL THEME OPTION COMPONENT ---
function ThemeOption({ label, active, onClick, icon }: any) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className="flex items-center justify-between px-4 py-2.5 rounded-full cursor-pointer focus:bg-muted transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="opacity-70">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {active && <Check size={14} className="text-primary" />}
    </DropdownMenuItem>
  );
}