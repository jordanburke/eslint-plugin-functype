# eslint-plugin-functype

Custom ESLint rules for functional TypeScript programming with [functype](https://github.com/jordanburke/functype) library patterns. Enforces immutability, type safety, and functional programming best practices for ESLint 9+.

[![npm version](https://badge.fury.io/js/eslint-plugin-functype.svg)](https://www.npmjs.com/package/eslint-plugin-functype)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔧 **8 Custom ESLint Rules** - Purpose-built for functional TypeScript patterns
- 🏗️ **Functype Library Integration** - Smart detection when functype is already being used properly
- 🛠️ **Auto-Fixable** - Most violations can be automatically fixed with `--fix`
- ⚡ **ESLint 9+ Flat Config** - Modern ESLint configuration format
- 🎯 **TypeScript Native** - Built specifically for TypeScript AST patterns
- 📊 **99 Tests** - Comprehensive test coverage including real functype integration

## Rules

| Rule | Description | Auto-Fix |
|------|-------------|----------|
| `prefer-option` | Prefer `Option<T>` over nullable types (`T \| null \| undefined`) | ✅ |
| `prefer-either` | Prefer `Either<E, T>` over try/catch and throw statements | ✅ |
| `prefer-list` | Prefer `List<T>` over native arrays for immutable collections | ✅ |
| `prefer-fold` | Prefer `.fold()` over complex if/else chains | ✅ |
| `prefer-map` | Prefer `.map()` over imperative transformations | ✅ |
| `prefer-flatmap` | Prefer `.flatMap()` over `.map().flat()` patterns | ✅ |
| `no-get-unsafe` | Disallow unsafe `.get()` calls on Option/Either types | ❌ |
| `no-imperative-loops` | Prefer functional iteration over imperative loops | ✅ |

## Installation

```bash
npm install --save-dev eslint-plugin-functype
# or
pnpm add -D eslint-plugin-functype
```

**Optional:** Install functype library for enhanced integration:

```bash
npm install functype
# or  
pnpm add functype
```

## Usage

### ESLint 9+ Flat Config (Recommended)

```javascript
// eslint.config.mjs
import functypePlugin from 'eslint-plugin-functype'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      functype: functypePlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      // All rules as errors
      'functype/prefer-option': 'error',
      'functype/prefer-either': 'error', 
      'functype/prefer-list': 'error',
      'functype/prefer-fold': 'error',
      'functype/prefer-map': 'error',
      'functype/prefer-flatmap': 'error',
      'functype/no-get-unsafe': 'error',
      'functype/no-imperative-loops': 'error',
    },
  },
]
```

### Individual Rule Configuration

```javascript
// eslint.config.mjs - Selective rules
export default [
  {
    files: ['**/*.ts'],
    plugins: { functype: functypePlugin },
    rules: {
      // Start with just type safety rules
      'functype/prefer-option': 'warn',
      'functype/no-get-unsafe': 'error',
      
      // Add more as your codebase evolves
      'functype/prefer-list': 'off', // Disable for gradual adoption
    },
  },
]
```

## Examples

### ❌ Before (violations flagged)

```typescript
// prefer-option: nullable types
const user: User | null = findUser(id)
function getAge(): number | undefined { /* ... */ }

// prefer-either: try/catch blocks  
try {
  const result = riskyOperation()
  return result
} catch (error) {
  console.error(error)
  return null
}

// prefer-list: native arrays
const items: number[] = [1, 2, 3]
const readonlyItems: ReadonlyArray<string> = ["a", "b"]

// no-imperative-loops: for/while loops
for (let i = 0; i < items.length; i++) {
  console.log(items[i])
}

// prefer-fold: complex if/else chains
if (condition1) {
  return value1
} else if (condition2) {
  return value2  
} else {
  return defaultValue
}
```

### ✅ After (auto-fixed or manually corrected)

```typescript
import { Option, Either, List } from 'functype'

// prefer-option: use Option<T>
const user: Option<User> = Option.fromNullable(findUser(id))
function getAge(): Option<number> { /* ... */ }

// prefer-either: use Either<E, T>
function safeOperation(): Either<Error, Result> {
  try {
    const result = riskyOperation()
    return Either.right(result)
  } catch (error) {
    return Either.left(error as Error)
  }
}

// prefer-list: use List<T>
const items: List<number> = List.from([1, 2, 3])
const readonlyItems: List<string> = List.from(["a", "b"])

// no-imperative-loops: use functional methods
items.forEach(item => console.log(item))

// prefer-fold: use fold for conditional logic
const result = Option.fromBoolean(condition1)
  .map(() => value1)
  .orElse(() => Option.fromBoolean(condition2).map(() => value2))
  .getOrElse(defaultValue)
```

## Functype Integration

The plugin is **functype-aware** and won't flag code that's already using functype properly:

```typescript
import { Option, List } from 'functype'

// ✅ These won't be flagged - already using functype correctly
const user = Option.some({ name: "Alice" })
const items = List.from([1, 2, 3])
const result = user.map(u => u.name).getOrElse("Unknown")

// ❌ These will still be flagged - bad patterns even with functype available  
const badUser: User | null = null        // prefer-option
const badItems = [1, 2, 3]              // prefer-list
```

## CLI Tools

### List All Rules

```bash
# After installation
npx functype-list-rules

# During development
pnpm run list-rules

# Verbose output with configurations
pnpm run list-rules:verbose

# Usage examples
pnpm run list-rules:usage
```

### Development Commands

```bash
# Install dependencies
pnpm install

# Build plugin
pnpm run build

# Run tests (99 tests)
pnpm test

# Lint codebase
pnpm run lint

# Type check
pnpm run typecheck

# Run all quality checks
pnpm run check
```

## Architecture

### Philosophy: Custom Rules for Precise Control

This plugin provides **custom ESLint rules** specifically designed for functional TypeScript patterns, rather than composing existing rules. This approach offers:

- 🎯 **Precise AST Analysis** - Rules understand TypeScript-specific patterns
- 🔧 **Smart Auto-Fixing** - Context-aware fixes that maintain code intent
- 📚 **Functype Integration** - Built-in detection of functype library usage
- 🚀 **Better Performance** - Single-pass analysis instead of multiple rule evaluations

### ESLint 9+ Flat Config Only

- **Modern Configuration** - Uses ESLint 9.x flat config format
- **No Legacy Support** - Clean architecture without backwards compatibility burden
- **Plugin-First Design** - Designed specifically as an ESLint plugin

### Test Coverage

- **99 Tests Total** across 10 test suites
- **Integration Tests** with real functype library usage
- **Auto-Fix Verification** ensures fixes produce valid code
- **False Positive Prevention** tests ensure proper functype patterns aren't flagged

## Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature-name`
3. **Make** your changes and add tests
4. **Ensure** all quality checks pass: `pnpm run check`
5. **Submit** a pull request

### Development Setup

```bash
git clone https://github.com/jordanburke/eslint-plugin-functype.git
cd eslint-plugin-functype
pnpm install
pnpm run build
pnpm test
```

## License

[MIT](LICENSE) © [Jordan Burke](https://github.com/jordanburke)

## Related

- **[functype](https://github.com/jordanburke/functype)** - Functional programming library for TypeScript
- **[eslint-config-functype](https://github.com/jordanburke/eslint-config-functype)** - Complete ESLint config for functional TypeScript projects

---

**Need help?** [Open an issue](https://github.com/jordanburke/eslint-plugin-functype/issues) or check the [functype documentation](https://jordanburke.github.io/functype/).