import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";
import { ProviderBanner } from "./provider-banner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // The login page renders inside this layout; it has no chrome of its own.
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-700 bg-ink-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold">
              AI Interview Platform
            </Link>
            <nav className="flex items-center gap-4 text-sm text-ink-400">
              <Link href="/admin" className="hover:text-ink-100">
                Interviews
              </Link>
              <Link href="/admin/links/new" className="hover:text-ink-100">
                New link
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-ink-400">
            <span>{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <ProviderBanner />
        {children}
      </main>
    </div>
  );
}
