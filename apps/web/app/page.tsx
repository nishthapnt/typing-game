"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Zap } from "lucide-react";
import { useAuthStore } from "../lib/store";
import { client } from "../lib/graphql-client";
import { gql } from "graphql-request";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, passwordHashRaw: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, passwordHashRaw: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { user, setAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/game");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const data = (await client.request(LOGIN_MUTATION, {
          email,
          password,
        })) as {
          login: {
            token: string;
            user: {
              id: string;
              name: string;
              email: string;
            };
          };
        };

        setAuth(data.login.token, data.login.user);
      } else {
        const data = (await client.request(REGISTER_MUTATION, {
          name,
          email,
          password,
        })) as {
          register: {
            token: string;
            user: {
              id: string;
              name: string;
              email: string;
            };
          };
        };

        setAuth(data.register.token, data.register.user);
      }

      router.push("/game");
    } catch (err: unknown) {
      const error = err as {
        response?: {
          errors?: Array<{ message: string }>;
        };
      };

      setError(
        error.response?.errors?.[0]?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  if (user) return null;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--background)] px-6 py-12 transition-colors">
      <div className="w-full max-w-md">

        {/* Brand / intro */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-lg shadow-orange-500/20">
            <Zap size={27} fill="currentColor" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">
            Type<span className="text-[var(--accent)]">Speed</span>
          </h1>

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Test your speed. Beat your best.
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl shadow-black/5">

          {/* Card heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-[var(--text)]">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {isLogin
                ? "Continue improving your typing speed."
                : "Start tracking your typing performance."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                  />

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="
                      h-12 w-full rounded-xl
                      border border-[var(--border)]
                      bg-[var(--background)]
                      pl-11 pr-4
                      text-[var(--text)]
                      outline-none
                      transition
                      placeholder:text-[var(--text-subtle)]
                      focus:border-[var(--accent)]
                      focus:ring-2
                      focus:ring-orange-500/15
                    "
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="
                    h-12 w-full rounded-xl
                    border border-[var(--border)]
                    bg-[var(--background)]
                    pl-11 pr-4
                    text-[var(--text)]
                    outline-none
                    transition
                    placeholder:text-[var(--text-subtle)]
                    focus:border-[var(--accent)]
                    focus:ring-2
                    focus:ring-orange-500/15
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="
                    h-12 w-full rounded-xl
                    border border-[var(--border)]
                    bg-[var(--background)]
                    pl-11 pr-4
                    text-[var(--text)]
                    outline-none
                    transition
                    placeholder:text-[var(--text-subtle)]
                    focus:border-[var(--accent)]
                    focus:ring-2
                    focus:ring-orange-500/15
                  "
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="
                group flex h-12 w-full items-center justify-center gap-2
                rounded-xl
                bg-[var(--accent)]
                font-semibold text-white
                shadow-lg shadow-orange-500/15
                transition-all
                hover:-translate-y-0.5
                hover:bg-[var(--accent-hover)]
                active:translate-y-0
              "
            >
              {isLogin ? "Sign In" : "Create Account"}

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </form>

          {/* Switch auth mode */}
          <div className="mt-7 border-t border-[var(--border)] pt-6 text-center">
            <span className="text-sm text-[var(--text-muted)]">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="ml-1 text-sm font-semibold text-[var(--accent)] transition hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-xs text-[var(--text-subtle)]">
          Improve your speed. Track your progress. Beat your record.
        </p>
      </div>
    </main>
  );
}