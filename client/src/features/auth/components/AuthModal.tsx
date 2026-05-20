import React, { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { X, User, Lock, Loader2, Mail } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export const AuthModal = () => {
  const { isAuthModalOpen, setAuthModalOpen, login, signup, googleLogin } =
    useAuth();

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
    } catch (err) {
      toast.error(mode === "login" ? "Login failed" : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Modal Wrapper Container */}
      <div className="bg-panel border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 flex justify-between items-center bg-surface/20">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {mode === "login"
                ? "Sign in to continue your adventure"
                : "Sign up to start playing and earning"}
            </p>
          </div>

          <button 
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            
            {/* Username (only signup) */}
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 text-white placeholder-gray-500 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm"
                />
              </div>
            )}

            {/* Email (only signup) */}
            {mode === "signup" && (
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 text-white placeholder-gray-500 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm"
                />
              </div>
            )}

            {/* Identifier (login only) */}
            {mode === "login" && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Email or Username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 text-white placeholder-gray-500 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm"
                />
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 text-white placeholder-gray-500 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-background hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(74,222,128,0.2)] rounded-xl font-extrabold uppercase tracking-wider text-sm transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </button>

            {/* Switch Mode Option */}
            <p className="text-center text-xs sm:text-sm text-gray-400 pt-1">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary hover:underline font-bold ml-1.5"
              >
                {mode === "login" ? "Sign up" : "Login"}
              </button>
            </p>

            {/* Separator Divider */}
            <div className="flex items-center gap-3 text-gray-600 text-[10px] sm:text-xs font-black tracking-widest py-1">
              <div className="flex-1 h-px bg-white/5" />
              OR CONTINUE WITH
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Google Authentication */}
            <div className="w-full flex justify-center py-1">
              <GoogleLogin
                onSuccess={async (res) => {
                  try {
                    if (!res.credential) throw new Error();
                    await googleLogin(res.credential);
                    setAuthModalOpen(false);
                  } catch (err) {
                    toast.error(err.message || "Google login failed");
                  }
                }}
                onError={() => toast.error("Google login failed")}
              />
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};