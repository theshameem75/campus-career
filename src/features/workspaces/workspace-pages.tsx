import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Download, FileText, ShieldCheck, Upload, Users } from "lucide-react";
import { useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";
import { listApplications, listOpportunities } from "@/features/career/career-api";
import { getBlocksClient } from "@/lib/blocks/client";

type Row = Record<string, unknown> & { ItemId: string; revision?: number };

function items<T>(response: unknown, queryName: string): T[] {
  const value = response as { data?: Record<string, { items?: T[] } | undefined>; items?: T[] };
  return value.data?.[queryName]?.items ?? value.items ?? [];
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

const fieldClass = "h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

type StudentProfile = Row & {
  userId?: string; studentNumber?: string; departmentId?: string; graduationYear?: number;
  graduationTerm?: string; headline?: string; bio?: string; email?: string; phone?: string;
  linkedInUrl?: string; portfolioUrl?: string; aiConsentStatus?: string; status?: string;
};
type StudentDocument = Row & { fileId?: string; fileName?: string; fileVersion?: number; uploadedAt?: string; isDefault?: boolean; status?: string };

async function profileWorkspace() {
  const blocks = getBlocksClient();
  const [profileResponse, documentResponse] = await Promise.all([
    blocks.data.collection<StudentProfile>("StudentProfile", { fields: ["userId", "studentNumber", "departmentId", "graduationYear", "graduationTerm", "headline", "bio", "email", "phone", "linkedInUrl", "portfolioUrl", "aiConsentStatus", "status", "revision"] }).list({ pageNo: 1, pageSize: 10 }),
    blocks.data.collection<StudentDocument>("StudentDocument", { fields: ["studentProfileId", "fileId", "fileName", "fileVersion", "uploadedAt", "isDefault", "status", "revision"] }).list({ pageNo: 1, pageSize: 25 }),
  ]);
  return { profile: items<StudentProfile>(profileResponse, "getStudentProfiles")[0], documents: items<StudentDocument>(documentResponse, "getStudentDocuments") };
}

async function sha256(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, "0")).join("");
}

export function StudentProfilePage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const query = useQuery({ queryKey: ["student-workspace", session?.user.id], queryFn: profileWorkspace });
  const save = useMutation({
    mutationFn: async (form: FormData) => {
      if (!session) throw new Error("Your session is unavailable.");
      const current = query.data?.profile;
      const payload = {
        userId: session.user.id,
        studentNumber: String(form.get("studentNumber") || "").trim(),
        departmentId: String(form.get("departmentId") || "").trim(),
        graduationYear: Number(form.get("graduationYear")),
        graduationTerm: String(form.get("graduationTerm") || "").trim().toUpperCase(),
        headline: String(form.get("headline") || "").trim(),
        bio: String(form.get("bio") || "").trim(),
        email: session.user.email,
        phone: String(form.get("phone") || "").trim(),
        linkedInUrl: String(form.get("linkedInUrl") || "").trim(),
        portfolioUrl: String(form.get("portfolioUrl") || "").trim(),
        profileCompleteness: 80,
        privacyNoticeVersion: "2026.1",
        privacyAcceptedAt: new Date().toISOString(),
        aiConsentStatus: String(form.get("aiConsentStatus") || "NOT_GRANTED"),
        aiConsentVersion: "2026.1",
        aiConsentChangedAt: new Date().toISOString(),
        status: "ACTIVE",
        revision: (current?.revision ?? 0) + 1,
      };
      const profiles = getBlocksClient().data.collection<StudentProfile>("StudentProfile");
      return current ? profiles.update(current.ItemId, payload) : profiles.create(payload);
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["student-workspace"] }); toast.success("Profile saved"); },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const profile = query.data?.profile;
      if (!session || !profile) throw new Error("Save your profile before uploading a CV.");
      if (file.type !== "application/pdf") throw new Error("CVs must be PDF files.");
      if (file.size > 10 * 1024 * 1024) throw new Error("CVs must be 10 MB or smaller.");
      const blocks = getBlocksClient();
      const presign = await blocks.data.files.presignedUploadUrl({ name: file.name, parentDirectoryId: "", configurationName: "Default", accessModifier: "Private", tags: "campuscareer,cv" }) as { uploadUrl?: string; fileId?: string; isSuccess?: boolean; errors?: unknown };
      if (!presign.isSuccess || !presign.uploadUrl || !presign.fileId) throw new Error("Blocks storage could not prepare the CV upload.");
      await blocks.data.files.uploadToUrl({ url: presign.uploadUrl, body: file, contentType: file.type });
      return blocks.data.collection<StudentDocument>("StudentDocument").create({
        studentProfileId: profile.ItemId, ownerUserId: session.user.id, fileId: presign.fileId,
        fileName: file.name, mimeType: file.type, fileVersion: 1, contentHash: await sha256(file),
        isDefault: query.data?.documents.length === 0, uploadedAt: new Date().toISOString(),
        retentionUntil: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), status: "ACTIVE", revision: 1,
      });
    },
    onSuccess: async () => { if (fileRef.current) fileRef.current.value = ""; await queryClient.invalidateQueries({ queryKey: ["student-workspace"] }); toast.success("CV uploaded privately"); },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const download = async (document: StudentDocument) => {
    if (!document.fileId) return;
    try {
      const response = await getBlocksClient().data.files.get(document.fileId, { configurationName: "Default", version: document.fileVersion });
      const record = response as { downloadUrl?: string; url?: string; data?: { downloadUrl?: string; url?: string } };
      const url = record.downloadUrl ?? record.url ?? record.data?.downloadUrl ?? record.data?.url;
      if (!url) throw new Error("A download URL was not returned.");
      const link = window.document.createElement("a"); link.href = url; link.rel = "noopener"; link.click();
    } catch (error) { toast.error(errorMessage(error)); }
  };
  if (query.isLoading) return <div className="rounded-2xl border bg-card p-8">Loading profile…</div>;
  const profile = query.data?.profile;
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold text-primary">Student workspace</p><h1 className="mt-1 text-3xl font-semibold">Profile and CVs</h1><p className="mt-2 text-sm text-muted-foreground">Keep one reusable profile and a private default CV for applications.</p></div>
      <form className="grid gap-4 rounded-2xl border bg-card p-6 md:grid-cols-2" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); save.mutate(new FormData(event.currentTarget)); }}>
        <label className="grid gap-1.5 text-sm">Student number<input className={fieldClass} name="studentNumber" defaultValue={profile?.studentNumber} required /></label>
        <label className="grid gap-1.5 text-sm">Department ID<input className={fieldClass} name="departmentId" defaultValue={profile?.departmentId} required /></label>
        <label className="grid gap-1.5 text-sm">Graduation year<input className={fieldClass} name="graduationYear" type="number" min={2026} defaultValue={profile?.graduationYear} required /></label>
        <label className="grid gap-1.5 text-sm">Graduation term<input className={fieldClass} name="graduationTerm" defaultValue={profile?.graduationTerm} required /></label>
        <label className="grid gap-1.5 text-sm md:col-span-2">Headline<input className={fieldClass} name="headline" defaultValue={profile?.headline} required /></label>
        <label className="grid gap-1.5 text-sm md:col-span-2">Bio<textarea className="min-h-28 rounded-lg border bg-background p-3 text-sm" name="bio" defaultValue={profile?.bio} required /></label>
        <label className="grid gap-1.5 text-sm">Phone<input className={fieldClass} name="phone" defaultValue={profile?.phone} /></label>
        <label className="grid gap-1.5 text-sm">LinkedIn URL<input className={fieldClass} name="linkedInUrl" type="url" defaultValue={profile?.linkedInUrl} /></label>
        <label className="grid gap-1.5 text-sm">Portfolio URL<input className={fieldClass} name="portfolioUrl" type="url" defaultValue={profile?.portfolioUrl} /></label>
        <label className="grid gap-1.5 text-sm">AI match explanation<select className={fieldClass} name="aiConsentStatus" defaultValue={profile?.aiConsentStatus || "NOT_GRANTED"}><option value="GRANTED">Allow</option><option value="NOT_GRANTED">Use manual screening</option><option value="WITHDRAWN">Withdraw consent</option></select></label>
        <Button className="w-fit md:col-span-2" disabled={save.isPending} type="submit">{save.isPending ? "Saving…" : "Save profile"}</Button>
      </form>
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">CV documents</h2><p className="text-sm text-muted-foreground">Private PDF files, up to 10 MB.</p></div><label><input ref={fileRef} className="sr-only" type="file" accept="application/pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.mutate(file); }} /><Button asChild disabled={!profile || upload.isPending}><span><Upload className="size-4" />{upload.isPending ? "Uploading…" : "Upload CV"}</span></Button></label></div>
        <div className="mt-4 grid gap-2">{query.data?.documents.map((document) => <div className="flex items-center justify-between rounded-xl border p-3" key={document.ItemId}><div className="flex items-center gap-3"><FileText className="size-5 text-primary" /><div><p className="text-sm font-medium">{document.fileName}</p><p className="text-xs text-muted-foreground">Version {document.fileVersion}{document.isDefault ? " · Default CV" : ""}</p></div></div><Button size="sm" variant="outline" onClick={() => void download(document)}><Download className="size-4" />Download</Button></div>)}</div>
      </section>
    </div>
  );
}

type FollowUp = Row & { applicationId?: string; opportunityId?: string; interviewedAt?: string; nextThresholdDay?: number; status?: string };
export function FollowUpPage() {
  const { session } = useAuth(); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["follow-ups"], queryFn: async () => { const response = await getBlocksClient().data.collection<FollowUp>("FollowUpFlag", { fields: ["applicationId", "opportunityId", "interviewedAt", "nextThresholdDay", "status", "revision"] }).list({ pageNo: 1, pageSize: 100 }); return items<FollowUp>(response, "getFollowUpFlags"); } });
  const resolve = useMutation({ mutationFn: async (flag: FollowUp) => { if (!session) throw new Error("Your session is unavailable."); const now = new Date().toISOString(); await getBlocksClient().data.collection("FollowUpActivity").create({ followUpFlagId: flag.ItemId, activityType: "OUTCOME_CONFIRMED", actorUserId: session.user.id, occurredAt: now, note: "Resolved from the staff follow-up queue.", idempotencyKey: `${flag.ItemId}:${crypto.randomUUID()}` }); return getBlocksClient().data.collection("FollowUpFlag").update(flag.ItemId, { status: "RESOLVED", revision: (flag.revision ?? 0) + 1 }); }, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["follow-ups"] }); await queryClient.invalidateQueries({ queryKey: ["dashboard-counts"] }); toast.success("Follow-up resolved"); }, onError: (error) => toast.error(errorMessage(error)) });
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-primary">Career operations</p><h1 className="mt-1 text-3xl font-semibold">Follow-up queue</h1><p className="mt-2 text-sm text-muted-foreground">Track employers whose candidate outcomes are overdue.</p></div><div className="grid gap-3">{query.data?.filter((flag) => flag.status === "OPEN").map((flag) => <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5" key={flag.ItemId}><div><p className="font-semibold">Application {flag.applicationId?.slice(0, 8)}</p><p className="text-sm text-muted-foreground">Interviewed {flag.interviewedAt ? new Date(flag.interviewedAt).toLocaleDateString() : "date unavailable"} · threshold {flag.nextThresholdDay} days</p></div><Button disabled={resolve.isPending} onClick={() => resolve.mutate(flag)}>Mark resolved</Button></article>)}{!query.isLoading && query.data?.every((flag) => flag.status !== "OPEN") && <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">No overdue outcomes.</div>}</div></div>;
}

export function AnalyticsPage() {
  const query = useQuery({ queryKey: ["live-analytics"], queryFn: async () => { const [opportunities, applications] = await Promise.all([listOpportunities(), listApplications()]); return { opportunities, applications }; } });
  const stages = ["SUBMITTED", "SHORTLISTED", "INTERVIEW", "INTERVIEWED", "OFFERED", "HIRED", "REJECTED", "NOT_SELECTED"];
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-primary">Reporting</p><h1 className="mt-1 text-3xl font-semibold">Analytics and reporting</h1><p className="mt-2 text-sm text-muted-foreground">Live counts reflect the records your role is allowed to read.</p></div><div className="grid gap-4 md:grid-cols-3"><Metric icon={BarChart3} label="Published opportunities" value={query.data?.opportunities.filter((item) => item.status === "PUBLISHED").length} /><Metric icon={Users} label="Applications" value={query.data?.applications.length} /><Metric icon={ShieldCheck} label="Hires" value={query.data?.applications.filter((item) => item.status === "HIRED").length} /></div><section className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">Application funnel</h2><div className="mt-4 grid gap-3 md:grid-cols-4">{stages.map((stage) => <div className="rounded-xl bg-muted p-4" key={stage}><p className="text-xs text-muted-foreground">{stage.replaceAll("_", " ")}</p><p className="mt-1 text-2xl font-semibold">{query.data?.applications.filter((item) => item.status === stage).length ?? "—"}</p></div>)}</div></section></div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value?: number }) { return <section className="rounded-2xl border bg-card p-5"><Icon className="size-5 text-primary" /><p className="mt-4 text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-semibold">{value ?? "—"}</p></section>; }

type IamUser = Record<string, unknown> & { itemId?: string; firstName?: string; lastName?: string; email?: string; roles?: string[]; isActive?: boolean };
export function AdministrationPage() {
  const query = useQuery({ queryKey: ["admin-users"], queryFn: async () => { const response = await getBlocksClient().iam.users.list({ pageNo: 1, pageSize: 100 }); const value = response as { data?: { items?: IamUser[]; users?: IamUser[] }; items?: IamUser[] }; return value.data?.items ?? value.data?.users ?? value.items ?? []; } });
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-primary">University administration</p><h1 className="mt-1 text-3xl font-semibold">Users and access</h1><p className="mt-2 text-sm text-muted-foreground">A read-only tenant inventory. Access changes remain deliberate, separately confirmed administrative actions.</p></div>{query.isError && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">Users could not be loaded with the current admin authority.</div>}<div className="overflow-hidden rounded-2xl border bg-card"><div className="grid grid-cols-[1.2fr_1.5fr_1fr] gap-3 border-b bg-muted/50 px-5 py-3 text-xs font-semibold uppercase text-muted-foreground"><span>User</span><span>Email</span><span>Roles</span></div>{query.data?.map((user) => <div className="grid grid-cols-[1.2fr_1.5fr_1fr] gap-3 border-b px-5 py-4 text-sm last:border-0" key={user.itemId || user.email}><span>{[user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user"}</span><span className="truncate text-muted-foreground">{user.email}</span><span>{user.roles?.join(", ") || "No role"}</span></div>)}</div></div>;
}
