"use client";

import Link from "next/link";
import { useAuthStore } from "../lib/store";
import { usePathname, useRouter } from "next/navigation";
import {
  Keyboard,
  LogOut,
  User,
  Trophy,
  History,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

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
    <nav
      className="
        sticky top-0 z-50
        h-16 pt-[env(safe-area-inset-top)] box-content
        border-b border-[var(--border)]
        bg-[var(--background)]
        
        transition-colors
      "
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-3 sm:px-6">

        {/* Brand */}
        <Link
          href={mounted && user ? "/game" : "/"}
          className="group flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <div
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl
              bg-[var(--accent)]
              text-white
              shadow-md shadow-orange-500/20
              transition-transform duration-200
              group-hover:scale-105
            "
          >
            <Keyboard size={19} strokeWidth={2.2} />
          </div>

          <div className="hidden leading-none min-[400px]:block">
            <div className="text-lg font-bold tracking-tight text-[var(--text)]">
              Type<span className="text-[var(--accent)]">Speed</span>
            </div>

            <div className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)] sm:block">
              Typing speed test
            </div>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">

          {/* Don't render auth-dependent navigation until mounted */}
          {mounted && (
            <>
              {user ? (
                <>
                  <NavLink
                    href="/game"
                    icon={<Play size={16} />}
                    label="Play"
                  />

                  <NavLink
                    href="/dashboard"
                    icon={<History size={16} />}
                    label="Dashboard"
                  />

                  <NavLink
                    href="/leaderboard"
                    icon={<Trophy size={16} />}
                    label="Leaderboard"
                  />

                  <div className="mx-1 h-6 w-px bg-[var(--border)] sm:mx-2 sm:h-7" />

                  {/* User */}
                  <div className="flex items-center gap-1 sm:gap-1.5">

                    <div
                      className="
                        hidden h-9 w-9 items-center justify-center
                        rounded-full
                        border border-[var(--border)]
                        bg-[var(--surface)]
                        text-[var(--text-muted)]
                        sm:flex
                      "
                    >
                      <User size={16} />
                    </div>

                    <span className="hidden max-w-28 truncate px-1 text-sm font-medium text-[var(--text)] lg:block">
                      {user.name}
                    </span>

                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Log out"
                      aria-label="Log out"
                      className="
                        flex h-10 w-10 items-center justify-center
                        rounded-xl
                        text-[var(--text-muted)]
                        transition-all duration-200
                        hover:bg-[var(--accent-soft)]
                        hover:text-[var(--accent)]
                      "
                    >
                      <LogOut size={17} />
                    </button>
                  </div>
                </>
              ) : (
                <NavLink
                  href="/leaderboard"
                  icon={<Trophy size={16} />}
                  label="Leaderboard"
                />
              )}
            </>
          )}

          {/* Theme is always part of the shared navbar */}
          <div className="ml-0.5 sm:ml-1.5 sm:border-l sm:border-[var(--border)] sm:pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname === `${href}/`;

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`
        group flex h-10 min-w-10 items-center justify-center gap-2
        rounded-xl
        text-sm font-medium
        transition-all duration-200
        sm:px-3
        ${
          active
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--accent)]"
        }
      `}
    >
      <span className="transition-transform duration-200 group-hover:scale-105">
        {icon}
      </span>

      <span className="hidden sm:inline">
        {label}
      </span>
    </Link>
  );
}