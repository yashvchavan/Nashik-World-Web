export const CIVIC_POINTS = {
  REPORT_ISSUE: 5,
  COMMENT: 2,
  VERIFY_RESOLUTION: 10,
  UPVOTE: 1
} as const

export type CivicAction = keyof typeof CIVIC_POINTS
