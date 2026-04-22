import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            Legal
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-5 text-base text-foreground/75 leading-relaxed">
            By using Zigfy, members and coaches agree to platform rules for respectful conduct,
            secure account access, and accurate training information. Booking, cancellation, and
            payment behavior should follow the policy shown during checkout.
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
