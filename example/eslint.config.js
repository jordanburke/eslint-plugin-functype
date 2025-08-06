// For ESLint 9 (flat config)
import tseslint from '@typescript-eslint/eslint-plugin';
import functional from 'eslint-plugin-functional';
import parser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      functional,
    },
    rules: {
      // Core JavaScript immutability
      'prefer-const': 'error',
      'no-var': 'error',
      
      // TypeScript functional patterns
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      
      // Functional programming rules
      'functional/no-let': 'error',
      'functional/immutable-data': 'warn',
    },
  },
];