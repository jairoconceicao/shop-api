import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import process from 'node:process'
import ts from 'typescript'

const allowedKeys = new Set(['shop-api:auth', 'shop-api:cart-session'])
const allowedPersistenceFiles = new Set([
  'src/features/auth/store/authStore.ts',
  'src/features/cart/store/cartSessionStore.ts',
  'src/features/auth/session/clearPrivateSession.ts',
])
const forbiddenPayload = /^(cpf|documentoFiscal|endereco|address|perfil|profile|itens|items|resposta|response)$/i
const sensitiveMessage = /(?:token|cpf|documentoFiscal)/i

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  }))).flat().filter((path) => !/\.test\.[cm]?[jt]sx?$/.test(path))
}

function propertyName(node) {
  return node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : null
}

function literalText(node) {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : null
}

export function auditSource(source, file = 'fixture.ts') {
  const normalizedFile = file.replaceAll('\\', '/')
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const errors = []
  const constants = new Map()
  const storageAliases = new Set()
  let hasStateStorage = false

  function fail(message) { errors.push(`${normalizedFile}: ${message}`) }
  function resolveKey(node) {
    const literal = literalText(node)
    if (literal !== null) return literal
    if (ts.isIdentifier(node)) {
      if (node.text === 'AUTH_STORE_KEY') return 'shop-api:auth'
      if (node.text === 'CART_SESSION_STORE_KEY') return 'shop-api:cart-session'
      if (node.text === 'key' && /\/(?:auth|cart)\/store\//.test(normalizedFile)) {
        return normalizedFile.includes('/auth/') ? 'shop-api:auth' : 'shop-api:cart-session'
      }
      return constants.get(node.text) ?? null
    }
    return null
  }
  function inspectPayload(node) {
    if (ts.isObjectLiteralExpression(node)) {
      for (const property of node.properties) {
        const name = propertyName(property.name)
        if (name && forbiddenPayload.test(name)) fail(`payload privado não permitido: ${name}`)
      }
    }
    ts.forEachChild(node, inspectPayload)
  }
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const value = literalText(node.initializer)
      if (value !== null) constants.set(node.name.text, value)
      if (node.type?.getText(ast) === 'StateStorage') hasStateStorage = true
      if (node.initializer && (
        node.initializer.getText(ast) === 'localStorage'
        || node.initializer.getText(ast) === 'sessionStorage'
      )) storageAliases.add(node.name.text)
    }
    if (ts.isCallExpression(node)) {
      const expression = node.expression
      const callName = ts.isIdentifier(expression) ? expression.text : null
      if (callName === 'persist') {
        const options = node.arguments[1]
        if (!options || !ts.isObjectLiteralExpression(options)) fail('persist sem opções literais')
        else {
          const name = options.properties.find((p) => propertyName(p.name) === 'name')
          const partialize = options.properties.find((p) => propertyName(p.name) === 'partialize')
          if (!name || !ts.isPropertyAssignment(name) || !allowedKeys.has(resolveKey(name.initializer))) {
            fail('persist.name não permitido ou dinâmico')
          }
          if (!partialize || !ts.isPropertyAssignment(partialize)) fail('persist sem partialize explícito')
          else inspectPayload(partialize.initializer)
        }
      }
      if (callName === 'createJSONStorage' && !allowedPersistenceFiles.has(normalizedFile)) {
        fail('createJSONStorage fora de arquivo permitido')
      }
      if (ts.isPropertyAccessExpression(expression)) {
        const method = expression.name.text
        const owner = expression.expression.getText(ast)
        if (/^(log|info|warn|error|debug)$/.test(method) && owner === 'console') {
          fail('console de produção não permitido')
        }
        if (/^(setItem|removeItem)$/.test(method)) {
          const isStorage = /(?:^|\.)localStorage$|(?:^|\.)sessionStorage$/.test(owner)
            || storageAliases.has(owner)
            || /Storage$/.test(owner)
          if (isStorage) {
            if (!allowedPersistenceFiles.has(normalizedFile)) fail('sink de storage fora de arquivo permitido')
            const key = resolveKey(node.arguments[0])
            if (!key || !allowedKeys.has(key)) fail('sink de storage com chave dinâmica ou não permitida')
          }
        }
      }
      if ((callName === 'Error' || callName === 'AppError') && node.arguments[0]) {
        const text = literalText(node.arguments[0])
        if (text && sensitiveMessage.test(text)) fail('mensagem sensível não permitida')
        if (ts.isObjectLiteralExpression(node.arguments[0])) {
          for (const property of node.arguments[0].properties) {
            if (propertyName(property.name) === 'message' && ts.isPropertyAssignment(property)) {
              const message = literalText(property.initializer)
              if (message && sensitiveMessage.test(message)) fail('mensagem sensível não permitida')
            }
          }
        }
      }
    }
    if (ts.isNewExpression(node) && node.arguments?.[0]) {
      const constructor = node.expression.getText(ast)
      if (constructor === 'Error' || constructor === 'AppError') {
        const argument = node.arguments[0]
        const text = literalText(argument)
        if (text && sensitiveMessage.test(text)) fail('mensagem sensível não permitida')
        if (ts.isObjectLiteralExpression(argument)) {
          for (const property of argument.properties) {
            if (propertyName(property.name) === 'message' && ts.isPropertyAssignment(property)) {
              const message = literalText(property.initializer)
              if (message && sensitiveMessage.test(message)) fail('mensagem sensível não permitida')
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  if (hasStateStorage && !allowedPersistenceFiles.has(normalizedFile)) fail('StateStorage fora de arquivo permitido')
  return errors
}

const negativeFixtures = [
  "localStorage.setItem('shop-api:third-private-store', '{}')",
  "persist(store, { name: 'shop-api:third-private-store', partialize: s => s })",
  'localStorage.setItem(dynamicKey, value)',
  'localStorage.setItem(getSecretKey(), value)',
  "const storage = localStorage; storage.setItem('evil', value)",
  "const storage: StateStorage = wrapper; storage.setItem('evil', value)",
  "persist(store, { name: KEY, partialize: s => ({ cpf: s.cpf }) })",
  "persist(store, { name: 'shop-api:auth', partialize: s => ({ endereco: s.endereco }) })",
  "new AppError({ message: 'token secreto' })",
  "console.error('segredo')",
]

async function main() {
  if (process.argv.includes('--self-test')) {
    const missed = negativeFixtures.findIndex((source) => auditSource(source).length === 0)
    if (missed >= 0) {
      throw new Error(`Auditoria negativa não detectou a violação ${missed + 1}.`)
    }
    process.stdout.write(`Private-data audit negative tests: ${negativeFixtures.length} PASS\n`)
    return
  }
  const files = await filesUnder(join(process.cwd(), 'src'))
  const findings = []
  for (const file of files) {
    const relativeFile = relative(process.cwd(), file).replaceAll('\\', '/')
    findings.push(...auditSource(await readFile(file, 'utf8'), relativeFile))
  }
  if (findings.length) {
    findings.forEach((finding) => process.stderr.write(`${finding}\n`))
    process.exitCode = 1
    return
  }
  process.stdout.write(`Private-data persistence audit: PASS\nAllowed keys: ${[...allowedKeys].join(', ')}\nProduction console calls: 0\nFiles inspected: ${files.length}\n`)
}

await main()
