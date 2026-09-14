import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { completeLogin } from "@/lib/blocks/auth";
import { useAuth } from "@/features/auth/use-auth";

export function CallbackPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      try {
        const result = await completeLogin(window.location.href);
        if (!result.ok) return setError(result.message);
        if (!(await refresh())) {
          return setError(
            "Sign-in completed, but no secure Blocks session was available.",
          );
        }
        navigate(result.returnTo, { replace: true });
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to complete sign-in.",
        );
      }
    })();
  }, [navigate, refresh]);

  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <section className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <GraduationCapMark />
        <h1 className="mt-5 text-xl font-semibold">
          {error ? "Sign-in failed" : "Completing sign-in"}
        </h1>
        <p
          className={`mt-3 text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
          role={error ? "alert" : "status"}
        >
          {error || "Securely establishing your CampusCareer session…"}
        </p>
        {error && (
          <Button
            className="mt-6"
            onClick={() => navigate("/login", { replace: true })}
          >
            Back to login
          </Button>
        )}
      </section>
    </main>
  );
}

function GraduationCapMark() {
  return (
    <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
      CC
    </span>
  );
}
