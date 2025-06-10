import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Globe,
  Lock,
  Database,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { getApiConfig } from "@/lib/apiConfig";

export const ApiDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "idle" | "testing" | "success" | "error";
    message: string;
    details?: any;
  }>({ status: "idle", message: "" });

  const config = getApiConfig();

  const testApiConnection = async () => {
    setTestResult({ status: "testing", message: "Testing API connection..." });

    try {
      await apiClient.healthCheck();
      setTestResult({
        status: "success",
        message: "API connection successful!",
      });
    } catch (error: any) {
      setTestResult({
        status: "error",
        message: `API connection failed: ${error.message}`,
        details: error,
      });
    }
  };

  const testAuthentication = async () => {
    setTestResult({ status: "testing", message: "Testing authentication..." });

    const credentials = localStorage.getItem("auth_credentials");
    if (!credentials) {
      setTestResult({
        status: "error",
        message: "No authentication credentials found. Please login first.",
      });
      return;
    }

    try {
      await apiClient.getProducts();
      setTestResult({
        status: "success",
        message: "Authentication successful!",
      });
    } catch (error: any) {
      setTestResult({
        status: "error",
        message: `Authentication failed: ${error.message}`,
        details: error,
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Settings className="w-4 h-4 mr-2" />
        API Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">API Debug Panel</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">API Configuration</span>
          </div>
          <div className="ml-6 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Base URL:</span>
              <span className="font-mono text-xs">{config.baseUrl}</span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <Badge
                variant={config.isDevelopmentMode ? "secondary" : "default"}
              >
                {config.isDevelopmentMode ? "Mock API" : "Real API"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Authentication</span>
          </div>
          <div className="ml-6 text-sm">
            {localStorage.getItem("auth_credentials") ? (
              <Badge variant="default" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Credentials Stored
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <XCircle className="w-3 h-3 mr-1" />
                No Credentials
              </Badge>
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium">API Tests</span>
          </div>
          <div className="ml-6 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testApiConnection}
              disabled={testResult.status === "testing"}
              className="w-full"
            >
              {testResult.status === "testing" ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testAuthentication}
              disabled={testResult.status === "testing"}
              className="w-full"
            >
              {testResult.status === "testing" ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Test Auth
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResult.status !== "idle" && (
          <Alert
            variant={testResult.status === "error" ? "destructive" : "default"}
          >
            {testResult.status === "success" && (
              <CheckCircle className="h-4 w-4" />
            )}
            {testResult.status === "error" && <XCircle className="h-4 w-4" />}
            {testResult.status === "testing" && (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className="text-sm">
              {testResult.message}
              {testResult.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">Details</summary>
                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t text-xs text-gray-500">
          <div>Current API URL: {apiClient.getBaseUrl()}</div>
          <div>To change: Set VITE_API_BASE_URL environment variable</div>
        </div>
      </CardContent>
    </Card>
  );
};
