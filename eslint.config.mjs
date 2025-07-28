import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([globalIgnores(["contracts/*/*"]), {
    extends: compat.extends(
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@tanstack/eslint-plugin-query/recommended",
        "plugin:tailwindcss/recommended",
        "prettier",
        "plugin:storybook/recommended",
    ),

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: "./tsconfig.eslint.json",
        },
    },

    rules: {
        "react/self-closing-comp": 1,

        "@typescript-eslint/no-unused-vars": [1, {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
        }],

        "@typescript-eslint/consistent-type-imports": 1,
    },
}]);