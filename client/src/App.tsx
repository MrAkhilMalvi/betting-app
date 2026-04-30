import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RocketGame } from "./components/RocketGame";
import { Lobby } from "./pages/Lobby"; // ✅ ADD THIS

export default function App() {
  const [view, setView] = useState("lobby");

  return (
    <AuthProvider>
      <Header onGoHome={() => setView("lobby")} />

      {/* ✅ SHOW LOBBY */}
      {view === "lobby" && (
        <Lobby onSelectGame={() => setView("game")} />
      )}

      {/* ✅ SHOW GAME */}
      {view === "game" && (
        <ProtectedRoute>
          <RocketGame />
        </ProtectedRoute>
      )}

      <AuthModal />
    </AuthProvider>
  );
}