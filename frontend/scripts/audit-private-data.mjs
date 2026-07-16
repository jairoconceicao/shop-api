import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import process from 'node:process'

const allowedKeys = new Set(['shop-api:auth', 'shop-api:cart-session'])

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  }))
  return files.flat().filter((path) => !/\.test\.[cm]?[jt]sx?$/.test(path))
}

export function auditSource(source, file = 'fixture.ts') {
  const errors = []
  const constants = new Map(
    [...source.matchAll(/\b([A-Z][A-Z0-9_]*)\s*=\s*['"]([^'"]+)['"]/g)]
      .map((match) => [match[1], match[2]]),
  )
  const resolveKey = (expression) => {
    const value = expression.trim().replace(/^['"]|['"]$/g, '')
    return constants.get(value) ?? value
  }

  if (/\bpersist\s*\(/.test(source)) {
    for (const match of source.matchAll(/\bname:\s*([^,\n}]+)/g)) {
      const key = resolveKey(match[1])
      if (!allowedKeys.has(key)) errors.push(`${file}: persist.name não permitido`)
    }
  }
  for (const match of source.matchAll(/(?:localStorage|sessionStorage|window\[[^\]]+\])\.(?:setItem|removeItem)\(\s*([^,\n)]+)/g)) {
    const expression = match[1].trim()
    const key = resolveKey(expression)
    if (!allowedKeys.has(key) && !/^(key|AUTH_STORE_KEY|CART_SESSION_STORE_KEY)$/.test(expression)) {
      errors.push(`${file}: sink de storage com chave não resolvida`)
    }
  }
  if (/console\.(?:log|info|warn|error|debug)\s*\(/.test(source)) {
    errors.push(`${file}: console de produção não permitido`)
  }
  for (const match of source.matchAll(/(?:new\s+(?:Error|AppError)|report\w*)\s*\(\s*(['"`])([\s\S]*?)\1/g)) {
    if (/(?:token|cpf|documentoFiscal)/i.test(match[2])) {
      errors.push(`${file}: mensagem sensível não permitida`)
    }
  }
  return errors
}

async function main() {
  if (process.argv.includes('--self-test')) {
    const negative = [
      "localStorage.setItem('shop-api:third-private-store', '{}')",
      "persist(store, { name: 'shop-api:third-private-store' })",
      'localStorage.setItem(dynamicKey, value)',
      "console.error('token secreto')",
    ]
    if (negative.some((source) => auditSource(source).length === 0)) {
      throw new Error('Auditoria negativa não detectou uma violação.')
    }
    console.log('Private-data audit negative tests: PASS')
    return
  }

  const root = join(process.cwd(), 'src')
  const files = await filesUnder(root)
  const findings = []
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    findings.push(...auditSource(source, relative(process.cwd(), file)))
  }
  if (findings.length) {
    for (const finding of findings) process.stderr.write(`${finding}\n`)
    process.exitCode = 1
    return
  }
  process.stdout.write([
    'Private-data persistence audit: PASS',
    'Allowed keys: shop-api:auth, shop-api:cart-session',
    'Production console calls: 0',
    `Files inspected: ${files.length}`,
  ].join('\n') + '\n')
}

await main()
