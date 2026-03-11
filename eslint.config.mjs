import antfu from '@antfu/eslint-config'
import importX from 'eslint-plugin-import-x'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default antfu(
  {
    vue: true,
    typescript: true,
    formatters: true,
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'import-x': importX,
    },
    rules: {
      // Сортировка импортов
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Side effects
            ['^\\u0000'],
            // 2. Node built-ins
            ['^node:'],
            // 3. Vue / Nuxt / Vite ecosystem
            ['^vue', '^@vue', '^nuxt', '^#app', '^#imports'],
            // 4. Pinia
            ['^pinia'],
            // 5. Монорепо пакеты @glass/*
            ['^@glass/'],
            // 6. Внешние пакеты
            ['^@', '^[a-z]'],
            // 7. Абсолютные алиасы (~/, #/)
            ['^~/'],
            // 8. Относительные импорты
            ['^\\.'],
            // 9. Типы
            ['^.*\\u0000$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // Circular dependencies
      'import-x/no-cycle': ['error', { maxDepth: 5 }],

      // Порядок групп (дублирует simple-import-sort, но ловит другие кейсы)
      'import-x/order': 'off', // отключаем — используем simple-import-sort
    },
  },
  {
    // Игнорируем сгенерированные файлы
    ignores: [
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/dist/**',
      '.yarn/**',
      '**/__mf__temp/**',
      '**/.mf/**',
    ],
  },
)
