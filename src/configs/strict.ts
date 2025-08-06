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
    
    // Stricter TypeScript rules
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/prefer-readonly-parameter-types": "warn",
  },
}