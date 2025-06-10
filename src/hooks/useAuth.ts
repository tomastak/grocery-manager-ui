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

      let errorTitle = "Login Failed";
      let errorDescription = "Invalid username or password";

      if (apiError.status === 401) {
        errorTitle = "Authentication Failed";
        errorDescription =
          apiError.message ||
          "Invalid credentials. Please check your username and password.";
      } else if (apiError.status === 0) {
        errorTitle = "Connection Failed";
        errorDescription =
          "Cannot connect to the API server. Please check if the server is running and the URL is correct.";
      } else if (apiError.status >= 500) {
        errorTitle = "Server Error";
        errorDescription =
          "The server encountered an error. Please try again later.";
      } else {
        errorDescription = apiError.message || "An unexpected error occurred";
      }

      toast({
        title: errorTitle,
        description: errorDescription,
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
