import { NavLink } from "react-router-dom";

import { usePlayer } from "../../contexts/PlayerContext";

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
    isActive ? "bg-slate-800 text-slate-50" : "text-slate-200/80 hover:bg-slate-900/50",
  ].join(" ");

export function TopNav() {
  const { player } = usePlayer();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="text-lg font-extrabold tracking-tight">LangGacha</div>
          <div className="hidden text-xs text-slate-200/60 sm:block">Prototype</div>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClassName} end>
            Бустер
          </NavLink>
          <NavLink to="/battle" className={linkClassName}>
            Бой
          </NavLink>
          <NavLink to="/collection" className={linkClassName}>
            Коллекция
          </NavLink>
        </nav>

        <div className="hidden items-center gap-2 text-sm font-semibold text-slate-200/80 sm:flex">
          <span>✨</span>
          <span className="font-mono">{player?.polvo ?? "—"}</span>
          <span>Polvo</span>
        </div>
      </div>
    </header>
  );
}
