import { useState, useEffect } from "react";
import { User, LoginRequest, ApiError } from "@/types/product";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export const useAuthHook = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const credentials = localStorage.getItem("auth_credentials");
    if (credentials) {
      // Extract username from stored credentials
      try {
        const decoded = atob(credentials);
        const [username] = decoded.split(":");
        setUser({
          id: 1,
          username,
          role: "admin",
        });
      } catch (error) {
        localStorage.removeItem("auth_credentials");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.login({ username, password });
      setUser(response.user);
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${response.user.username}`,
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Login Failed",
        description: apiError.message || "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiClient.logout();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
