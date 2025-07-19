import { vi } from "vitest";
import { createContext } from "react";

// AuthContextのモック
const mockAuthContext = {
  user: null,
  session: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  loading: false,
};

const AuthContext = createContext(mockAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return mockAuthContext;
};

// AuthContextのモック設定
vi.mock("@/contexts/auth-context", () => ({
  AuthProvider,
  useAuth,
}));
