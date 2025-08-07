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

### ESLint 8 (.eslintrc) - Quick Start

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

### ESLint 8 - Strict Mode

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

### ESLint 9+ (Flat Config)

For ESLint 9+, create your own flat config using our rule selections:

```javascript
// eslint.config.js
import js from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import functional from "eslint-plugin-functional"
import parser from "@typescript-eslint/parser"

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      functional,
    },
    rules: {
      // Core immutability
      "prefer-const": "error",
      "no-var": "error",
      
      // TypeScript functional patterns
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      
      // Functional programming rules
      "functional/no-let": "error",
      "functional/immutable-data": "warn",
      "functional/no-loop-statements": "off", // Enable as "error" for strict mode
    },
  }
]
```

### Individual Rule Usage

You can also use individual rules without our presets:

```javascript
{
  "plugins": ["@typescript-eslint", "functional"],
  "rules": {
    "functional/no-let": "error",
    "functional/immutable-data": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error"
  }
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

## CLI Tools

### List All Supported Rules

See exactly which rules are configured in each preset:

```bash
# Basic rule listing
pnpm run list-rules

# Show rule options/configuration
pnpm run list-rules:verbose  

# Show usage examples
pnpm run list-rules:usage

# Check peer dependency status
pnpm run check-deps

# Show help
pnpm run cli:help
```

### After Installation

Once installed globally or in a project, you can also use:

```bash
# If installed globally
functype-list-rules --help

# Or with npx
npx eslint-plugin-functype functype-list-rules
```

## CI/CD

This plugin includes GitHub Actions workflows for:
- ✅ **Testing** on Node.js 18, 20, 22
- ✅ **Linting** with our own rules  
- ✅ **Building** and validation
- ✅ **Publishing** to npm on version changes

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Lint
pnpm run lint

# List rules during development  
pnpm run list-rules
```

## Troubleshooting

### Missing Peer Dependencies

If you see errors like `Definition for rule '@typescript-eslint/no-explicit-any' was not found`, you're missing peer dependencies.

**Quick Check:**
```bash
pnpm run check-deps
```

This will show you exactly which dependencies are missing and provide the installation command.

**Manual Installation:**
```bash
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-functional eslint-plugin-prettier eslint-plugin-simple-import-sort prettier
```