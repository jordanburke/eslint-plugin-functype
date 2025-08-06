// For ESLint 8 (legacy config)
module.exports = {
  extends: ["../dist/configs/recommended.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
}