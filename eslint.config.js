const js = require("@eslint/js")
const tseslint = require("@typescript-eslint/eslint-plugin")
const parser = require("@typescript-eslint/parser")

module.exports = [
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        // Node.js globals
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        require: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Core immutability
      "prefer-const": "error",
      "no-var": "error",
      
      // TypeScript rules
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_", // Only underscore-prefixed parameters
          "varsIgnorePattern": "^(_|[A-Z]$)", // Allow underscore-prefixed vars and single uppercase letters (interface generics)
          "caughtErrors": "all", // Require using catch block errors or prefix with _
          "caughtErrorsIgnorePattern": "^_", // Allow _error, _e, etc. in catch blocks
          "destructuredArrayIgnorePattern": "^_",
          "ignoreRestSiblings": true,
          "args": "after-used"
        }
      ],
    },
  }
]