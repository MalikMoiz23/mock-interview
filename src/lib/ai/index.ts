import { env } from "../env";
import { MockProvider } from "./mock";
import { OllamaProvider } from "./ollama";
import type { AIProvider } from "./types";

let cached: AIProvider | null = null;

/**
 * Resolves the configured provider.
 *
 *   ollama — free, local, real judgement. The default and the only one that
 *            should decide anything about a candidate.
 *   mock   — free, offline, keyword coverage only. Cannot judge correctness,
 *            and exists so the flow can be exercised without a model running.
 *
 * Both run entirely on this machine. There is deliberately no hosted provider:
 * nothing here bills per interview, and no candidate's answers leave the
 * network. Adding one back means implementing `AIProvider` and accepting both
 * of those consequences.
 */
export function getProvider(): AIProvider {
  if (cached) return cached;

  switch (env.aiProvider) {
    case "ollama":
      // Constructing this never touches the network, so a stopped daemon is
      // reported per-request rather than silently downgrading the whole
      // deployment to keyword matching without anyone noticing.
      cached = new OllamaProvider();
      break;
    case "mock":
    default:
      cached = new MockProvider();
  }
  return cached;
}

/** Health of the configured provider, for the admin banner. */
export async function providerHealth(): Promise<{ ok: boolean; detail: string }> {
  const provider = getProvider();
  if (provider instanceof OllamaProvider) return provider.health();
  return {
    ok: false,
    detail:
      "Offline scorer: measures rubric keyword coverage, not correctness. Multiple choice is still graded exactly.",
  };
}

export * from "./types";
