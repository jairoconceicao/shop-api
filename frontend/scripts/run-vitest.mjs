import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startVitest } from 'vitest/node';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(rootDir, '..');

await startVitest('test', [], {
  run: true,
  pool: 'threads',
}, {
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@core': path.resolve(frontendRoot, 'src/app/core'),
      '@domains': path.resolve(frontendRoot, 'src/app/domains'),
      '@shared': path.resolve(frontendRoot, 'src/app/shared'),
      '@env': path.resolve(frontendRoot, 'src/environments'),
      '@testing': path.resolve(frontendRoot, 'src/testing'),
    },
  },
});
