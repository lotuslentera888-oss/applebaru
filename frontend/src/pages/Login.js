import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import { userHomePath } from "@/lib/appMode";
import { Lock, User, Loader2, Smartphone } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(identifier, password);
      navigate(user.role === "admin" ? "/admin" : userHomePath());
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-[#007AFF]/20 blur-[120px]" />
      <form
        onSubmit={submit}
        data-testid="login-form"
        className="relative z-10 w-full max-w-sm bg-white/[0.05] border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-5">
          <Smartphone size={24} className="text-black" />
        </div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Masuk</h1>
        <p className="text-white/45 text-[14px] mt-1 mb-7">Login sebagai admin atau pengguna device.</p>

        <label className="block text-[13px] text-white/60 mb-1.5">Username / Email</label>
        <div className="flex items-center gap-2 bg-white/[0.06] border border-white/12 rounded-xl px-4 h-12 mb-4 focus-within:border-[#0A84FF] transition-colors">
          <User size={16} className="text-white/40" />
          <input
            data-testid="login-identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="username atau email"
            className="bg-transparent outline-none flex-1 text-white text-[15px] placeholder:text-white/30"
          />
        </div>

        <label className="block text-[13px] text-white/60 mb-1.5">Password</label>
        <div className="flex items-center gap-2 bg-white/[0.06] border border-white/12 rounded-xl px-4 h-12 mb-2 focus-within:border-[#0A84FF] transition-colors">
          <Lock size={16} className="text-white/40" />
          <input
            data-testid="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-transparent outline-none flex-1 text-white text-[15px] placeholder:text-white/30"
          />
        </div>

        {error && <p data-testid="login-error" className="text-[#FF453A] text-[13px] mt-2">{error}</p>}

        <button
          data-testid="login-submit"
          type="submit"
          disabled={loading}
          className="w-full mt-5 h-12 rounded-xl bg-[#0A84FF] hover:bg-[#0A84FF]/90 active:scale-[0.99] transition-all text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          Sign In
        </button>
      </form>
    </div>
  );
}
