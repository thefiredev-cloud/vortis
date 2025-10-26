import { z } from 'zod';

export const createWatchlistSchema = z.object({
  name: z
    .string()
    .min(1, 'Watchlist name is required')
    .max(50, 'Name must be 50 characters or less'),

  description: z
    .string()
    .max(200, 'Description must be 200 characters or less')
    .optional(),

  isPublic: z.boolean().default(false),
});

export type CreateWatchlistData = z.infer<typeof createWatchlistSchema>;

export const updateWatchlistSchema = z.object({
  name: z
    .string()
    .min(1, 'Watchlist name is required')
    .max(50, 'Name must be 50 characters or less')
    .optional(),

  description: z
    .string()
    .max(200, 'Description must be 200 characters or less')
    .optional(),

  isPublic: z.boolean().optional(),
});

export type UpdateWatchlistData = z.infer<typeof updateWatchlistSchema>;

export const addStockToWatchlistSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Stock symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .regex(/^[A-Z]+$/, 'Symbol must contain only uppercase letters')
    .transform((val) => val.toUpperCase()),

  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional(),

  targetPrice: z
    .number()
    .positive('Target price must be positive')
    .optional(),

  alertPrice: z
    .number()
    .positive('Alert price must be positive')
    .optional(),
});

export type AddStockToWatchlistData = z.infer<typeof addStockToWatchlistSchema>;

export const updateWatchlistItemSchema = z.object({
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional(),

  targetPrice: z
    .number()
    .positive('Target price must be positive')
    .nullable()
    .optional(),

  alertPrice: z
    .number()
    .positive('Alert price must be positive')
    .nullable()
    .optional(),
});

export type UpdateWatchlistItemData = z.infer<typeof updateWatchlistItemSchema>;
