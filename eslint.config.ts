import antfu from '@antfu/eslint-config'
import pluginBetterTailwind from 'eslint-plugin-better-tailwindcss'

export default antfu(
  {
    name: 'base-antfu-config',
    type: 'app',
    typescript: { tsconfigPath: './config/tsconfig.eslint.json' },
    react: true,
    nextjs: true,
    ignores: ['contracts/*', 'old/*'],
    formatters: {
      css: true,
      html: true,
      markdown: true,
      svg: true,
    },
    rules: {
      'n/prefer-global/process': ['error', 'always'],
      'unicorn/prefer-node-protocol': 'off',
    },
  },

  // Better TailwindCSS plugin
  {
    name: 'better-tailwindcss',
    files: ['**/*.tsx'],
    plugins: {
      'better-tailwindcss': pluginBetterTailwind,
    },
    rules: {
      ...pluginBetterTailwind.configs['recommended-warn'].rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': ['warn', { printWidth: 120 }],
      'better-tailwindcss/no-unregistered-classes': ['error', { detectComponentClasses: true }],
      'better-tailwindcss/enforce-shorthand-classes': 'warn',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/globals.css',
      },
    },
  },

  // 🟢 Disable rules for Markdown
  {
    files: ['**/*.md'],
    rules: {
      'import/first': 'off',
    },
  },
)
