import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/community")({
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            Support
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Community</h1>
          <p className="mt-5 text-base text-foreground/75 leading-relaxed">
            Connect with other members and coaches to share milestones, training tips, and recovery
            routines. Community spaces are moderated to keep feedback constructive and helpful.
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
