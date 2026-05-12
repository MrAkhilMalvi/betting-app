export interface User {
  id: string;
  username: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}

export type AuthMethod = "email" | "mobile" | "google";
