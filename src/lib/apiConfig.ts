// API Configuration Helper
// This helps with debugging API connection issues

export interface ApiConfig {
  baseUrl: string;
  isDevelopmentMode: boolean;
  isRealApiEnabled: boolean;
}

export const getApiConfig = (): ApiConfig => {
  // Get API base URL from runtime config or environment variable
  const getApiBaseUrl = (): string => {
    // Check if running in browser and runtime config is available
    if (typeof window !== "undefined" && (window as any).ENV) {
      return (window as any).ENV.VITE_API_BASE_URL || "http://localhost:8080";
    }

    // Fallback to build-time environment variable
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  };

  const isDevelopmentMode =
    import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API;
  const baseUrl = getApiBaseUrl();

  return {
    baseUrl,
    isDevelopmentMode,
    isRealApiEnabled: !isDevelopmentMode,
  };
};

export const logApiConfig = () => {
  const config = getApiConfig();
  console.log("🔧 FreshMart API Configuration:", {
    "Base URL": config.baseUrl,
    "Development Mode": config.isDevelopmentMode,
    "Real API Enabled": config.isRealApiEnabled,
    Environment: import.meta.env.MODE,
  });
};

// Call this to debug API configuration
if (import.meta.env.DEV) {
  logApiConfig();
}
