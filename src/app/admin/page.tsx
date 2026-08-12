import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { blueprintTotal, type Blueprint } from "@/lib/blueprint";
import {
  Pill,
  RecommendationPill,
  StatusPill,
  integrityColor,
  scoreColor,
} from "@/components/ui";
import { LinkActions } from "./link-actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const links = await db.interviewLink.findMany({
    where: { orgId: user.orgId },
    orderBy: { createdAt: "desc" },
    include: {
      domain: { select: { name: true } },
      sessions: {
        orderBy: { createdAt: "desc" },
        include: {
          score: {
            select: { overall: true, integrityScore: true, recommendation: true },
          },
        },
      },
    },
  });

  const completed = links.flatMap((l) =>
    l.sessions.filter((s) => s.status === "SCORED"),
  );
  const needsReview = completed.filter(
    (s) => (s.score?.integrityScore ?? 100) < 50,
  ).length;

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Interviews</h1>
          <p className="mt-1 text-sm text-ink-400">
            {links.length} link{links.length === 1 ? "" : "s"} · {completed.length} scored ·{" "}
            {needsReview} flagged for integrity review
          </p>
        </div>
        <Link href="/admin/links/new" className="btn btn-primary">
          Generate link
        </Link>
      </div>

      {links.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-sm text-ink-400">
            No interview links yet. Generate one to invite your first candidate.
          </p>
        </div>
      ) : (
        <div className="card mt-6 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-850 text-left text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Candidate</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Link</th>
                <th className="px-4 py-3 font-semibold">Result</th>
                <th className="px-4 py-3 font-semibold">Integrity</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => {
                const latest = link.sessions[0];
                const score = latest?.score;
                return (
                  <tr key={link.id} className="border-t border-ink-700 align-middle">
                    <td className="px-4 py-3">
                      <div className="font-medium">{link.candidateName}</div>
                      <div className="text-xs text-ink-400">{link.candidateEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{link.domain.name}</div>
                      <div className="text-xs text-ink-400">
                        {link.difficulty.toLowerCase()} ·{" "}
                        {blueprintTotal(link.blueprint as unknown as Blueprint)}{" "}
                        questions · {Math.round(link.durationSec / 60)} min
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill value={link.status} />
                      <div className="mt-1 text-xs text-ink-400 mono">
                        {link.tokenPreview}…
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {!latest ? (
                        <span className="text-xs text-ink-400">Not started</span>
                      ) : score ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="text-base font-semibold"
                            style={{ color: scoreColor(score.overall) }}
                          >
                            {score.overall}
                          </span>
                          <RecommendationPill value={score.recommendation} />
                        </div>
                      ) : (
                        <>
                          <StatusPill value={latest.status} />
                          {latest.status === "SUBMITTED" && (
                            <div className="mt-1 text-xs text-ink-400">
                              grading — open to follow
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {score ? (
                        <Pill color={integrityColor(score.integrityScore)}>
                          {score.integrityScore}/100
                        </Pill>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {latest && (
                        <Link
                          href={`/admin/sessions/${latest.id}`}
                          className="text-xs font-semibold text-accent hover:underline"
                        >
                          Review →
                        </Link>
                      )}
                      <div className="mt-2">
                        <LinkActions
                          linkId={link.id}
                          candidateName={link.candidateName}
                          status={link.status}
                          sessionCount={link.sessions.length}
                          hasResults={link.sessions.length > 0}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-ink-400">
        <strong className="text-ink-300">On integrity scores:</strong> these measure
        browser-observable anomalies only. A candidate reading questions off a second
        device produces no signal here. Treat a low score as a reason to probe in the
        onsite, and a high score as absence of evidence — not evidence of absence.
      </p>
    </>
  );
}
