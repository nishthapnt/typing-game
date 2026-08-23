"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("typing-theme");

    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setDark(false);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      document.documentElement.classList.toggle("dark", prefersDark);
      setDark(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;

    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("typing-theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="
        flex h-10 w-10 items-center justify-center rounded-full
        border border-[var(--border)]
        bg-[var(--surface)]
        text-[var(--text-muted)]
        transition-all duration-200
        hover:border-[var(--accent)]
        hover:text-[var(--accent)]
        hover:scale-105
      "
    >
      {mounted && dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}