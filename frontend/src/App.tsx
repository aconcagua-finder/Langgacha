import { Navigate, Route, Routes } from "react-router-dom";

import { TopNav } from "./components/layout/TopNav";
import { BoosterPage } from "./pages/BoosterPage";
import { BattlePage } from "./pages/BattlePage";
import { CollectionPage } from "./pages/CollectionPage";
import { CraftPage } from "./pages/CraftPage";

export default function App() {
  return (
    <div>
      <TopNav />
      <Routes>
        <Route path="/" element={<BoosterPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/craft" element={<CraftPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
