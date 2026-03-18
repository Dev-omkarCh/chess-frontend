"use client"
import { ThemeToggle } from './ThemeToggle'
import { Swords } from 'lucide-react'
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import UserAccountDropdown from './social/UserAccountDropdown';
import { useRouter } from 'next/navigation';

const Navbar = () => {

    const user = useSelector((state: RootState) => state.auth.user);
    const isLoading = useSelector((state: RootState) => state.auth.loading);
    const router = useRouter();

    if (isLoading) {
        return (
            <nav className="flex items-center justify-between px-6 py-4 border-b border-border backdrop-blur-md bg-card sticky top-0 z-50 w-full">
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
                        <Swords size={22} className="text-primary-foreground" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tighter uppercase italic">
                        BetterChess<span className="text-primary">.ai</span>
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-accent animate-pulse flex items-center justify-center text-white text-sm md:text-base font-medium shadow-sm cursor-pointer hover:ring-4 hover:ring-blue-500/10 transition-all">

                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border backdrop-blur-md bg-card sticky top-0 z-50 w-full">
            <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
                    <Swords size={22} className="text-primary-foreground" />
                </div>
                <span className="font-extrabold text-xl tracking-tighter uppercase italic">
                    BetterChess<span className="text-primary">.ai</span>
                </span>
            </div>

            <div className="flex items-center gap-3">
                {
                    !user ? (
                        <>
                            <ThemeToggle />
                            <button
                                className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-primary/80 transition-colors"
                                onClick={() => router.push("/login")}
                            >
                                Login
                            </button>
                        </>
                    ) :
                        <UserAccountDropdown />
                }
            </div>
        </nav>
    )
}

export default Navbar
