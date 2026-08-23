"use client";

import Link from "next/link";
import { useAuthStore } from "../lib/store";
import { useRouter } from "next/navigation";
import { Keyboard, LogOut, User, Trophy, History } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-8 w-8 text-blue-400" />
            <span className="font-bold text-xl tracking-tight">TypingSpeed</span>
          </div>
          
          {mounted && (
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/game" className="hover:text-blue-400 flex items-center space-x-1 transition-colors">
                    <Keyboard className="w-4 h-4" /> <span>Play</span>
                  </Link>
                  <Link href="/dashboard" className="hover:text-blue-400 flex items-center space-x-1 transition-colors">
                    <History className="w-4 h-4" /> <span>Dashboard</span>
                  </Link>
                  <Link href="/leaderboard" className="hover:text-blue-400 flex items-center space-x-1 transition-colors">
                    <Trophy className="w-4 h-4" /> <span>Leaderboard</span>
                  </Link>
                  <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{user.name}</span>
                    <button 
                      onClick={handleLogout}
                      className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <Link href="/leaderboard" className="hover:text-blue-400 flex items-center space-x-1 transition-colors">
                  <Trophy className="w-4 h-4" /> <span>Leaderboard</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
