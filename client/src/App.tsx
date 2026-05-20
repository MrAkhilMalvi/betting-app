import React, { useState } from "react";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { Header } from "./components/common/Header";
import { AuthModal } from "./features/auth/components/AuthModal";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { RocketGame } from "./features/betting/pages/index";
import { Lobby } from "./pages/Lobby";
import { PoolPage } from "./features/pool/pages/PoolPage";
import { Leaderboard } from "./features/leaderboard/components/Leaderboard";
import { ChevronLeft } from "lucide-react";
import { ViewState } from "./types/types";
import AppLayout from "./Layout";



export default function App() {
  const [view, setView] = useState<ViewState>("lobby");

  const handleBackToLobby = () => setView("lobby");

  return (
    <AuthProvider>
      <AppLayout
        view={view}
        onBackToLobby={handleBackToLobby}
        onOpenLeaderboard={() => setView("leaderboard")}
      >
        {/* Render views with precise entry transitions */}
        <div className="h-full w-full">
          {view === "lobby" && (
            <div className="animate-fadeIn">
              <Lobby
                onSelectGame={() => setView("game")}
                onOpenPool={() => setView("pool")}
                onOpenLeaderboard={() => setView("leaderboard")}
              />
            </div>
          )}

          {view === "game" && (
            <ProtectedRoute>
              <div className="animate-fadeIn">
                <RocketGame />
              </div>
            </ProtectedRoute>
          )}

          {view === "pool" && (
            <ProtectedRoute>
              <div className="animate-fadeIn">
                <PoolPage />
              </div>
            </ProtectedRoute>
          )}

          {view === "leaderboard" && (
            <div className="animate-fadeIn">
              <Leaderboard />
            </div>
          )}
        </div>
      </AppLayout>
      <AuthModal />
    </AuthProvider>
  );
}
