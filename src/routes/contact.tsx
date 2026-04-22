import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            Contact
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Get In Touch</h1>
          <p className="mt-5 text-base text-foreground/75 leading-relaxed">
            Need help with your account, bookings, or coaching setup? Reach our team at
            <span className="font-semibold"> support@zigfy.com</span> and we will respond as soon as
            possible.
          </p>
          <div className="mt-6 rounded-md border border-foreground/20 p-5 text-sm text-foreground/75">
            Business inquiries: partnerships@zigfy.com
            <br />
            General support hours: Monday to Friday, 9:00 - 18:00
          </div>
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
