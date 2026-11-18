const { z } = require('zod');

const correctionRequestSchema = z.object({
  attendance_id: z.string().uuid().optional().or(z.literal('')),
  attendance_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date in YYYY-MM-DD required'),
  request_type: z.enum([
    'missing_check_in',
    'missing_check_out',
    'incorrect_check_in',
    'incorrect_check_out',
    'other'
  ]),
  proposed_check_in_at: z.string().datetime().optional().or(z.literal('')),
  proposed_check_out_at: z.string().datetime().optional().or(z.literal('')),
  reason: z.string().min(5, 'A clear explanation of at least 5 characters is required').trim()
});

const correctionDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  review_comment: z.string().optional(),
  adjusted_check_in_at: z.string().datetime().optional(),
  adjusted_check_out_at: z.string().datetime().optional()
});

module.exports = {
  correctionRequestSchema,
  correctionDecisionSchema
};
