import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

type Mode = "login" | "register";

const tabClass = (active: boolean) =>
  [
    "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
    active ? "bg-slate-800 text-slate-50" : "text-slate-200/70 hover:bg-slate-900/50",
  ].join(" ");

export function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (username.trim().length < 3) return false;
    if (!password) return false;
    if (mode === "register" && password !== confirm) return false;
    return true;
  }, [loading, username, password, confirm, mode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        if (password !== confirm) throw new Error("Passwords do not match");
        await register(username, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-950/50 p-6 shadow-xl shadow-black/30 backdrop-blur">
        <div className="mb-6">
          <div className="text-2xl font-extrabold tracking-tight">LangGacha</div>
          <div className="mt-1 text-sm text-slate-200/60">
            Войди или создай аккаунт, чтобы продолжить
          </div>
        </div>

        <div className="mb-6 flex gap-2 rounded-xl bg-slate-900/40 p-1">
          <button type="button" className={tabClass(mode === "login")} onClick={() => setMode("login")}>
            Вход
          </button>
          <button
            type="button"
            className={tabClass(mode === "register")}
            onClick={() => setMode("register")}
          >
            Регистрация
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-200/70">Username</span>
            <input
              className="rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-sky-400/30 placeholder:text-slate-400 focus:ring-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="например, aleksei_7"
              autoComplete="username"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-200/70">Пароль</span>
            <input
              type="password"
              className="rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-sky-400/30 placeholder:text-slate-400 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </label>

          {mode === "register" ? (
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-200/70">Повтор пароля</span>
              <input
                type="password"
                className="rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-sky-400/30 placeholder:text-slate-400 focus:ring-2"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary mt-2"
          >
            {loading ? "Подождите…" : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>

          <div className="text-xs text-slate-200/50">
            Username: 3–20 символов, латиница/цифры/underscore.
          </div>
        </form>
      </div>
    </main>
  );
}
