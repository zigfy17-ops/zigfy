import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/help-center")({
  component: HelpCenterPage,
});

function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            Support
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Help Center</h1>
          <ul className="mt-6 space-y-3 text-base text-foreground/75">
            <li>How to book a trainer session</li>
            <li>How to log workouts and track progress</li>
            <li>How to manage reminders and notifications</li>
            <li>How coaches review and share feedback</li>
          </ul>
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
