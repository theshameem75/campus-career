import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, CalendarDays, MapPin } from "lucide-react";
import { useAuth } from "@/features/auth/use-auth";
import { getBlocksClient } from "@/lib/blocks/client";

type Opportunity = {
  ItemId: string;
  title?: string;
  status?: string;
  description?: string;
  workMode?: string;
  city?: string;
  countryCode?: string;
  durationWeeks?: number;
  stipendMinor?: number;
  currency?: string;
  slotCount?: number;
  deadlineAt?: string;
};

function itemsFrom(response: unknown): Opportunity[] {
  const data = (response as { data?: Record<string, unknown> })?.data;
  const page = data?.getOpportunitys as { items?: Opportunity[] } | undefined;
  return page?.items ?? [];
}

function money(minor?: number, currency?: string): string {
  if (minor === undefined) return "Stipend not specified";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency || "BDT",
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

export function OpportunitiesPage({
  mode = "browse",
}: {
  mode?: "browse" | "employer" | "approval";
}) {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["opportunities", session?.user.id, mode],
    queryFn: async () => {
      const response = await getBlocksClient()
        .data.collection<Opportunity>("Opportunity", {
          fields: [
            "title",
            "status",
            "description",
            "workMode",
            "city",
            "countryCode",
            "durationWeeks",
            "stipendMinor",
            "currency",
            "slotCount",
            "deadlineAt",
          ],
        })
        .list({ pageNo: 1, pageSize: 50, sort: { deadlineAt: 1 } });
      return itemsFrom(response);
    },
  });

  const opportunities = (query.data ?? []).filter((item) =>
    mode === "approval" ? item.status === "PENDING_APPROVAL" : true,
  );
  const title =
    mode === "approval"
      ? "Opportunity approvals"
      : mode === "employer"
        ? "Employer job posts"
        : "Opportunities";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">CampusCareer</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Live, role-scoped records from Blocks Data.
        </p>
      </div>
      {query.isLoading && (
        <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">
          Loading opportunities…
        </div>
      )}
      {query.isError && (
        <div
          className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive"
          role="alert"
        >
          The opportunity feed could not be loaded for this role.
        </div>
      )}
      {!query.isLoading && !query.isError && opportunities.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          No opportunities are available in this view.
        </div>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        {opportunities.map((opportunity) => (
          <article
            className="rounded-2xl border bg-card p-6 shadow-sm"
            key={opportunity.ItemId}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {opportunity.status?.replaceAll("_", " ")}
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {opportunity.title}
                </h2>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <BriefcaseBusiness className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {opportunity.description}
            </p>
            <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                {opportunity.workMode} · {opportunity.city},{" "}
                {opportunity.countryCode}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                Apply by{" "}
                {opportunity.deadlineAt
                  ? new Date(opportunity.deadlineAt).toLocaleDateString()
                  : "TBD"}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1.5">
                {money(opportunity.stipendMinor, opportunity.currency)}
              </span>
              <span className="rounded-full bg-muted px-3 py-1.5">
                {opportunity.durationWeeks} weeks
              </span>
              <span className="rounded-full bg-muted px-3 py-1.5">
                {opportunity.slotCount} slots
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
