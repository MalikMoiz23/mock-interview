import { providerHealth, getProvider } from "@/lib/ai";

/**
 * States plainly what is grading the answers.
 *
 * A recruiter looking at a 78/100 has no way to tell whether that came from a
 * language model reading the answer or from counting keywords, and the two
 * deserve very different amounts of trust. Guessing wrong is how someone gets
 * rejected by a word-matcher, so the difference is shown on every admin page
 * rather than buried in a config file.
 */
export async function ProviderBanner() {
  const provider = getProvider();
  const health = await providerHealth();

  const isMock = provider.name === "mock";
  const colour = isMock || !health.ok ? "var(--color-warn)" : "var(--color-good)";

  return (
    <div
      className="mb-6 rounded-lg border p-3 text-xs leading-relaxed"
      style={{
        borderColor: `color-mix(in srgb, ${colour} 40%, transparent)`,
        background: `color-mix(in srgb, ${colour} 8%, transparent)`,
      }}
    >
      <span className="font-semibold" style={{ color: colour }}>
        {isMock
          ? "Scoring: offline keyword matching"
          : health.ok
            ? `Scoring: ${provider.model} running locally`
            : `Scoring unavailable: ${provider.name}`}
      </span>
      <span className="text-ink-300"> — {health.detail}</span>
      {isMock && (
        <span className="text-ink-400">
          {" "}
          For free scoring that actually reads the answers, set{" "}
          <code className="mono">AI_PROVIDER=ollama</code>.
        </span>
      )}
    </div>
  );
}
