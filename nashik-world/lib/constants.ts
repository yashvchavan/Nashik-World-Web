export const CIVIC_POINTS = {
  REPORT_ISSUE: 5,
  COMMENT: 2,
  VERIFY_RESOLUTION: 10,
  UPVOTE: 1
} as const

export type CivicAction = keyof typeof CIVIC_POINTS

export const LEVEL_THRESHOLDS = [
  0,    // Level 1: 0-99
  100,  // Level 2: 100-249
  250,  // Level 3: 250-499
  500,  // Level 4: 500-999
  1000, // Level 5: 1000+
] as number[]

export function calculateLevel(points: number): { level: number; nextLevel: number; progress: number } {
  let level = 1;
  let nextThreshold = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      nextThreshold = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i] * 2;
    } else {
      break;
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return {
    level,
    nextLevel: nextThreshold,
    progress: Math.min(progress, 100)
  };
}
