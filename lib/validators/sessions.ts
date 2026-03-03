import { z } from 'zod';
import { id, isoDateTime, page, pageSize, units1to100 } from './shared';

export const SESSION_STATUS_OPTIONS = [
  'Pending-Notes',
  'Scheduled',
  'Completed',
  'Canceled',
  'No-show',
  'Rescheduled',
] as const;

export type SessionStatus = (typeof SESSION_STATUS_OPTIONS)[number];

const StatusSchema = z.enum(SESSION_STATUS_OPTIONS);

export const SessionCreateSchema = z
  .object({
    tutor_id: id,
    student_id: id,
    subject_id: id,
    parent_id: id,

    slot_units: units1to100,

    scheduled_at: isoDateTime,
    ends_at: isoDateTime,

    status: StatusSchema.optional(),
  })
  .superRefine((v, ctx) => {
    const start = new Date(v.scheduled_at);
    const end = new Date(v.ends_at);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ends_at must be after scheduled_at',
        path: ['ends_at'],
      });
    }
  });

export const SessionListQuerySchema = z.object({
  kind: z.enum(['all', 'upcoming', 'past']).default('all'),

  parent_id: id.optional(),
  tutor_id: id.optional(),
  student_id: id.optional(),
  subject_id: id.optional(),

  status: StatusSchema.optional(),

  page,
  page_size: pageSize,
});

export type SessionCreateInput = z.infer<typeof SessionCreateSchema>;
export type SessionListQuery = z.infer<typeof SessionListQuerySchema>;

// Output validation for sessions + joins
const EmbeddedRecordSchema = z.record(z.unknown());
const EmbeddedOneSchema = z.union([EmbeddedRecordSchema, z.array(EmbeddedRecordSchema), z.null()]).optional();

export const SessionWithJoinsSchema = z.object({
  id: z.number(),
  tutor_id: z.number(),
  student_id: z.number(),
  subject_id: z.number(),
  parent_id: z.number(),
  slot_units: z.number(),
  scheduled_at: z.string(),
  ends_at: z.string(),
  status: StatusSchema,

  student: EmbeddedOneSchema,
  tutor: EmbeddedOneSchema,
  parent: EmbeddedOneSchema,
});

export const SessionWithJoinsListSchema = z.array(SessionWithJoinsSchema);
export type SessionWithJoins = z.infer<typeof SessionWithJoinsSchema>;
