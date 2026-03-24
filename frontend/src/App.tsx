import { Navigate, Route, Routes } from "react-router-dom";

import { TopNav } from "./components/layout/TopNav";
import { PlayerProvider } from "./contexts/PlayerContext";
import { useAuth } from "./contexts/AuthContext";
import { useConfig } from "./contexts/ConfigContext";
import { AuthPage } from "./pages/AuthPage";
import { BattlesPage } from "./pages/BattlesPage";
import { BoosterPage } from "./pages/BoosterPage";
import { CollectionPage } from "./pages/CollectionPage";

export default function App() {
  const { loading: configLoading, error: configError } = useConfig();
  const { isAuthenticated, loading } = useAuth();

  if (configLoading || loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-10 text-sm text-slate-200/70">
        Загрузка…
      </main>
    );
  }

  if (configError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-10 text-sm text-rose-100">
        Ошибка загрузки конфигурации: {configError}
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <PlayerProvider>
      <div>
        <TopNav />
        <Routes>
          <Route path="/" element={<BoosterPage />} />
          <Route path="/battles" element={<BattlesPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/craft" element={<CollectionPage />} />
          <Route path="/battle" element={<Navigate to="/battles" replace />} />
          <Route path="/raid" element={<Navigate to="/battles?tab=raid" replace />} />
          <Route path="/craft" element={<Navigate to="/collection/craft" replace />} />
          <Route path="/guide" element={<Navigate to="/?guide=1" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </PlayerProvider>
  );
}
