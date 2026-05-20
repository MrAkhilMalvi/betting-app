export interface User {
  id: string;
  username: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}

export type AuthMethod = "email" | "mobile" | "google";

export type ViewState = "lobby" | "game" | "pool" | "leaderboard";

export interface AppLayoutProps {
  view: ViewState;
  onBackToLobby: () => void;
  onOpenLeaderboard: () => void;
  children: React.ReactNode;
}
