import { useState } from "react";
import { registerUser } from "../storage";

interface Props {
  onRegistered: (message: string) => void;
  onGoToLogin: () => void;
}

export function Register({ onRegistered, onGoToLogin }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [k: string]: string } = {};
    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!confirm) errs.confirm = "Please confirm your password.";
    else if (password !== confirm) errs.confirm = "Passwords do not match.";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const res = registerUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    });

    if (!res.ok) {
      setErrors({ email: res.error ?? "Registration failed." });
      return;
    }
    onRegistered("Account created successfully. Please log in.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600 mb-2">
          <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">✓</span>
          TaskFlow
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mt-4">Create your account</h2>
        <p className="text-slate-500 mt-1">Start organizing your daily life in seconds.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Field
            label="Full Name"
            value={fullName}
            onChange={setFullName}
            placeholder="Jane Doe"
            error={errors.fullName}
          />
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={errors.email}
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            error={errors.password}
          />
          <Field
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Re-enter your password"
            error={errors.confirm}
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-200 transition"
          >
            Create Account
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onGoToLogin}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${
          error ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"
        }`}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
