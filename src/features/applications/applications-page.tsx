import { useQuery } from "@tanstack/react-query";
import { FileUser } from "lucide-react";
import { useAuth } from "@/features/auth/use-auth";
import { getBlocksClient } from "@/lib/blocks/client";

type Application = {
  ItemId: string;
  opportunityId?: string;
  status?: string;
  submittedAt?: string;
  aiProcessingStatus?: string;
};

function applicationItems(response: unknown): Application[] {
  const data = (response as { data?: Record<string, unknown> })?.data;
  return (
    (data?.getApplications as { items?: Application[] } | undefined)?.items ??
    []
  );
}

export function ApplicationsPage({
  employerView = false,
}: {
  employerView?: boolean;
}) {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["applications", session?.user.id, employerView],
    queryFn: async () => {
      const response = await getBlocksClient()
        .data.collection<Application>("Application", {
          fields: [
            "opportunityId",
            "status",
            "submittedAt",
            "aiProcessingStatus",
          ],
        })
        .list({ pageNo: 1, pageSize: 50, sort: { submittedAt: -1 } });
      return applicationItems(response);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">CampusCareer</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {employerView ? "Candidates and outcomes" : "Applications"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The server returns only applications allowed for your role and
          organization.
        </p>
      </div>
      {query.isLoading && (
        <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">
          Loading applications…
        </div>
      )}
      {query.isError && (
        <div
          className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive"
          role="alert"
        >
          Applications could not be loaded for this role.
        </div>
      )}
      {!query.isLoading && !query.isError && query.data?.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          No applications are available in this view.
        </div>
      )}
      <div className="grid gap-3">
        {query.data?.map((application) => (
          <article
            className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            key={application.ItemId}
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileUser className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">
                  Application {application.ItemId.slice(0, 8)}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted{" "}
                  {application.submittedAt
                    ? new Date(application.submittedAt).toLocaleString()
                    : "date unavailable"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
                {application.status?.replaceAll("_", " ")}
              </span>
              <span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">
                AI {application.aiProcessingStatus?.toLowerCase()}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
