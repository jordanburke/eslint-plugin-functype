// Legacy ESLint config format for compatibility
export default {
  plugins: [
    "@typescript-eslint",
    "functional"
  ],
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  rules: {
    // Core JavaScript immutability
    "prefer-const": "error",
    "no-var": "error",
    
    // TypeScript functional patterns
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_" }
    ],
    
    // Functional programming rules from eslint-plugin-functional
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
  },
}