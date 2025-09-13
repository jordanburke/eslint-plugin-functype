// ESLint configuration for testing eslint-plugin-functype
const functypePlugin = require("../dist/index.js")
const tsParser = require("@typescript-eslint/parser")

module.exports = [
  {
    files: ["demo.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: null, // Disable type checking for demo
      },
    },
    plugins: {
      functype: functypePlugin,
    },
    rules: {
      // Enable all functype rules as errors to show violations clearly
      "functype/prefer-option": "error",
      "functype/prefer-either": "error",
      "functype/prefer-list": "error",
      "functype/prefer-fold": "error",
      "functype/prefer-map": "error",
      "functype/prefer-flatmap": "error",
      "functype/no-get-unsafe": "error",
      "functype/no-imperative-loops": "error",
    },
  },
]
