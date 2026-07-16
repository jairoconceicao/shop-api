import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
  apiErrorResponseSchema,
  createApiResponseSchema,
  createPagedResponseSchema,
} from './apiEnvelopes'

const resourceSchema = z.object({ id: z.number(), name: z.string() })

describe('createApiResponseSchema', () => {
  const schema = createApiResponseSchema(resourceSchema)

  it('validates a response with typed data', () => {
    expect(
      schema.parse({
        status: true,
        message: 'Resource found',
        data: { id: 1, name: 'Keyboard' },
      }),
    ).toEqual({
      status: true,
      message: 'Resource found',
      data: { id: 1, name: 'Keyboard' },
    })
  })

  it('accepts nullable data and optional fields from the OpenAPI contract', () => {
    expect(schema.parse({ data: null })).toEqual({ data: null })
    expect(schema.parse({})).toEqual({})
  })

  it('rejects data that does not match the supplied schema', () => {
    expect(() => schema.parse({ data: { id: '1', name: 'Keyboard' } })).toThrow()
  })

  it('rejects properties outside the success envelope contract', () => {
    expect(() => schema.parse({ data: null, unexpected: true })).toThrow()
  })
})

describe('createPagedResponseSchema', () => {
  const schema = createPagedResponseSchema(resourceSchema)

  it('validates pagination with integer numbers or integer strings', () => {
    expect(
      schema.parse({
        status: true,
        message: 'Resources found',
        pagination: {
          pages: '2',
          size: 20,
          totalItems: '21',
          data: [{ id: 1, name: 'Keyboard' }],
        },
      }),
    ).toEqual({
      status: true,
      message: 'Resources found',
      pagination: {
        pages: '2',
        size: 20,
        totalItems: '21',
        data: [{ id: 1, name: 'Keyboard' }],
      },
    })
  })

  it('accepts optional envelope and pagination fields', () => {
    expect(schema.parse({})).toEqual({})
    expect(schema.parse({ pagination: {} })).toEqual({ pagination: {} })
  })

  it.each([1.5, '1.5', '01', 'not-a-number'])(
    'rejects an invalid pagination integer: %s',
    (pages) => {
      expect(() => schema.parse({ pagination: { pages } })).toThrow()
    },
  )

  it('rejects an item that does not match the supplied schema', () => {
    expect(() =>
      schema.parse({ pagination: { data: [{ id: 1 }] } }),
    ).toThrow()
  })

  it('rejects extra pagination properties and unsafe numeric integers', () => {
    expect(() => schema.parse({ pagination: { extra: true } })).toThrow()
    for (const field of ['pages', 'size', 'totalItems'] as const) {
      expect(() => schema.parse({ pagination: { [field]: Number.MAX_SAFE_INTEGER + 1 } })).toThrow()
    }
  })
})

describe('apiErrorResponseSchema', () => {
  it('validates error details with an unknown shape', () => {
    const response = {
      error: {
        code: 'validation_error',
        message: 'Request validation failed',
        details: { email: ['Invalid email'] },
      },
    }

    expect(apiErrorResponseSchema.parse(response)).toEqual(response)
  })

  it('accepts optional fields from the OpenAPI contract', () => {
    expect(apiErrorResponseSchema.parse({})).toEqual({})
    expect(apiErrorResponseSchema.parse({ error: {} })).toEqual({ error: {} })
  })

  it('rejects invalid error field types', () => {
    expect(() =>
      apiErrorResponseSchema.parse({ error: { code: 422 } }),
    ).toThrow()
  })

  it('rejects properties outside error envelope levels', () => {
    expect(() => apiErrorResponseSchema.parse({ extra: true })).toThrow()
    expect(() => apiErrorResponseSchema.parse({ error: { extra: true } })).toThrow()
  })
})
