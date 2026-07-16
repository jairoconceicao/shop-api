import { readFileSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

export const INITIAL_LIMIT_BYTES = 500_000
export const lazySources = [
  'src/features/checkout/pages/CheckoutPage.tsx',
  'src/features/checkout/pages/OrderConfirmationPage.tsx',
  'src/features/customer/pages/CustomerDataPage.tsx',
  'src/features/customer/pages/CustomerPasswordPage.tsx',
  'src/features/orders/pages/OrdersPage.tsx',
  'src/features/orders/pages/OrderDetailPage.tsx',
]

export function auditProductionGraph(manifest, getFileSize) {
  const entries = Object.entries(manifest).filter(([, chunk]) => chunk.isEntry)
  if (entries.length !== 1) throw new Error(`Expected one production entry, found ${entries.length}.`)
  const [entrySource] = entries[0]

  const staticReachable = new Set()
  const edges = []
  function visit(source) {
    if (staticReachable.has(source)) return
    staticReachable.add(source)
    for (const imported of manifest[source]?.imports ?? []) {
      edges.push(`${source} -> ${imported}`)
      visit(imported)
    }
  }
  visit(entrySource)

  const initialFiles = [...staticReachable]
    .map((source) => manifest[source]?.file)
    .filter((file) => typeof file === 'string' && file.endsWith('.js'))
    .map((file) => ({ file, bytes: getFileSize(file) }))

  for (const { file, bytes } of initialFiles) {
    if (bytes > INITIAL_LIMIT_BYTES) {
      throw new Error(`${file} exceeds ${INITIAL_LIMIT_BYTES} bytes (${bytes}).`)
    }
  }

  const lazyChunks = lazySources.map((source) => {
    const chunk = manifest[source]
    if (!chunk?.isDynamicEntry) throw new Error(`${source} is not a dynamic entry.`)
    if (staticReachable.has(source)) throw new Error(`${source} is statically reachable from ${entrySource}.`)
    return { source, file: chunk.file }
  })
  if (new Set(lazyChunks.map(({ file }) => file)).size !== lazySources.length) {
    throw new Error('Lazy routes do not produce six distinct chunks.')
  }

  return { entrySource, initialFiles, lazyChunks, edges, staticReachable }
}

export function printAudit(result) {
  console.log(`Entry: ${result.entrySource}`)
  console.log('Initial JavaScript:')
  for (const item of result.initialFiles) console.log(`- ${item.file}: ${item.bytes} bytes`)
  console.log('Lazy routes:')
  for (const item of result.lazyChunks) console.log(`- ${item.source} -> ${item.file}`)
  console.log('Static import edges:')
  for (const edge of result.edges) console.log(`- ${edge}`)
}

function run() {
  const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const manifest = JSON.parse(readFileSync(join(frontendRoot, 'dist/.vite/manifest.json'), 'utf8'))
  const result = auditProductionGraph(
    manifest,
    (file) => statSync(join(frontendRoot, 'dist', file)).size,
  )
  printAudit(result)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run()
