import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Layers3,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";

const foundations = [
  "React, TypeScript, and Vite",
  "Tailwind and shadcn/ui conventions",
  "Router and query providers",
  "Blocks-ready environment configuration",
];

export function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-semibold tracking-tight">CampusCareer</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-status-success" />
            Frontend foundation ready
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            A clean starting point for the campus-to-career journey.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            The application shell uses the CampusCareer Blocks project context
            and is ready for the product requirements.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">
              Project foundation <ArrowRight className="size-4" />
            </span>
            <span className="rounded-lg border border-border bg-card px-4 py-2 font-medium">
              Requirements pending
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Workspace</p>
              <h2 className="mt-1 text-xl font-semibold">Implementation-ready</h2>
            </div>
            <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <Layers3 className="size-5" />
            </span>
          </div>
          <ul className="space-y-3">
            {foundations.map((foundation) => (
              <li
                key={foundation}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-4 py-3 text-sm"
              >
                <CheckCircle2 className="size-4 shrink-0 text-status-success" />
                {foundation}
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary p-4">
              <GraduationCap className="mb-3 size-5 text-primary" />
              <p className="text-sm font-semibold">Campus</p>
              <p className="mt-1 text-xs text-muted-foreground">Learning context</p>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <BriefcaseBusiness className="mb-3 size-5 text-primary" />
              <p className="text-sm font-semibold">Career</p>
              <p className="mt-1 text-xs text-muted-foreground">Opportunity context</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
