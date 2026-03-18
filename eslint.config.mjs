import antfu from '@antfu/eslint-config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import importX from 'eslint-plugin-import-x'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default antfu(
  {
    vue: true,
    typescript: true,
    formatters: true,
    stylistic: false,
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'import-x': importX,
    },
    rules: {
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^node:'],
            ['^vue', '^@vue', '^nuxt', '^#app', '^#imports'],
            ['^pinia'],
            ['^@glass/'],
            ['^@', '^[a-z]'],
            ['^~/'],
            ['^\\.'],
            ['^.*\\u0000$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import-x/no-cycle': ['error', { maxDepth: 5 }],
      'import-x/order': 'off',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/dist/**',
      '.yarn/**',
      '**/__mf__temp/**',
      '**/.mf/**',
      '**/public/remotes/**',
      '**/*.md',
    ],
  },
  eslintConfigPrettier,
)
