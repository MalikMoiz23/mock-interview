export function scoreColor(score: number): string {
  if (score >= 75) return "var(--color-good)";
  if (score >= 50) return "var(--color-warn)";
  return "var(--color-bad)";
}

export function integrityColor(score: number): string {
  if (score >= 80) return "var(--color-good)";
  if (score >= 50) return "var(--color-warn)";
  return "var(--color-bad)";
}

export function Meter({ value, color }: { value: number; color: string }) {
  return (
    <div className="meter">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

export function Pill({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <span
      className="pill"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

const RECOMMENDATION_LABEL: Record<string, { text: string; color: string }> = {
  STRONG_YES: { text: "Strong yes", color: "var(--color-good)" },
  YES: { text: "Yes", color: "var(--color-good)" },
  BORDERLINE: { text: "Borderline", color: "var(--color-warn)" },
  NO: { text: "No", color: "var(--color-bad)" },
  INTEGRITY_REVIEW: { text: "Integrity review", color: "var(--color-bad)" },
};

export function RecommendationPill({ value }: { value: string }) {
  const meta = RECOMMENDATION_LABEL[value] ?? { text: value, color: "var(--color-ink-400)" };
  return <Pill color={meta.color}>{meta.text}</Pill>;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "var(--color-ink-400)",
  IN_PROGRESS: "var(--color-accent)",
  SUBMITTED: "var(--color-warn)",
  SCORED: "var(--color-good)",
  ABANDONED: "var(--color-bad)",
  TERMINATED: "var(--color-bad)",
  ACTIVE: "var(--color-good)",
  REVOKED: "var(--color-bad)",
  EXPIRED: "var(--color-ink-400)",
  CONSUMED: "var(--color-ink-400)",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <Pill color={STATUS_COLOR[value] ?? "var(--color-ink-400)"}>
      {value.replace("_", " ").toLowerCase()}
    </Pill>
  );
}

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
