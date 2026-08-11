function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

export const env = {
  get authSecret() {
    return required("AUTH_SECRET");
  },
  get appBaseUrl() {
    return process.env.APP_BASE_URL ?? "http://localhost:3000";
  },
  get aiProvider() {
    return (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  },
  get anthropicApiKey() {
    return process.env.ANTHROPIC_API_KEY ?? "";
  },
  get anthropicModel() {
    return process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
  },
  get snapshotDir() {
    return process.env.SNAPSHOT_DIR ?? "./data/snapshots";
  },
  get snapshotMaxPerSession() {
    return Number(process.env.SNAPSHOT_MAX_PER_SESSION ?? "60");
  },
};
