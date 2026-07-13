import { z } from 'zod'

const transportIntegerSchema = z.union([
  z.number().int(),
  z.string().regex(/^-?(?:0|[1-9]\d*)$/),
])

export function createApiResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    status: z.boolean().optional(),
    message: z.string().optional(),
    data: dataSchema.nullable().optional(),
  })
}

export function createPagedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    status: z.boolean().optional(),
    message: z.string().optional(),
    pagination: z
      .object({
        pages: transportIntegerSchema.optional(),
        size: transportIntegerSchema.optional(),
        totalItems: transportIntegerSchema.optional(),
        data: z.array(itemSchema).optional(),
      })
      .optional(),
  })
}

export const apiErrorResponseSchema = z.object({
  error: z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
      details: z.unknown().optional(),
    })
    .optional(),
})

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
