import { Topbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div>
      <Topbar
        title="Settings"
        description="Dashboard configuration"
      />

      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              EUC Dashboard - Empower Upper Cumberland Program Analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-muted-foreground">0.1.0</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Tech Stack</p>
              <p className="text-sm text-muted-foreground">
                Next.js 16, React 19, Tailwind CSS v4, Drizzle ORM, Supabase
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Data Source</p>
              <p className="text-sm text-muted-foreground">
                Supabase PostgreSQL database with EUC participant data
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Refresh</CardTitle>
            <CardDescription>
              Data is loaded server-side on each page request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The dashboard pulls live data from the database. No caching is currently enabled.
              Future updates may include configurable caching and manual refresh options.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
