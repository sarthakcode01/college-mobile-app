/**
 * Automated Eligibility Engine
 * ----------------------------
 * Pure, deterministic business logic. No React, no side effects, so it can be
 * unit tested in isolation and trusted by both the student UI (to gate the
 * Apply button) and the TPO dashboard (to report applicant quality).
 */

import { TIER_THRESHOLDS } from '@/constants/theme';
import {
    type DriveTier,
    type EligibilityCriteria,
    type PlacementDrive,
    type StudentProfile,
} from '@/lib/types';

export type EligibilityRuleResult = {
  rule: string;
  label: string;
  passed: boolean;
  studentValue: string;
  requiredValue: string;
};

export type EligibilityResult = {
  isEligible: boolean;
  score: number;
  passedCount: number;
  totalRules: number;
  reasons: EligibilityRuleResult[];
  /** Rules that failed, surfaced as a short summary for list rows. */
  failures: string[];
  /** College policy warnings that do not hard-block (e.g. offer cap reached). */
  warnings: string[];
};

/** College-level placement policy, independent of any single drive. */
export type CollegePolicy = {
  /** Maximum offers a student may hold, per the "1 Core + 1 Dream" rule. */
  maxOffers: number;
  /** Offers below this CTC are treated as non-core. */
  coreOfferThreshold: number;
  /** Whether a student with any active backlog may hold a core offer. */
  allowBacklogCoreOffer: boolean;
};

export const DEFAULT_POLICY: CollegePolicy = {
  maxOffers: 2,
  coreOfferThreshold: 6,
  allowBacklogCoreOffer: false,
};

/**
 * Evaluates a student against a drive's criteria.
 * Every rule is reported — passing AND failing — so the UI can render a full
 * scorecard instead of a bare yes/no.
 */
export function evaluateEligibility(
  student: StudentProfile,
  criteria: EligibilityCriteria,
  policy: CollegePolicy = DEFAULT_POLICY,
): EligibilityResult {
  const reasons: EligibilityRuleResult[] = [];

  // 1. CGPA cutoff
  reasons.push({
    rule: 'cgpa',
    label: 'CGPA Cutoff',
    passed: student.cgpa >= criteria.minCgpa,
    studentValue: student.cgpa.toFixed(2),
    requiredValue: `≥ ${criteria.minCgpa.toFixed(2)}`,
  });

  // 2. Branch
  reasons.push({
    rule: 'branch',
    label: 'Eligible Branches',
    passed: criteria.allowedBranches.includes(student.branch),
    studentValue: student.branch,
    requiredValue: criteria.allowedBranches.length
      ? criteria.allowedBranches.join(', ')
      : 'All branches',
  });

  // 3. Active backlogs
  reasons.push({
    rule: 'backlogs',
    label: 'Active Backlogs',
    passed: student.activeBacklogs <= criteria.maxActiveBacklogs,
    studentValue: String(student.activeBacklogs),
    requiredValue: `≤ ${criteria.maxActiveBacklogs}`,
  });

  // 4. Class 10th
  reasons.push({
    rule: 'tenth',
    label: 'Class 10th Marks',
    passed: student.tenthPercentage >= criteria.minTenthMarks,
    studentValue: `${student.tenthPercentage}%`,
    requiredValue: `≥ ${criteria.minTenthMarks}%`,
  });

  // 5. Class 12th / Diploma
  reasons.push({
    rule: 'twelfth',
    label: 'Class 12th / Diploma Marks',
    passed: student.twelfthPercentage >= criteria.minTwelfthMarks,
    studentValue: `${student.twelfthPercentage}%`,
    requiredValue: `≥ ${criteria.minTwelfthMarks}%`,
  });

  // 6. Optional gender restriction (used by diversity hiring drives)
  if (criteria.allowedGenders && criteria.allowedGenders.length > 0) {
    const anyAllowed = criteria.allowedGenders.some(
      (g) => g === 'all' || g === student.gender,
    );
    reasons.push({
      rule: 'gender',
      label: 'Gender Criteria',
      passed: anyAllowed,
      studentValue: student.gender,
      requiredValue: criteria.allowedGenders.join(', '),
    });
  }

  const passedCount = reasons.filter((r) => r.passed).length;
  const totalRules = reasons.length;

  const warnings: string[] = [];
  if (
    criteria.maxActiveBacklogs >= 0 &&
    student.activeBacklogs > 0 &&
    !policy.allowBacklogCoreOffer &&
    criteria.maxActiveBacklogs >= 0
  ) {
    warnings.push('Active backlogs may block a core offer under college policy.');
  }
  if (student.hasAcceptedOffer) {
    warnings.push(
      `You already hold an offer at ${
        student.acceptedOfferCtc?.toFixed(2) ?? '—'
      } LPA. Taking this drive counts against your ${policy.maxOffers}-offer limit.`,
    );
  }

  return {
    isEligible: passedCount === totalRules,
    score: totalRules === 0 ? 0 : Math.round((passedCount / totalRules) * 100),
    passedCount,
    totalRules,
    reasons,
    failures: reasons.filter((r) => !r.passed).map((r) => r.label),
    warnings,
  };
}

/** Convenience wrapper: evaluates against a full drive object. */
export function evaluateForDrive(
  student: StudentProfile,
  drive: PlacementDrive,
  policy: CollegePolicy = DEFAULT_POLICY,
): EligibilityResult {
  return evaluateEligibility(student, drive.eligibility, policy);
}

/** Classifies a drive into a CTC tier using the plan's thresholds. */
export function getDriveTier(ctcLpa: number): DriveTier {
  if (ctcLpa >= TIER_THRESHOLDS.superDream) return 'super_dream';
  if (ctcLpa >= TIER_THRESHOLDS.dream) return 'dream';
  return 'regular';
}

export const TIER_LABELS: Record<DriveTier, string> = {
  super_dream: 'Super Dream',
  dream: 'Dream',
  regular: 'Regular',
};

/** True when the registration deadline has already passed. */
export function isRegistrationClosed(drive: PlacementDrive, now = new Date()): boolean {
  return new Date(drive.registrationDeadline).getTime() < now.getTime();
}

/** True when a drive is still accepting applications. */
export function isDriveOpen(drive: PlacementDrive, now = new Date()): boolean {
  return (
    drive.status === 'open' &&
    !isRegistrationClosed(drive, now) &&
    new Date(drive.driveDate).getTime() >= now.getTime()
  );
}

/** Remaining milliseconds until the registration deadline. Negative if past. */
export function timeUntilDeadline(drive: PlacementDrive, now = new Date()): number {
  return new Date(drive.registrationDeadline).getTime() - now.getTime();
}

/** Formats a duration in ms as a compact countdown string like "2d 04h" or "Closed". */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Closed';
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${String(hours).padStart(2, '0')}h`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  return `${minutes}m`;
}

/** Human-readable deadline label, e.g. "in 3 days" / "2 days ago". */
export function formatRelativeDeadline(drive: PlacementDrive, now = new Date()): string {
  const diff = timeUntilDeadline(drive, now);
  const days = Math.ceil(Math.abs(diff) / 86400000);
  if (diff <= 0) return `Closed ${days} day${days === 1 ? '' : 's'} ago`;
  if (days === 0) return 'Closes today';
  return `Closes in ${days} day${days === 1 ? '' : 's'}`;
}