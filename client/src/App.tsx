import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RocketGame } from "./components/RocketGame";
import { Lobby } from "./pages/Lobby"; // ✅ ADD THIS
import { PoolPage } from "./modules/pool/pages/PoolPage";

export default function App() {
  const [view, setView] = useState("lobby");

  return (
    <AuthProvider>
      <Header onGoHome={() => setView("lobby")} />

      {/* ✅ SHOW LOBBY */}
      {view === "lobby" && (
        <Lobby onSelectGame={() => setView("game")}
        onOpenPool={() => setView("pool")}
        />
      )}

      {/* ✅ SHOW GAME */}
      {view === "game" && (
        <ProtectedRoute>
          <RocketGame />
        </ProtectedRoute>
      )}

      {/* 🔥 SHOW POOL */}
{view === "pool" && (
  <ProtectedRoute>
    <PoolPage />
  </ProtectedRoute>
)}



      <AuthModal />
    </AuthProvider>
  );
}