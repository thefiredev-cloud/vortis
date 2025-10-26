import { z } from 'zod';

export const analysisFormSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Stock symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .regex(/^[A-Z]+$/, 'Symbol must contain only uppercase letters')
    .transform((val) => val.toUpperCase()),

  analysisType: z.enum(['fundamental', 'technical', 'comprehensive'], {
    message: 'Please select an analysis type',
  }),

  timeframe: z.enum(['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD', 'ALL'], {
    message: 'Please select a timeframe',
  }).optional(),

  includeNews: z.boolean().default(false),

  includeEarnings: z.boolean().default(false),

  includeInstitutional: z.boolean().default(false),

  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export type AnalysisFormData = z.infer<typeof analysisFormSchema>;

export const quickAnalysisSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Stock symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .regex(/^[A-Z]+$/, 'Symbol must contain only uppercase letters')
    .transform((val) => val.toUpperCase()),
});

export type QuickAnalysisData = z.infer<typeof quickAnalysisSchema>;
