// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Ignore folder src/generated/prisma and this config file
    ignores: ['eslint.config.mjs', 'src/generated/prisma'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // Customize return-await to always require return await in async functions
      '@typescript-eslint/return-await': ['error', 'always'],
      // Customize no-unused-vars to allow unused variables that start with _
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  // Custom rules for repository files
  {
    files: ['**/*.repository.ts'],
    rules: {
      // Custom rule: enforce explicit return types on functions in repository files
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
);
