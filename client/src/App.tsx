import React, { useState } from "react";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { Header } from "./components/common/Header";
import { AuthModal } from "./features/auth/components/AuthModal";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { RocketGame } from "./features/betting/components/RocketGame/index";
import { Lobby } from "./pages/Lobby"; // ✅ ADD THIS
import { PoolPage } from "./features/pool/pages/PoolPage";

export default function App() {
  const [view, setView] = useState("lobby");

  return (
    <AuthProvider>
      <Header onGoHome={() => setView("lobby")} />

      {/* ✅ SHOW LOBBY */}
      {view === "lobby" && (
        <Lobby
          onSelectGame={() => setView("game")}
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
