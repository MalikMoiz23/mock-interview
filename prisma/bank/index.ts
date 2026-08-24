import type { BankDomain } from "../question-bank";
import { APP_DEV_DEPTH } from "./app-development";
import { BACKEND_NODE_DEPTH } from "./backend-node";
import { BACKEND_PYTHON_DEPTH } from "./backend-python";
import { DATA_ENGINEERING_DEPTH } from "./data-engineering";
import { DEVOPS_DEPTH } from "./devops-cloud";
import { FRONTEND_DEPTH } from "./frontend-react";
import { FULLSTACK_DEPTH } from "./fullstack-development";
import { GRAPHIC_DESIGN_DEPTH } from "./graphic-design";
import { MCQ_DEPTH_DESIGN } from "./mcq-depth-design";
import { MCQ_DEPTH_INFRA } from "./mcq-depth-infra";
import { MCQ_DEPTH_ENGINEERING } from "./mcq-depth-engineering";
import { QA_DEPTH } from "./qa-automation";
import { TOPUP_DOMAINS } from "./topup";
import { UIUX_DEPTH } from "./uiux-design";

/**
 * Depth tranche.
 *
 * Target per domain: 30 questions each at beginner, junior and mid — the levels
 * software houses actually hire at — and 15 each at senior and staff, which
 * previously held two or fewer and so fell through to the synthetic fallback
 * generator whenever a link was created at those levels.
 *
 * One file per domain: the earlier tranches grouped several domains per file
 * and became unwieldy to review, which is the opposite of what a bank a
 * recruiter is expected to spot-check should be.
 */
export const DEPTH_V2_DOMAINS: BankDomain[] = [
  FULLSTACK_DEPTH,
  FRONTEND_DEPTH,
  BACKEND_NODE_DEPTH,
  BACKEND_PYTHON_DEPTH,
  DATA_ENGINEERING_DEPTH,
  DEVOPS_DEPTH,
  QA_DEPTH,
  APP_DEV_DEPTH,
  UIUX_DEPTH,
  GRAPHIC_DESIGN_DEPTH,
  ...TOPUP_DOMAINS,
  ...MCQ_DEPTH_ENGINEERING,
  ...MCQ_DEPTH_DESIGN,
  ...MCQ_DEPTH_INFRA,
];
