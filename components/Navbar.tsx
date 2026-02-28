import React from 'react'
import { ThemeToggle } from './ThemeToggle'
import { Swords } from 'lucide-react'

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border backdrop-blur-md bg-card sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
                    <Swords size={22} className="text-primary-foreground" />
                </div>
                <span className="font-extrabold text-xl tracking-tighter uppercase italic">
                    BetterChess<span className="text-primary">.ai</span>
                </span>
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />
                <button className="hidden sm:block px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                    Log In
                </button>
                <button className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-primary/80 transition-colors">
                    Sign Up
                </button>
            </div>
        </nav>
    )
}

export default Navbar
