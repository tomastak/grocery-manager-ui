import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { DevelopmentBanner } from "@/components/dev/DevelopmentBanner";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { login, isLoading, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      <div className="fixed top-4 left-4 right-4 z-50">
        <DevelopmentBanner />
      </div>
      <LoginForm onLogin={login} isLoading={isLoading} />
    </div>
  );
}
