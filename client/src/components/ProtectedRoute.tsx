import { useAuth } from "../context/AuthContext";

export const ProtectedRoute: React.FC<{ children: any }> = ({ children }) => {
  const { user, loading, setAuthModalOpen } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
    setAuthModalOpen(true);
    return null;
  }

  return children;
};