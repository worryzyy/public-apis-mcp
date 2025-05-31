import { z } from 'zod';

export const ApiCategorySchema = z.object({
  API: z.string(),
  Description: z.string(),
  Auth: z.string(),
  HTTPS: z.boolean(),
  Cors: z.string(),
  Link: z.string(),
  Category: z.string()
});

export const ApiResponseSchema = z.object({
  count: z.number(),
  entries: z.array(ApiCategorySchema)
});

export type ApiEntry = z.infer<typeof ApiCategorySchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

export interface ApiFilter {
  category?: string;
  title?: string;
  description?: string;
  auth?: string;
  https?: boolean;
  cors?: string;
}

export interface RecommendationRequest {
  userIntent: string;
  useCase?: string;
  technicalLevel?: 'beginner' | 'intermediate' | 'advanced';
  authPreference?: 'none' | 'simple' | 'oauth' | 'any';
  prioritizeReliability?: boolean;
  maxResults?: number;
}

export interface ScoredApi extends ApiEntry {
  score: number;
  reasons: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  popularity: number;
}
