import { useState } from "react";
import { verifyUser, setCurrentUser } from "../storage";
import type { User } from "../types";

interface Props {
  onLoginSuccess: (user: User) => void;
  onGoToRegister: () => void;
  flashMessage?: string;
}

export function Login({ onLoginSuccess, onGoToRegister, flashMessage }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    const user = verifyUser(email, password);
    if (!user) {
      setErrors({ form: "Incorrect email or password." });
      return;
    }
    setCurrentUser(user);
    onLoginSuccess(user);
  };

  const useDemo = () => {
    setEmail("demo@example.com");
    setPassword("demo123");
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">✓</span>
              TaskFlow
            </div>
            <h1 className="mt-16 text-4xl font-bold leading-tight">
              Organize your day.<br />Own your focus.
            </h1>
            <p className="mt-4 text-white/80 text-lg">
              A modern task manager built for the busy student, the focused
              professional, and everyone in between.
            </p>
            <ul className="mt-8 space-y-3 text-white/90">
              <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>Track daily & upcoming tasks</li>
              <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>Smart filters, tags, and search</li>
              <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>Private per-account storage</li>
            </ul>
          </div>
          <p className="relative text-white/60 text-sm">© {new Date().getFullYear()} TaskFlow</p>
        </div>

        {/* Right form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="md:hidden flex items-center gap-2 text-2xl font-bold text-indigo-600 mb-6">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">✓</span>
              TaskFlow
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Welcome back</h2>
            <p className="text-slate-500 mt-1">Sign in to continue to your dashboard.</p>

            {flashMessage && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-2 text-sm">
                {flashMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${
                    errors.email ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"
                  }`}
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 transition ${
                      errors.password ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
              </div>

              {errors.form && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-lg px-4 py-2 text-sm">
                  {errors.form}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-200 transition"
              >
                Login
              </button>

              <button
                type="button"
                onClick={onGoToRegister}
                className="w-full border-2 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 font-semibold py-3 rounded-xl transition"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-700">Demo account</p>
                  <p className="text-slate-500 mt-0.5">
                    <span className="font-mono">demo@example.com</span> /{" "}
                    <span className="font-mono">demo123</span>
                  </p>
                </div>
                <button
                  onClick={useDemo}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                >
                  Use demo →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
