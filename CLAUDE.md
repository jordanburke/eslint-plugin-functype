# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

eslint-plugin-functype is a custom ESLint plugin providing 8 rules for functional TypeScript programming with functype library integration. This plugin creates custom ESLint rules rather than composing existing ones, providing precise TypeScript AST analysis and smart auto-fixing.

**Development Requirements:** Node.js 22.0.0 or higher (for building/testing only - end users can run the plugin on any Node version supported by ESLint).

## Commands

### Build and Development
```bash
# Build with tsup (includes typecheck)
pnpm run build

# Watch mode for development
pnpm run build:watch

# Lint the codebase
pnpm run lint

# Type check only
pnpm run typecheck

# Run all quality checks
pnpm run check
```

### Testing
```bash
# Run all tests (99 tests across 10 suites)
pnpm test

# Watch mode
pnpm test:watch

# Test UI
pnpm test:ui

# Coverage report
pnpm test:coverage

# Run single test file
pnpm test tests/rules/prefer-option.test.ts
```

### CLI Tools
```bash
# List all rules (requires build first)
pnpm run build && pnpm run list-rules

# Show rule configurations
pnpm run list-rules:verbose  

# Show usage examples
pnpm run list-rules:usage

# Check peer dependencies
pnpm run check-deps

# Show CLI help
pnpm run cli:help
```

### Publishing
```bash
# Prepare for publishing (runs full quality pipeline)
pnpm run prepublishOnly
```

## Architecture

### Core Philosophy
This plugin provides **custom ESLint rules** specifically designed for functional TypeScript patterns. Unlike rule composition approaches, custom rules offer:
- Precise TypeScript AST analysis for complex patterns
- Context-aware auto-fixing that maintains code intent  
- Built-in functype library integration and detection
- Single-pass analysis for better performance

### Plugin Structure
- **`src/index.ts`**: Main plugin entry point, exports rules object for ESLint 9+ flat config
- **`src/rules/`**: 8 custom ESLint rules, each in separate files
- **`src/utils/functype-detection.ts`**: Core utility for detecting functype library usage
- **`src/types/ast.ts`**: TypeScript AST type definitions
- **`src/cli/list-rules.ts`**: CLI tool for rule inspection
- **`dist/`**: Compiled output (CommonJS for ESLint compatibility)

### Rule Architecture
Each rule follows the pattern:
- **AST Node Visitors**: Target specific TypeScript syntax patterns
- **Functype Integration**: Check if functype is already being used properly
- **Auto-Fixing**: Provide code transformations where possible
- **Message Templates**: Structured error messages with data interpolation

Example rule structure:
```typescript
const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: "...", category: "...", recommended: true },
    fixable: "code", // If auto-fixable
    messages: { messageId: "Template with {{data}}" }
  },
  create(context) {
    const functypeImports = getFunctypeImports(context)
    return {
      TSUnionType(node) { /* visitor logic */ }
    }
  }
}
```

### Functype Integration System
The `functype-detection.ts` utility provides:
- **Import Detection**: Scans for `import { ... } from 'functype'` statements
- **Type Recognition**: Identifies Option, Either, List type usage
- **Method Call Detection**: Recognizes functype static and instance methods
- **Context Analysis**: Determines when functype patterns are already in use

### Test Architecture
- **Vitest**: Modern test runner with TypeScript support
- **@typescript-eslint/rule-tester**: Official ESLint rule testing utility
- **99 Tests**: Comprehensive coverage across all rules and edge cases
- **Integration Tests**: Real functype library usage validation
- **Auto-Fix Verification**: Ensures fixes produce valid, compilable code

Test structure:
```typescript
ruleTester.run('rule-name', rule, {
  valid: [{ name: 'description', code: '...' }],
  invalid: [{ 
    name: 'description', 
    code: '...', 
    errors: [{ messageId: 'templateId', data: {...} }],
    output: '...' // Expected auto-fix result
  }]
})
```

### Build System
- **tsup**: Fast esbuild-powered bundler optimized for libraries
- **CommonJS Output**: Required for ESLint plugin compatibility
- **TypeScript Integration**: Automatic `.d.ts` generation and type checking
- **Source Maps**: Generated for debugging support
- **Multiple Entry Points**: Plugin, CLI, and utilities compiled separately

### Key Implementation Details

#### ESLint 9+ Flat Config Only
The plugin is designed specifically for ESLint 9+ flat config format:
```javascript
import functypePlugin from 'eslint-plugin-functype'

export default [
  {
    plugins: { functype: functypePlugin },
    rules: { 'functype/prefer-option': 'error' }
  }
]
```

#### TypeScript AST Patterns
Rules analyze TypeScript-specific AST nodes:
- `TSUnionType`: For `T | null | undefined` patterns
- `TSArrayType`: For `T[]` syntax  
- `TSTypeReference`: For `Array<T>`, `ReadonlyArray<T>`
- `ArrayExpression`: For array literal `[1, 2, 3]`
- `TryStatement`: For try/catch blocks
- `IfStatement`: For conditional chains

#### Auto-Fix Implementation
Auto-fixes use ESLint's `fixer` API:
```typescript
fix(fixer) {
  return fixer.replaceText(node, `Option<${typeParam}>`)
}
```

#### Functype Library Detection
Rules check for functype usage before flagging violations:
```typescript
// Skip if already using functype properly
if (isFunctypeType(node, functypeImports)) return
if (isAlreadyUsingFunctype(node, functypeImports)) return
```

This prevents false positives when developers are already using functype correctly.