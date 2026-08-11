import { env } from "../env";
import { MockProvider } from "./mock";
import { AnthropicProvider } from "./anthropic";
import type { AIProvider } from "./types";

let cached: AIProvider | null = null;

/**
 * Resolves the configured provider. Falls back to the offline mock if the
 * configured provider cannot be constructed (e.g. missing API key), so a
 * misconfigured deployment degrades instead of failing every interview.
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
    case "mock":
    default:
      cached = new MockProvider();
  }
  return cached;
}

export * from "./types";
