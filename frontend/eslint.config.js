const eslint = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'playwright-report/**'] },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }]
    }
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility]
  },
  {
    files: ['playwright.config.ts', 'e2e/**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: { ...globals.node } }
  },
  eslintConfigPrettier
);
