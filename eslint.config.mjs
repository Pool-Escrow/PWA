// @ts-check

import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

// TODO: Uncomment when Tailwind 4 support is added
// import tailwind from 'eslint-plugin-tailwindcss'

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
})

const tsFiles = ['**/*.{ts,tsx,mjs}']

const languageOptions = {
    parserOptions: {
        project: './tsconfig.eslint.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    globals: {
        React: 'readonly',
        JSX: 'readonly',
    },
}

const config = [
    { ignores: ['node_modules', '.next', 'dist', '.git'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        files: tsFiles,
        languageOptions,
        rules: {
            '@typescript-eslint/await-thenable': 'error',
        },
    },
    // TODO: Uncomment when Tailwind 4 support is added
    // ...tailwind.configs['flat/recommended'],
    // {
    // settings: {
    //     tailwindcss: {
    //         callees: ['classnames', 'clsx', 'ctl', 'cn', 'cva'],
    //         config: './tailwind.config.ts',
    //         cssFiles: ['**/*.css', '!**/node_modules', '!**/.*', '!**/dist', '!**/build'],
    //         removeDuplicates: true,
    //         skipClassAttribute: false,
    //         whitelist: [],
    //         tags: [],
    //         classRegex: '^class(Name)?$',
    //     },
    // },
    // },
    ...compat.config({
        extends: [
            'plugin:@next/next/recommended',
            'next/core-web-vitals',
            'next/typescript',
            'plugin:@tanstack/eslint-plugin-query/recommended',
            'plugin:storybook/recommended',
            'prettier',
        ],
    }),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        rules: {
            'react/self-closing-comp': 1,
            '@typescript-eslint/no-unused-vars': [
                1,
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/consistent-type-imports': 1,
        },
    },
]

export default config
