import { useEffect, useState } from "react";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { Toast } from "./components/Toast";
import { getCurrentUser, seedDemoIfNeeded, setCurrentUser } from "./storage";
import type { User } from "./types";

type View = "login" | "register" | "dashboard";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  key: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("login");
  const [flash, setFlash] = useState<string>("");
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    seedDemoIfNeeded();
    const current = getCurrentUser();
    if (current) {
      setUser(current);
      setView("dashboard");
    }
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type, key: Date.now() });
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setView("dashboard");
    setFlash("");
    showToast(`Welcome back, ${u.fullName.split(" ")[0]}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setView("login");
    setFlash("You have been logged out.");
  };

  const handleRegistered = (msg: string) => {
    setFlash(msg);
    setView("login");
    showToast("Account created — please log in.");
  };

  return (
    <>
      {view === "login" && (
        <Login
          onLoginSuccess={handleLogin}
          onGoToRegister={() => {
            setFlash("");
            setView("register");
          }}
          flashMessage={flash}
        />
      )}
      {view === "register" && (
        <Register onRegistered={handleRegistered} onGoToLogin={() => setView("login")} />
      )}
      {view === "dashboard" && user && (
        <Dashboard user={user} onLogout={handleLogout} showToast={showToast} />
      )}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
