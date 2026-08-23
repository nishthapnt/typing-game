import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isLoaded: boolean;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load from localStorage on initial run if we are in browser
  let initialToken = null;
  let initialUser = null;
  if (typeof window !== "undefined") {
    initialToken = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        initialUser = JSON.parse(userStr);
      } catch {}
    }
  }

  return {
    token: initialToken,
    user: initialUser,
    isLoaded: true,
    setAuth: (token: string, user: User) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      set({ token, user });
    },
    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("typing-game-best-score");
      }
      set({ token: null, user: null });
    },
  };
});
