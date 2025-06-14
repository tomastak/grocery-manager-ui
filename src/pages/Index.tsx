import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-grocery-50 via-fresh-50 to-organic-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-grocery-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading FreshMart...</p>
        </div>
      </div>
    );
  }

  // Redirect to appropriate page based on authentication status
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}
