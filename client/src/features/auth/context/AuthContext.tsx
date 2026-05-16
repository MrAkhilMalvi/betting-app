import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loginApi,
  signupApi,
  logoutApi,
  getMeApi,
  googleLoginApi,
} from "@/features/auth/services/AuthService";
import { AuthContextType, User } from "../types/authTypes";
import { useGameStore } from "@/features/betting/store/betting.store";

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const { setBalance, setBonusClaimed } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const getMe = async () => {
    try {
      const res = await getMeApi();
      setUser(res.user);

      setBalance(Number(res.user.balance) || 0);
      setBonusClaimed(res.user.bonus_claimed);
    } catch {
      setUser(null);
      setBalance(0);
      setBonusClaimed(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  const login = async (data: { identifier: string; password: string }) => {
    const res = await loginApi(data);
    setUser(res?.user);
    setBalance(Number(res.user.balance) || 0);
    setBonusClaimed(res.user.bonus_claimed);
    await getMe();
    setAuthModalOpen(false);
  };

  const signup = async (data: {
    username: string;
    email?: string;
    password: string;
  }) => {
    await signupApi(data);
    await login({ identifier: data.username, password: data.password });
    await getMe();
  };

  const googleLogin = async (token: string) => {
    const res = await googleLoginApi(token);

    setUser(res.user);
    setBalance(Number(res.user.balance) || 0);
    setBonusClaimed(res.user.bonus_claimed);
    await getMe();
    setAuthModalOpen(false);
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
    setBalance(0);
    setBonusClaimed(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        setAuthModalOpen,
        login,
        signup,
        logout,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
