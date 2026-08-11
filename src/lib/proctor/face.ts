"use client";

import type { FaceLandmarker } from "@mediapipe/tasks-vision";

/**
 * Face monitoring for the interview page.
 *
 * The model runs entirely in the candidate's browser. Frames leave the device
 * only when a violation triggers a snapshot; the continuous video stream is
 * never uploaded.
 *
 * What this can see: nobody in frame, a second person in frame, and the head
 * turned away from the screen. What it cannot see: a phone below the desk, a
 * second monitor the candidate barely glances at, or a person reading answers
 * from behind the camera. Treat it as one signal among several.
 */

export type FaceState = {
  faces: number;
  /** Positive = looking right of centre, negative = left. Roughly -1..1. */
  yaw: number;
  /** Positive = looking down, negative = up. Roughly -1..1. */
  pitch: number;
  /** Lip separation as a fraction of face height. ~0 closed, >0.12 speaking. */
  mouthOpen: number;
};

// Landmark indices in the MediaPipe 478-point face mesh.
const NOSE_TIP = 1;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_OUTER = 263;
const FOREHEAD = 10;
const CHIN = 152;
const UPPER_LIP_INNER = 13;
const LOWER_LIP_INNER = 14;

export const GAZE_YAW_LIMIT = 0.24;
export const GAZE_PITCH_LIMIT = 0.22;

let landmarker: FaceLandmarker | null = null;

/** Loads the model. Resolves to false when unavailable — never throws. */
export async function initFaceLandmarker(): Promise<boolean> {
  if (landmarker) return true;
  try {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks("/mediapipe/wasm");
    landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: "/models/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 2,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
    return true;
  } catch (err) {
    console.error("[proctor] Face model unavailable:", err);
    landmarker = null;
    return false;
  }
}

export function isFaceModelReady(): boolean {
  return landmarker !== null;
}

/**
 * Head orientation from landmark geometry rather than the transformation
 * matrix — the ratios below are stable across face shapes and do not depend on
 * MediaPipe's matrix row/column convention.
 */
export function detect(video: HTMLVideoElement, timestampMs: number): FaceState | null {
  if (!landmarker || video.readyState < 2) return null;

  let result;
  try {
    result = landmarker.detectForVideo(video, timestampMs);
  } catch {
    return null;
  }

  const faces = result.faceLandmarks?.length ?? 0;
  if (faces === 0) return { faces: 0, yaw: 0, pitch: 0, mouthOpen: 0 };

  const lm = result.faceLandmarks[0];
  const nose = lm[NOSE_TIP];
  const eyeL = lm[LEFT_EYE_OUTER];
  const eyeR = lm[RIGHT_EYE_OUTER];
  const brow = lm[FOREHEAD];
  const chin = lm[CHIN];
  if (!nose || !eyeL || !eyeR || !brow || !chin) {
    return { faces, yaw: 0, pitch: 0, mouthOpen: 0 };
  }

  const eyeMidX = (eyeL.x + eyeR.x) / 2;
  const eyeSpan = Math.abs(eyeR.x - eyeL.x) || 1e-6;
  // Nose drifting away from the midpoint between the eyes = head turned.
  const yaw = (nose.x - eyeMidX) / eyeSpan;

  const faceHeight = Math.abs(chin.y - brow.y) || 1e-6;
  const noseRest = brow.y + faceHeight * 0.52; // nose tip sits ~52% down a level face
  const pitch = (nose.y - noseRest) / faceHeight;

  // Lip separation, normalised by face height so it survives the candidate
  // moving nearer to or further from the camera.
  const upper = lm[UPPER_LIP_INNER];
  const lower = lm[LOWER_LIP_INNER];
  const mouthOpen =
    upper && lower ? Math.abs(lower.y - upper.y) / faceHeight : 0;

  return { faces, yaw, pitch, mouthOpen };
}

export function isLookingAway(state: FaceState): boolean {
  return Math.abs(state.yaw) > GAZE_YAW_LIMIT || Math.abs(state.pitch) > GAZE_PITCH_LIMIT;
}

/** Grabs a downscaled JPEG of the current frame for evidence. */
export function captureFrame(video: HTMLVideoElement, width = 480): string | null {
  if (video.videoWidth === 0) return null;
  const scale = width / video.videoWidth;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.6);
}

export function disposeFaceLandmarker(): void {
  try {
    landmarker?.close();
  } catch {
    /* ignore */
  }
  landmarker = null;
}
