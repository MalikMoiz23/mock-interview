/**
 * Copies the MediaPipe WASM runtime into /public and downloads the face
 * landmark model. Both are served from our own origin so the interview page
 * never depends on a third-party CDN at exam time.
 *
 * Run: npm run setup:models
 */
import { createRequire } from "node:module";
import { promises as fs } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = process.cwd();

const MODELS = [
  {
    name: "face_landmarker.task",
    url: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    purpose: "face presence, second face, head pose, mouth movement",
    minBytes: 1_000_000,
  },
  {
    name: "efficientdet_lite0.tflite",
    url: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float32/1/efficientdet_lite0.tflite",
    purpose: "phones, tablets, laptops and second people in frame",
    minBytes: 1_000_000,
  },
];

/** The package blocks ./package.json in its exports map, so resolve the entry. */
function resolvePackageDir() {
  try {
    // vision_bundle.mjs sits at the package root.
    return path.dirname(require.resolve("@mediapipe/tasks-vision"));
  } catch {
    return path.join(root, "node_modules", "@mediapipe", "tasks-vision");
  }
}

async function copyWasm() {
  const src = path.join(resolvePackageDir(), "wasm");
  const dest = path.join(root, "public", "mediapipe", "wasm");
  await fs.mkdir(dest, { recursive: true });
  const files = await fs.readdir(src);
  for (const f of files) {
    await fs.copyFile(path.join(src, f), path.join(dest, f));
  }
  console.log(`✓ Copied ${files.length} MediaPipe WASM files to public/mediapipe/wasm`);
}

async function downloadModels() {
  const dest = path.join(root, "public", "models");
  await fs.mkdir(dest, { recursive: true });

  for (const model of MODELS) {
    const target = path.join(dest, model.name);
    try {
      const stat = await fs.stat(target);
      if (stat.size > model.minBytes) {
        console.log(`✓ ${model.name} already present (${(stat.size / 1e6).toFixed(1)} MB)`);
        continue;
      }
    } catch {
      // not downloaded yet
    }

    console.log(`→ Downloading ${model.name} — ${model.purpose} …`);
    const res = await fetch(model.url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${model.name}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(target, buf);
    console.log(`✓ Saved ${model.name} (${(buf.byteLength / 1e6).toFixed(1)} MB)`);
  }
}

try {
  await copyWasm();
  await downloadModels();
  console.log("\nProctoring assets ready.");
} catch (err) {
  console.error(`\n✗ Setup failed: ${err.message}`);
  console.error(
    "The app still runs — interviews will start with visual monitoring disabled\n" +
      "and every affected session is flagged MODEL_UNAVAILABLE in the admin view.\n" +
      "Re-run `npm run setup:models` once network access is available.",
  );
  process.exitCode = 1;
}
