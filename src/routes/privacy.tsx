import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            Legal
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-5 text-base text-foreground/75 leading-relaxed">
            We collect only the information needed to provide coaching, scheduling, and progress
            tracking services. Your personal data is never sold, and account information is
            processed with security and access controls in place.
          </p>
          <p className="mt-4 text-base text-foreground/75 leading-relaxed">
            You can request data access or deletion by contacting support@zigfy.com.
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
