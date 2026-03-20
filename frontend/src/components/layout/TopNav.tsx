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
          <NavLink to="/raid" className={linkClassName}>
            Рейд
          </NavLink>
          <NavLink to="/craft" className={linkClassName}>
            Крафт
          </NavLink>
          <NavLink to="/collection" className={linkClassName}>
            Коллекция
          </NavLink>
        </nav>

        <div className="flex items-center gap-4 text-sm font-semibold text-slate-200/80">
          <div className="hidden items-center gap-2 sm:flex">
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
    </header>
  );
}
