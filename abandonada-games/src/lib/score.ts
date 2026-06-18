import { z } from "zod";

export const scoreSubmissionSchema = z.object({
  slug: z.string().min(1),
  player: z.string().min(1).max(18),
  score: z.number().int().min(0).max(999999),
  durationMs: z.number().int().min(1000).max(180000),
  eventsHandled: z.number().int().min(1).max(999),
});

export type ScoreSubmission = z.infer<typeof scoreSubmissionSchema>;

export type RankingEntry = {
  player: string;
  score: number;
  createdAt: string;
};
