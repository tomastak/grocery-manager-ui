import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { login, isLoading, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginForm onLogin={login} isLoading={isLoading} />;
}
