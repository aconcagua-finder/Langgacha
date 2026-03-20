import { Navigate, Route, Routes } from "react-router-dom";

import { TopNav } from "./components/layout/TopNav";
import { PlayerProvider } from "./contexts/PlayerContext";
import { useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { BoosterPage } from "./pages/BoosterPage";
import { BattlePage } from "./pages/BattlePage";
import { CollectionPage } from "./pages/CollectionPage";
import { CraftPage } from "./pages/CraftPage";

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-10 text-sm text-slate-200/70">
        Загрузка…
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
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/craft" element={<CraftPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </PlayerProvider>
  );
}
