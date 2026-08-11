import { env } from "../env";
import { MockProvider } from "./mock";
import { AnthropicProvider } from "./anthropic";
import { OllamaProvider } from "./ollama";
import type { AIProvider } from "./types";

let cached: AIProvider | null = null;

/**
 * Resolves the configured provider. Falls back to the offline mock if the
 * configured provider cannot be constructed (e.g. missing API key), so a
 * misconfigured deployment degrades instead of failing every interview.
 *
 *   mock      — free, offline, keyword coverage only. Cannot judge correctness.
 *   ollama    — free, local, real judgement. Slower and weaker than a frontier model.
 *   anthropic — paid, best quality.
 */
export function getProvider(): AIProvider {
  if (cached) return cached;

  switch (env.aiProvider) {
    case "anthropic":
      try {
        cached = new AnthropicProvider();
      } catch (err) {
        console.error("[ai] Falling back to mock provider:", (err as Error).message);
        cached = new MockProvider();
      }
      break;
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
  if (provider.name === "mock") {
    return {
      ok: false,
      detail:
        "Offline scorer: measures rubric keyword coverage, not correctness. Multiple choice is still graded exactly.",
    };
  }
  return { ok: true, detail: `${provider.name} / ${provider.model}` };
}

export * from "./types";
