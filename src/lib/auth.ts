import { createContext, useContext } from "react";
import { User } from "@/types/product";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const getStoredCredentials = (): string | null => {
  return localStorage.getItem("auth_credentials");
};

export const isAuthenticated = (): boolean => {
  return getStoredCredentials() !== null;
};

export const clearAuth = (): void => {
  localStorage.removeItem("auth_credentials");
};
