import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { usePlayer } from "../../contexts/PlayerContext";
import { TOOLTIPS } from "../../shared/labels";
import { Tooltip } from "../ui/Tooltip";

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
    isActive ? "bg-slate-800 text-slate-50" : "text-slate-200/80 hover:bg-slate-900/50",
  ].join(" ");

export function TopNav() {
  const { player } = usePlayer();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="text-lg font-extrabold tracking-tight">LangGacha</div>
          <div className="hidden text-xs text-slate-200/60 sm:block">Prototype</div>
        </div>

        <nav className="hidden items-center gap-2 sm:flex">
          <NavLink to="/" className={linkClassName} end>
            Бустер
          </NavLink>
          <NavLink to="/battle" className={linkClassName}>
            Бой
          </NavLink>
          <NavLink to="/raid" className={linkClassName}>
            Рейд
          </NavLink>
          <NavLink to="/craft" className={linkClassName}>
            Крафт
          </NavLink>
          <NavLink to="/collection" className={linkClassName}>
            Коллекция
          </NavLink>
          <NavLink to="/guide" className={linkClassName}>
            Гайд
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 sm:hidden">
            <Tooltip text={TOOLTIPS.dust}>
              <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 text-xs font-extrabold text-slate-200/80">
                <span>✨</span>
                <span className="font-mono">{player?.dust ?? "—"}</span>
              </div>
            </Tooltip>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-800/60 bg-slate-950/40 text-lg font-extrabold text-slate-200/80 hover:bg-slate-900/60"
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
            >
              ☰
            </button>
          </div>

          <div className="hidden items-center gap-4 text-sm font-semibold text-slate-200/80 sm:flex">
            <div className="flex items-center gap-2">
              <Tooltip text={TOOLTIPS.dust}>
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span className="font-mono">{player?.dust ?? "—"}</span>
                  <span>Dust</span>
                </div>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-slate-200/60 sm:block">
                {user?.username ?? "—"}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 text-xs font-extrabold text-slate-200/80 hover:bg-slate-900/60"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMenuOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute left-3 right-3 top-3 rounded-2xl border border-slate-800/60 bg-slate-950/95 p-3 shadow-2xl transition-all duration-200">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-50">Меню</div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-800/60 bg-slate-950/40 text-sm font-extrabold text-slate-200/80 hover:bg-slate-900/60"
                aria-label="Закрыть меню"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {[
                { to: "/", label: "Бустер", end: true },
                { to: "/battle", label: "Бой" },
                { to: "/raid", label: "Рейд" },
                { to: "/craft", label: "Крафт" },
                { to: "/collection", label: "Коллекция" },
                { to: "/guide", label: "Гайд" },
              ].map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={"end" in l ? (l.end as boolean) : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex h-11 items-center rounded-xl px-4 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-slate-800 text-slate-50"
                        : "text-slate-200/80 hover:bg-slate-900/50",
                    ].join(" ")
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-50">
                  {user?.username ?? "—"}
                </div>
                <div className="mt-0.5 text-xs text-slate-200/60">
                  Dust: <span className="font-mono">{player?.dust ?? "—"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex h-11 items-center justify-center rounded-xl bg-slate-800 px-4 text-sm font-extrabold text-slate-50 hover:bg-slate-700"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
