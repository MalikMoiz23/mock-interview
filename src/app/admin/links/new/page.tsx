import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NewLinkForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NewLinkPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const domains = await db.domain.findMany({
    where: { OR: [{ orgId: null }, { orgId: user.orgId }] },
    orderBy: { name: "asc" },
    select: { id: true, name: true, blurb: true },
  });

  return (
    <>
      <h1 className="text-xl font-semibold">Generate interview link</h1>
      <p className="mt-1 text-sm text-ink-400">
        The link is single-use by default and shown to you exactly once. Only its hash
        is stored, so it cannot be recovered later.
      </p>
      <NewLinkForm domains={domains} />
    </>
  );
}
