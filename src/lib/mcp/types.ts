import { z } from 'zod';

// Input schemas for MCP tools
export const GetOpenPRsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  minVotes: z.number().optional(),
});

export const GetMergedPRsSchema = z.object({
  limit: z.number().min(1).max(50).optional().default(10),
});

export const GetPRDetailsSchema = z.object({
  prNumber: z.number().int().positive(),
});

// Type exports
export type GetOpenPRsInput = z.infer<typeof GetOpenPRsSchema>;
export type GetMergedPRsInput = z.infer<typeof GetMergedPRsSchema>;
export type GetPRDetailsInput = z.infer<typeof GetPRDetailsSchema>;
