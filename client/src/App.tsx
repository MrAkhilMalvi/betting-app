import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RocketGame } from "./components/RocketGame";

export default function App() {
  const [view, setView] = useState("lobby");

  return (
    <AuthProvider>
      <Header onGoHome={() => setView("lobby")} />

      {view === "game" && (
        <ProtectedRoute>
          <RocketGame />
        </ProtectedRoute>
      )}

      <AuthModal />
    </AuthProvider>
  );
}