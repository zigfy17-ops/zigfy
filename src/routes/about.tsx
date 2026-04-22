import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            Company
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">About Zigfy</h1>
          <p className="mt-5 text-base text-foreground/75 leading-relaxed">
            Zigfy helps people train with confidence by connecting members and certified coaches in
            one focused platform. We combine smart scheduling, workout tracking, and actionable
            coaching feedback so progress is visible every week.
          </p>
          <p className="mt-4 text-base text-foreground/75 leading-relaxed">
            Our mission is simple: make expert personal coaching more accessible, measurable, and
            consistent for everyone.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center text-sm font-semibold hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
