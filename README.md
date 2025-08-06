# eslint-plugin-functype

A curated ESLint configuration bundle for functional TypeScript programming. This plugin combines and configures rules from established ESLint plugins to enforce immutability patterns and functional programming best practices.

## What This Plugin Does

Instead of recreating functional programming rules, this plugin provides carefully curated configurations that combine rules from:

- **eslint-plugin-functional**: Core functional programming rules
- **@typescript-eslint/eslint-plugin**: TypeScript-specific functional patterns  
- **ESLint core**: JavaScript immutability basics

## Installation

```bash
npm install --save-dev eslint-plugin-functype @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-functional
# or
pnpm add -D eslint-plugin-functype @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-functional
```

## Usage

### Quick Start - Recommended Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: ["plugin:functype/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
}
```

### Strict Mode

For maximum functional programming enforcement:

```javascript
// .eslintrc.js  
module.exports = {
  extends: ["plugin:functype/strict"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json", 
  },
}
```

## What Rules Are Included

### Recommended Configuration
- ✅ `prefer-const` / `no-var` - Basic immutability
- ✅ `functional/no-let` - Disallow `let` declarations
- ⚠️ `functional/immutable-data` - Warn on data mutation
- ⚠️ `functional/no-mutation` - Warn on object/array mutations
- ✅ `@typescript-eslint/consistent-type-imports` - Clean imports
- ✅ `@typescript-eslint/no-explicit-any` - Type safety

### Strict Configuration
All recommended rules plus:
- ✅ `functional/no-loop-statements` - Disallow imperative loops
- ✅ `functional/immutable-data` - Error on data mutation
- ✅ `functional/prefer-immutable-types` - Encourage readonly types
- ✅ `@typescript-eslint/explicit-function-return-type` - Explicit return types

## Examples

```typescript
// ❌ Bad (will be flagged)
let x = 1;                    // functional/no-let
arr.push(item);              // functional/immutable-data  
for(let i = 0; i < 10; i++)  // functional/no-loop-statements (strict only)

// ✅ Good  
const x = 1;
const newArr = [...arr, item];
arr.forEach(item => process(item));
```

## Configurations

- **`recommended`**: Balanced functional programming rules suitable for most projects
- **`strict`**: Maximum functional programming enforcement for pure FP codebases

## Philosophy

This plugin follows the principle of **composition over recreation**. Rather than maintaining custom rules, we curate and combine battle-tested rules from the community, ensuring:

- ✅ Less maintenance burden
- ✅ Better rule quality and edge case handling  
- ✅ Automatic updates from upstream plugins
- ✅ Community-driven improvements

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Lint
pnpm run lint
```