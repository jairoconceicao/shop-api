import { describe, expect, it } from 'vitest'

import { auditProductionGraph } from './verify-production-graph.mjs'

describe('auditProductionGraph', () => {
  it('rejects an initial JavaScript file above 500000 bytes', () => {
    const manifest = {
      'index.html': { file: 'assets/index.js', isEntry: true },
    }

    expect(() => auditProductionGraph(manifest, () => 500_001)).toThrow(
      'assets/index.js exceeds 500000 bytes',
    )
  })
})
