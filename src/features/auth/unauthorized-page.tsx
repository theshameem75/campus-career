import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";

export function UnauthorizedPage() {
  const { session, signOut } = useAuth();
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <section className="max-w-md text-center">
        <ShieldX className="mx-auto size-12 text-destructive" />
        <h1 className="mt-5 text-2xl font-semibold">Access unavailable</h1>
        <p className="mt-2 text-muted-foreground">
          Your current CampusCareer role does not allow access to this area.
        </p>
        {session && (
          <p className="mt-4 rounded-lg border bg-card p-3 text-sm">
            Signed in as {session.user.email || session.user.name}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button onClick={() => void signOut()}>Sign out</Button>
        </div>
      </section>
    </main>
  );
}
