import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { usePlayer } from "../../contexts/PlayerContext";
import { TOOLTIPS } from "../../shared/labels";
import { Tooltip } from "../ui/Tooltip";
import { GuideDrawer } from "./GuideDrawer";

const NAV_ITEMS = [
  { to: "/", label: "Бустеры", end: true },
  { to: "/battles", label: "Бои", end: false },
  { to: "/collection", label: "Коллекция", end: false },
] as const;

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
    isActive ? "bg-slate-800 text-slate-50" : "text-slate-200/80 hover:bg-slate-900/50",
  ].join(" ");

const helpButtonClassName =
  "flex h-11 w-11 items-center justify-center rounded-full border border-slate-800/60 bg-slate-950/40 text-sm font-extrabold text-slate-200/80 hover:bg-slate-900/60";

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { player } = usePlayer();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const guideOpen = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("guide") === "1";
  }, [location.search]);

  const setGuideOpen = (nextOpen: boolean) => {
    const params = new URLSearchParams(location.search);
    if (nextOpen) {
      params.set("guide", "1");
      setMenuOpen(false);
    } else {
      params.delete("guide");
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (!menuOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [userMenuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="z-10 flex items-center gap-3">
            <div className="text-lg font-extrabold tracking-tight">LangGacha</div>
            <div className="hidden text-xs text-slate-200/60 sm:block">Prototype</div>
          </div>

          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 sm:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClassName} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="z-10 flex items-center gap-2">
            <div className="flex items-center gap-2 sm:hidden">
              <Tooltip text={TOOLTIPS.dust}>
                <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 text-xs font-extrabold text-slate-200/80">
                  <span>✨</span>
                  <span className="font-mono">{player?.dust ?? "—"}</span>
                </div>
              </Tooltip>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className={helpButtonClassName}
                aria-label="Открыть гайд"
              >
                ?
              </button>
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
              <Tooltip text={TOOLTIPS.dust}>
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span className="font-mono">{player?.dust ?? "—"}</span>
                </div>
              </Tooltip>

              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className={helpButtonClassName}
                aria-label="Открыть гайд"
              >
                ?
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200/80 transition-colors hover:bg-slate-900/60"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <span>{user?.username ?? "—"}</span>
                  <svg
                    className="h-3.5 w-3.5 text-slate-200/50"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {userMenuOpen ? (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />

                    <div className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-xl border border-slate-800/60 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-200/80 transition-colors hover:bg-slate-800/60"
                      >
                        Выйти
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {menuOpen ? (
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setMenuOpen(false);
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
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
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
                    {item.label}
                  </NavLink>
                ))}

                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold text-slate-200/80 transition-colors hover:bg-slate-900/50"
                >
                  <span className={helpButtonClassName}>?</span>
                  <span>Гайд</span>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-50">
                    {user?.username ?? "—"}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-200/60">
                    ✨ <span className="font-mono">{player?.dust ?? "—"}</span>
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

      <GuideDrawer open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
