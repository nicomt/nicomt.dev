import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import airbnbBestPractices from 'eslint-config-airbnb-base/rules/best-practices';
import airbnbErrors from 'eslint-config-airbnb-base/rules/errors';

import airbnbStrict from 'eslint-config-airbnb-base/rules/strict';
import airbnbStyle from 'eslint-config-airbnb-base/rules/style';
import airbnbVariables from 'eslint-config-airbnb-base/rules/variables';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import eslintConfigPrettier from "eslint-config-prettier";

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
});

export default [
  {
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    ignores: [
      '**/.vitepress/cache/**',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
    ],
  },
  ...compat.config(airbnbBestPractices),
  ...compat.config(airbnbErrors),
  ...compat.config(airbnbStyle),
  ...compat.config(airbnbVariables),
  ...compat.config(airbnbStrict),
  { languageOptions: { globals: globals.browser } },
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  eslintConfigPrettier,
  ...compat.config({
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        destructuredArrayIgnorePattern: '^_'
      }],
      'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
      'no-restricted-syntax': ['off', 'ForOfStatement'],
    }
  })
];
