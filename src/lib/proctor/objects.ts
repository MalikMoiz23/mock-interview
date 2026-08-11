"use client";

import type { ObjectDetector } from "@mediapipe/tasks-vision";

/**
 * Object detection for the interview page.
 *
 * Runs the EfficientDet-Lite COCO model in the browser, looking for two things
 * a candidate should not have in frame: a phone or tablet, and a second person.
 *
 * The second-person check is deliberately separate from face counting — it
 * fires when someone is in shot with their face turned away, cropped, or too
 * small for the face mesh to lock on, which is exactly how a helper sits.
 *
 * Limits worth stating plainly: it sees only what the webcam sees. A phone in a
 * lap, below the desk, or propped behind the monitor is invisible to it, and a
 * candidate can defeat it entirely by moving the phone out of frame. It also
 * confuses dark rectangles with phones from time to time, which is why a hit
 * captures an image for a human to check rather than ending the interview.
 */

/** COCO labels that matter. Everything else in the model is ignored. */
const PHONE_LABELS = new Set(["cell phone", "remote"]);
const PERSON_LABEL = "person";

/** Below this the model is guessing; tuned to keep false positives tolerable. */
const PHONE_CONFIDENCE = 0.45;
const PERSON_CONFIDENCE = 0.55;

export type ObjectState = {
  phone: { present: boolean; confidence: number };
  people: number;
};

let detector: ObjectDetector | null = null;

/** Loads the model. Resolves to false when unavailable — never throws. */
export async function initObjectDetector(): Promise<boolean> {
  if (detector) return true;
  try {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks("/mediapipe/wasm");
    detector = await vision.ObjectDetector.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: "/models/efficientdet_lite0.tflite",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      scoreThreshold: 0.4,
      maxResults: 8,
    });
    return true;
  } catch (err) {
    console.error("[proctor] Object detector unavailable:", err);
    detector = null;
    return false;
  }
}

export function isObjectModelReady(): boolean {
  return detector !== null;
}

export function detectObjects(
  video: HTMLVideoElement,
  timestampMs: number,
): ObjectState | null {
  if (!detector || video.readyState < 2) return null;

  let result;
  try {
    result = detector.detectForVideo(video, timestampMs);
  } catch {
    return null;
  }

  let phoneConfidence = 0;
  let people = 0;

  for (const d of result.detections ?? []) {
    const top = d.categories?.[0];
    if (!top?.categoryName) continue;
    const name = top.categoryName.toLowerCase();

    if (PHONE_LABELS.has(name) && top.score >= PHONE_CONFIDENCE) {
      phoneConfidence = Math.max(phoneConfidence, top.score);
    }
    if (name === PERSON_LABEL && top.score >= PERSON_CONFIDENCE) {
      people += 1;
    }
  }

  return {
    phone: { present: phoneConfidence > 0, confidence: phoneConfidence },
    people,
  };
}

export function disposeObjectDetector(): void {
  try {
    detector?.close();
  } catch {
    /* ignore */
  }
  detector = null;
}
