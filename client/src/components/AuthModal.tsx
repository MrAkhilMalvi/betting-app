import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, User, Lock, Loader2, Mail } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    login,
    signup,
    googleLogin,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        await login({ identifier, password });
      } else {
        await signup({ username, email, password });
      }

      setAuthModalOpen(false);
    } catch {
      alert(mode === "login" ? "Login failed" : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#151A22] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {mode === "login"
                ? "Sign in to continue"
                : "Sign up to start playing"}
            </p>
          </div>

          <button onClick={() => setAuthModalOpen(false)}>
            <X />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Username (only signup) */}
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 py-3 bg-[#0B0E14] text-white rounded-xl"
              />
            </div>
          )}

          {/* Email (only signup) */}
          {mode === "signup" && (
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 py-3 bg-[#0B0E14] text-white rounded-xl"
              />
            </div>
          )}

          {/* Identifier (login only) */}
          {mode === "login" && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full pl-10 py-3 bg-[#0B0E14] text-white rounded-xl"
              />
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 py-3 bg-[#0B0E14] text-white rounded-xl"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-500 rounded-xl font-bold"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : mode === "login" ? (
              "Login"
            ) : (
              "Create Account"
            )}
          </button>

          {/* Switch Mode */}
          <p className="text-center text-sm text-gray-400">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-green-400 ml-1"
            >
              {mode === "login" ? "Sign up" : "Login"}
            </button>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <div className="flex-1 h-px bg-gray-700" />
            OR
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Google */}
          <GoogleLogin
            onSuccess={async (res) => {
              try {
                if (!res.credential) throw new Error();
                await googleLogin(res.credential);
                setAuthModalOpen(false);
              } catch {
                alert("Google login failed");
              }
            }}
            onError={() => alert("Google login failed")}
          />

        </form>
      </div>
    </div>
  );
};