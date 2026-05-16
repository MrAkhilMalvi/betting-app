export type User = {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (v: boolean) => void;
  login: (data: { identifier: string; password: string }) => Promise<void>;
  signup: (data: {
    username: string;
    email?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
};