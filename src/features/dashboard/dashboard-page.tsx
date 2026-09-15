import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  FileCheck2,
  GraduationCap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/use-auth";
import { dashboardCounts } from "@/features/career/career-api";
import { roleLabels } from "@/types/auth";

export function DashboardPage() {
  const { session } = useAuth();
  const pending = session?.role === "pending-user";
  const counts = useQuery({
    queryKey: ["dashboard-counts", session?.user.id],
    queryFn: dashboardCounts,
    enabled: Boolean(session && !pending),
  });
  const cards = [
    { label: "Active opportunities", value: counts.data?.opportunities ?? "—", detail: "Live approved postings", icon: BriefcaseBusiness },
    { label: "Applications", value: counts.data?.applications ?? "—", detail: "Visible in your role scope", icon: FileCheck2 },
    { label: "Follow-ups due", value: counts.data?.followUps ?? "—", detail: "Open outcome confirmations", icon: CalendarClock },
  ];
  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-primary">
          {session ? roleLabels[session.role] : "Workspace"}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Welcome, {session?.user.name || "there"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your role-aware university internship workspace.
        </p>
      </div>
      {pending ? (
        <section className="rounded-2xl border border-status-warning/40 bg-status-warning/10 p-6">
          <h2 className="text-lg font-semibold">Verification is pending</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your account has no student, employer, or staff authority yet. A
            career-services administrator must match your verified identity to
            the university directory before access is granted.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map(({ icon: Icon, ...card }) => (
            <section
              className="rounded-2xl border bg-card p-5 shadow-sm"
              key={card.label}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{card.value}</p>
                </div>
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {card.detail}
              </p>
            </section>
          ))}
        </div>
      )}
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="size-6 text-primary" />
          <h2 className="text-lg font-semibold">Implementation foundation</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          The authenticated shell, role boundaries, and 36-collection Blocks
          data model are live. Demo opportunities and applications are now
          filtered by your organization and CampusCareer role.
        </p>
        <Link
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          to="/opportunities"
        >
          Explore workspace <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}

export function WorkspacePage({ area }: { area: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-primary">CampusCareer</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{area}</h1>
      <div className="mt-7 rounded-2xl border border-dashed bg-card p-10 text-center">
        <h2 className="font-semibold">Feature foundation reserved</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          This route is protected by the planned role boundary and is ready for
          its Blocks Data workflow after tenant policy activation.
        </p>
      </div>
    </div>
  );
}
