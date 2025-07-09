import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function SupabaseSetupScreen() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="max-w-md w-full card-shadow-lg border-gray-200 dark:border-gray-600">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Supabase Configuration Required
          </CardTitle>
        </CardContent>
      </Card>
    </div>
  );
}
