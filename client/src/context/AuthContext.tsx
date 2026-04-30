// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loginApi,
  signupApi,
  logoutApi,
  getMeApi,
  googleLoginApi,
} from "../api/Auth.api";

import { getWalletApi } from "../api/Wallet.api";

type User = {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  balance: number;
  loading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (v: boolean) => void;

  login: (data: { identifier: string; password: string }) => Promise<void>;
  signup: (data: { username: string; email?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (token: string) => Promise<void>;

  // 🔥 expose for refresh after bet
  refreshWallet: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // 🪙 Wallet Fetch (centralized)
  const fetchWallet = async () => {
    try {
      const res = await getWalletApi();
      setBalance(Number(res.data.balance) || 0);
    } catch {
      setBalance(0);
    }
  };

  // 🔁 Auto login
  useEffect(() => {
    const init = async () => {
      try {
        const res = await getMeApi();
        setUser(res.data.user);

        await fetchWallet(); // ✅ correct source
      } catch {
        setUser(null);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 🔐 LOGIN
  const login = async (data: { identifier: string; password: string }) => {
    const res = await loginApi(data);
    setUser(res.data.user);

    await fetchWallet(); // ✅ no getMe again

    setAuthModalOpen(false);
  };

  // 🆕 SIGNUP
  const signup = async (data: {
    username: string;
    email?: string;
    password: string;
  }) => {
    await signupApi(data);
    await login({ identifier: data.username, password: data.password });
  };

  // 🔥 GOOGLE LOGIN
  const googleLogin = async (token: string) => {
    const res = await googleLoginApi(token);

    setUser(res.data.user);

    await fetchWallet(); // ✅ correct

    setAuthModalOpen(false);
  };

  // 🔴 LOGOUT
  const logout = async () => {
    await logoutApi();
    setUser(null);
    setBalance(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        balance,
        loading,
        isAuthModalOpen,
        setAuthModalOpen,
        login,
        signup,
        logout,
        googleLogin,
        refreshWallet: fetchWallet, // 🔥 important for betting
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);