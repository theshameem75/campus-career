import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, Clock3, FileUser } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";
import {
  listApplications,
  listOpportunities,
  listRejectionReasons,
  listStageEvents,
  recordEmployerOutcome,
  screenApplication,
  withdrawApplication,
  type Application,
  type RejectionReason,
} from "@/features/career/career-api";
import { hasRole } from "@/types/auth";

function message(error: unknown): string {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export function ApplicationsPage({ employerView = false }: { employerView?: boolean }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [reasonCodes, setReasonCodes] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const query = useQuery({
    queryKey: ["applications", session?.user.id, employerView],
    queryFn: async () => {
      const [applications, opportunities, events, reasons] = await Promise.all([
        listApplications(),
        listOpportunities(),
        listStageEvents().catch(() => []),
        listRejectionReasons().catch(() => []),
      ]);
      return { applications, opportunities, events, reasons };
    },
  });
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["applications"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard-counts"] }),
    ]);
  };
  const action = useMutation({
    mutationFn: async ({ type, application, reason }: { type: string; application: Application; reason?: RejectionReason }) => {
      if (!session) throw new Error("Your session is unavailable.");
      if (type === "WITHDRAW") return withdrawApplication(application, session);
      if (type === "SHORTLIST" || type === "REJECT") {
        return screenApplication(application, type, session, reason, notes[application.ItemId] || "");
      }
      return recordEmployerOutcome(application, type as "INTERVIEW_SCHEDULED" | "INTERVIEWED" | "OFFERED" | "HIRED" | "NOT_SELECTED", session);
    },
    onSuccess: async () => { await refresh(); toast.success("Application workflow updated"); },
    onError: async (error) => {
      await refresh();
      toast.error(message(error));
    },
  });
  const opportunityNames = new Map((query.data?.opportunities ?? []).map((item) => [item.ItemId, item.title]));
  const isStudent = Boolean(session && hasRole(session.roles, "student"));
  const isStaff = Boolean(session && (["career-staff", "career-manager"] as const).some((role) => hasRole(session.roles, role)));
  const isEmployer = Boolean(session && hasRole(session.roles, "employer-user"));
  const reasons = query.data?.reasons ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">CampusCareer</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{employerView ? "Candidates and outcomes" : isStudent ? "My applications" : "Application screening"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{employerView ? "Move shortlisted candidates through interviews, offers, and hiring." : isStudent ? "Track every application and its complete status timeline." : "Shortlist candidates or reject them with an approved respectful reason."}</p>
      </div>
      {query.isLoading && <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Loading applications…</div>}
      {query.isError && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive" role="alert">Applications could not be loaded for this role.</div>}
      {!query.isLoading && !query.isError && query.data?.applications.length === 0 && <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">No applications are available in this view.</div>}
      <div className="grid gap-4">
        {query.data?.applications.map((application) => {
          const applicationEvents = query.data.events.filter((event) => event.applicationId === application.ItemId);
          const selectedReason = reasons.find((reason) => reason.code === reasonCodes[application.ItemId]);
          const canScreen = isStaff && ["SUBMITTED", "NEEDS_REVIEW"].includes(application.status || "");
          const canEmployerUpdate = employerView && isEmployer && ["SHORTLISTED", "INTERVIEW", "INTERVIEWED", "OFFERED"].includes(application.status || "");
          const employerActions = application.status === "SHORTLISTED"
            ? [{ value: "INTERVIEW_SCHEDULED", label: "Schedule interview" }, { value: "NOT_SELECTED", label: "Not selected" }]
            : application.status === "INTERVIEW"
              ? [{ value: "INTERVIEWED", label: "Interviewed" }, { value: "NOT_SELECTED", label: "Not selected" }]
              : application.status === "INTERVIEWED"
                ? [{ value: "OFFERED", label: "Offer" }, { value: "NOT_SELECTED", label: "Not selected" }]
                : [{ value: "HIRED", label: "Hired" }, { value: "NOT_SELECTED", label: "Not selected" }];
          return (
            <article className="rounded-2xl border bg-card p-5 shadow-sm" key={application.ItemId}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileUser className="size-5" /></span>
                  <div>
                    <h2 className="font-semibold">{opportunityNames.get(application.opportunityId || "") || `Application ${application.ItemId.slice(0, 8)}`}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Submitted {application.submittedAt ? new Date(application.submittedAt).toLocaleString() : "date unavailable"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">{application.status?.replaceAll("_", " ")}</span><span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">AI {application.aiProcessingStatus?.toLowerCase()}</span></div>
              </div>

              {applicationEvents.length > 0 && (
                <div className="mt-5 rounded-xl bg-muted/50 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4" />Timeline</h3>
                  <ol className="mt-3 grid gap-3 border-l pl-4">
                    {applicationEvents.map((event) => <li className="text-sm" key={event.ItemId}><p className="font-medium">{event.toStage?.replaceAll("_", " ")}</p><p className="text-xs text-muted-foreground">{event.occurredAt ? new Date(event.occurredAt).toLocaleString() : ""}{event.candidateVisibleText ? ` · ${event.candidateVisibleText}` : ""}</p></li>)}
                  </ol>
                </div>
              )}

              {isStudent && application.status === "SUBMITTED" && <div className="mt-5 border-t pt-4"><Button variant="outline" disabled={action.isPending} onClick={() => action.mutate({ type: "WITHDRAW", application })}>Withdraw application</Button></div>}

              {canScreen && (
                <div className="mt-5 grid gap-3 border-t pt-4">
                  <textarea className="min-h-20 rounded-lg border bg-background p-3 text-sm" placeholder="Internal screening notes (optional)" value={notes[application.ItemId] || ""} onChange={(event) => setNotes((current) => ({ ...current, [application.ItemId]: event.target.value }))} />
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={action.isPending} onClick={() => action.mutate({ type: "SHORTLIST", application })}>Shortlist for employer</Button>
                    <select aria-label="Rejection reason" className="h-10 rounded-lg border bg-background px-3 text-sm" value={reasonCodes[application.ItemId] || ""} onChange={(event) => setReasonCodes((current) => ({ ...current, [application.ItemId]: event.target.value }))}><option value="">Select rejection reason</option>{reasons.map((reason) => <option key={reason.ItemId} value={reason.code}>{reason.label}</option>)}</select>
                    <Button variant="outline" disabled={action.isPending || !selectedReason} onClick={() => action.mutate({ type: "REJECT", application, reason: selectedReason })}>Reject respectfully</Button>
                  </div>
                </div>
              )}

              {canEmployerUpdate && (
                <div className="mt-5 border-t pt-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-medium"><BriefcaseBusiness className="size-4" />Record employer outcome</p>
                  <div className="flex flex-wrap gap-2">
                    {employerActions.map((outcome) => <Button key={outcome.value} size="sm" variant={outcome.value === "HIRED" ? "default" : "outline"} disabled={action.isPending} onClick={() => action.mutate({ type: outcome.value, application })}>{outcome.label}</Button>)}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
