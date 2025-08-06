import recommended from "./recommended"

export default {
  ...recommended,
  rules: {
    ...recommended.rules,
    
    // Enable stricter functional rules
    "functional/no-loop-statements": "error",
    "functional/immutable-data": "error", 
    "functional/prefer-immutable-types": "warn",
    "functional/functional-parameters": "warn",
    
    // Stricter TypeScript rules (non-type-aware)
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
  },
}