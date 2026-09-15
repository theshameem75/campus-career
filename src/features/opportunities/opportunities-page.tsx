import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, CalendarDays, CheckCircle2, MapPin, Plus, Send, XCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";
import { applyToOpportunity, createOpportunity, listApplications, listOpportunities, transitionOpportunity, type Opportunity, type OpportunityInput } from "@/features/career/career-api";
import { hasRole } from "@/types/auth";

function money(minor?: number, currency?: string): string {
  if (minor === undefined) return "Stipend not specified";
  return new Intl.NumberFormat("en", { style: "currency", currency: currency || "BDT", maximumFractionDigits: 0 }).format(minor / 100);
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

function CreateOpportunityForm({ onClose }: { onClose: () => void }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: OpportunityInput) => {
      if (!session) throw new Error("Your session is unavailable.");
      return createOpportunity(input, session);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      toast.success("Draft opportunity created");
      onClose();
    },
    onError: (error) => toast.error(message(error)),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    mutation.mutate({
      title: String(values.get("title") || "").trim(),
      description: String(values.get("description") || "").trim(),
      requirements: String(values.get("requirements") || "").trim(),
      workMode: String(values.get("workMode") || "HYBRID"),
      city: String(values.get("city") || "").trim(),
      countryCode: String(values.get("countryCode") || "BD").toUpperCase(),
      durationWeeks: Number(values.get("durationWeeks")),
      stipendMinor: Math.round(Number(values.get("stipend")) * 100),
      currency: String(values.get("currency") || "BDT").toUpperCase(),
      slotCount: Number(values.get("slotCount")),
      deadlineAt: String(values.get("deadlineAt")),
    });
  };
  const input = "h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
  return (
    <form className="grid gap-4 rounded-2xl border bg-card p-6 shadow-sm" onSubmit={submit}>
      <div className="flex items-center justify-between gap-4">
        <div><h2 className="text-lg font-semibold">Create an internship</h2><p className="text-sm text-muted-foreground">It starts as a draft and must be approved before students can see it.</p></div>
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm md:col-span-2">Title<input className={input} name="title" required /></label>
        <label className="grid gap-1.5 text-sm md:col-span-2">Description<textarea className="min-h-24 rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="description" required /></label>
        <label className="grid gap-1.5 text-sm md:col-span-2">Requirements<textarea className="min-h-20 rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="requirements" required /></label>
        <label className="grid gap-1.5 text-sm">Work mode<select className={input} name="workMode" defaultValue="HYBRID"><option>ONSITE</option><option>HYBRID</option><option>REMOTE</option></select></label>
        <label className="grid gap-1.5 text-sm">City<input className={input} name="city" required /></label>
        <label className="grid gap-1.5 text-sm">Country code<input className={input} name="countryCode" defaultValue="BD" maxLength={2} required /></label>
        <label className="grid gap-1.5 text-sm">Duration (weeks)<input className={input} name="durationWeeks" type="number" min={1} defaultValue={12} required /></label>
        <label className="grid gap-1.5 text-sm">Monthly stipend<input className={input} name="stipend" type="number" min={0} defaultValue={0} required /></label>
        <label className="grid gap-1.5 text-sm">Currency<input className={input} name="currency" defaultValue="BDT" maxLength={3} required /></label>
        <label className="grid gap-1.5 text-sm">Openings<input className={input} name="slotCount" type="number" min={1} defaultValue={1} required /></label>
        <label className="grid gap-1.5 text-sm">Application deadline<input className={input} name="deadlineAt" type="datetime-local" required /></label>
      </div>
      <Button className="w-fit" disabled={mutation.isPending} type="submit"><Plus className="size-4" />{mutation.isPending ? "Creating…" : "Create draft"}</Button>
    </form>
  );
}

export function OpportunitiesPage({ mode = "browse" }: { mode?: "browse" | "employer" | "approval" }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const query = useQuery({ queryKey: ["opportunities", session?.user.id, mode], queryFn: listOpportunities });
  const applications = useQuery({ queryKey: ["applications", session?.user.id, "apply-state"], queryFn: listApplications, enabled: session?.role === "student" && mode === "browse" });
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["opportunities"] }),
      queryClient.invalidateQueries({ queryKey: ["applications"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard-counts"] }),
    ]);
  };
  const transition = useMutation({
    mutationFn: ({ opportunity, status }: { opportunity: Opportunity; status: "PENDING_APPROVAL" | "PUBLISHED" | "DRAFT" | "CLOSED" }) => {
      if (!session) throw new Error("Your session is unavailable.");
      return transitionOpportunity(opportunity, status, session);
    },
    onSuccess: async () => { await refresh(); toast.success("Opportunity status updated"); },
    onError: (error) => toast.error(message(error)),
  });
  const apply = useMutation({
    mutationFn: (opportunity: Opportunity) => {
      if (!session) throw new Error("Your session is unavailable.");
      return applyToOpportunity(opportunity, session);
    },
    onSuccess: async () => { await refresh(); toast.success("Application submitted"); },
    onError: (error) => toast.error(message(error)),
  });
  const opportunities = (query.data ?? []).filter((item) => {
    if (mode === "approval") return item.status === "PENDING_APPROVAL";
    if (mode === "browse" && session?.role === "student") return item.status === "PUBLISHED";
    return true;
  });
  const title = mode === "approval" ? "Opportunity approvals" : mode === "employer" ? "Employer job posts" : "Opportunities";
  const appliedIds = new Set((applications.data ?? []).map((item) => item.opportunityId));
  const isEmployer = Boolean(session && hasRole(session.roles, "employer-user"));
  const isReviewer = Boolean(session && (["career-staff", "career-manager"] as const).some((role) => hasRole(session.roles, role)));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">CampusCareer</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{mode === "approval" ? "Review submitted postings before publication." : mode === "employer" ? "Create drafts, request approval, and close published jobs." : "Browse approved roles and apply with your saved profile and default CV."}</p>
        </div>
        {mode === "employer" && isEmployer && !creating && <Button onClick={() => setCreating(true)}><Plus className="size-4" />Create job</Button>}
      </div>
      {creating && <CreateOpportunityForm onClose={() => setCreating(false)} />}
      {query.isLoading && <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Loading opportunities…</div>}
      {query.isError && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive" role="alert">The opportunity feed could not be loaded for this role.</div>}
      {!query.isLoading && !query.isError && opportunities.length === 0 && <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">No opportunities are available in this view.</div>}
      <div className="grid gap-4 xl:grid-cols-2">
        {opportunities.map((opportunity) => {
          const alreadyApplied = appliedIds.has(opportunity.ItemId);
          const busy = transition.isPending || apply.isPending;
          return (
            <article className="rounded-2xl border bg-card p-6 shadow-sm" key={opportunity.ItemId}>
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">{opportunity.status?.replaceAll("_", " ")}</p><h2 className="mt-2 text-xl font-semibold">{opportunity.title}</h2></div><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BriefcaseBusiness className="size-5" /></span></div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{opportunity.description}</p>
              {opportunity.requirements && <p className="mt-3 text-sm"><span className="font-medium">Requirements:</span> {opportunity.requirements}</p>}
              <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2"><p className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" />{opportunity.workMode} · {opportunity.city}, {opportunity.countryCode}</p><p className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" />Apply by {opportunity.deadlineAt ? new Date(opportunity.deadlineAt).toLocaleString() : "TBD"}</p></div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground"><span className="rounded-full bg-muted px-3 py-1.5">{money(opportunity.stipendMinor, opportunity.currency)}</span><span className="rounded-full bg-muted px-3 py-1.5">{opportunity.durationWeeks} weeks</span><span className="rounded-full bg-muted px-3 py-1.5">{opportunity.slotCount} openings</span></div>
              <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                {mode === "browse" && session?.role === "student" && <Button disabled={busy || alreadyApplied} onClick={() => apply.mutate(opportunity)}>{alreadyApplied ? <CheckCircle2 className="size-4" /> : <Send className="size-4" />}{alreadyApplied ? "Applied" : "Apply now"}</Button>}
                {mode === "employer" && isEmployer && opportunity.status === "DRAFT" && <Button disabled={busy} onClick={() => transition.mutate({ opportunity, status: "PENDING_APPROVAL" })}><Send className="size-4" />Submit for approval</Button>}
                {mode === "employer" && isEmployer && opportunity.status === "PUBLISHED" && <Button variant="outline" disabled={busy} onClick={() => transition.mutate({ opportunity, status: "CLOSED" })}>Close job</Button>}
                {mode === "approval" && isReviewer && <><Button disabled={busy} onClick={() => transition.mutate({ opportunity, status: "PUBLISHED" })}><CheckCircle2 className="size-4" />Approve & publish</Button><Button variant="outline" disabled={busy} onClick={() => transition.mutate({ opportunity, status: "DRAFT" })}><XCircle className="size-4" />Return to draft</Button></>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
