import { ReactNode } from "react";
import { AuthContext } from "@/lib/auth";
import { useAuthHook } from "@/hooks/useAuth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuthHook();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
