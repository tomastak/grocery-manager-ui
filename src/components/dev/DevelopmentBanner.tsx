import { AlertTriangle, Code, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const DevelopmentBanner = () => {
  const isDev = import.meta.env.DEV;
  const usingMockApi = isDev && !import.meta.env.VITE_USE_REAL_API;

  if (!isDev) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-orange-800 font-medium">Development Mode</span>
          {usingMockApi && (
            <>
              <Badge
                variant="outline"
                className="text-orange-700 border-orange-300"
              >
                <Database className="w-3 h-3 mr-1" />
                Mock API
              </Badge>
              <span className="text-orange-700 text-sm">
                Using demo data. Demo login: admin / admin
              </span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-1 text-xs text-orange-600">
          <Code className="w-3 h-3" />
          <span>DEV</span>
        </div>
      </AlertDescription>
    </Alert>
  );
};
