// ESLint 9.x Flat Config Format
// Complete functional TypeScript config with formatting and import organization
export default {
  name: "functype/recommended",
  rules: {
    // Core JavaScript immutability
    "prefer-const": "error",
    "no-var": "error",
    
    // TypeScript functional patterns (when @typescript-eslint is available)
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_" }
    ],
    
    // Functional programming rules (when eslint-plugin-functional is available)
    "functional/no-let": "error",
    "functional/immutable-data": "warn",
    "functional/no-loop-statements": "off", // Start disabled, can enable later
    "functional/prefer-immutable-types": "off", // Too strict for most projects
    "functional/no-mixed-types": "off",
    "functional/functional-parameters": "off",
    
    // Allow some flexibility
    "functional/no-conditional-statements": "off",
    "functional/no-expression-statements": "off",
    "functional/no-return-void": "off",
    
    // Code formatting (when eslint-plugin-prettier is available)
    "prettier/prettier": [
      "error",
      {},
      {
        usePrettierrc: true,
      },
    ],
    
    // Import organization (when eslint-plugin-simple-import-sort is available)
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
}