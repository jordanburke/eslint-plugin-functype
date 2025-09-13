# ESLint Plugin Functype Design Specification

## Overview

This specification defines the implementation of `eslint-plugin-functype`, a TypeScript-based ESLint plugin that enforces functional programming patterns and immutability rules for TypeScript projects.

## Plugin Objectives

1. Create a custom ESLint plugin focused on functional programming
2. Enforce immutability patterns
3. Integrate with TypeScript for type-aware rules
4. Provide a shareable configuration
5. Compatible with existing Prettier setup

## Package Structure

```
eslint-plugin-functype/
├── package.json
├── README.md
├── LICENSE
├── tsconfig.json
├── src/
│   ├── index.ts              # Plugin entry point
│   ├── configs/
│   │   ├── recommended.ts    # Recommended configuration
│   │   └── strict.ts         # Strict configuration
│   ├── rules/
│   │   ├── index.ts          # Rule exports
│   │   ├── no-let.ts         # Custom rule implementation
│   │   ├── immutable-data.ts # Custom rule implementation
│   │   └── no-loop-statements.ts
│   └── utils/
│       └── ast-utils.ts      # Shared AST utilities
├── tests/
│   ├── rules/
│   │   ├── no-let.test.ts
│   │   ├── immutable-data.test.ts
│   │   └── no-loop-statements.test.ts
│   └── configs/
│       └── recommended.test.ts
└── dist/                     # Compiled output
```

## Implementation Details

### Package.json

```json
{
  "name": "eslint-plugin-functype",
  "version": "1.0.0",
  "description": "ESLint plugin for functional TypeScript programming",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist/", "README.md", "LICENSE"],
  "keywords": ["eslint", "eslintplugin", "eslint-plugin", "functional", "typescript", "immutable"],
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src --ext .ts",
    "prepare": "npm run build"
  },
  "peerDependencies": {
    "eslint": "^8.0.0",
    "@typescript-eslint/parser": "^5.0.0 || ^6.0.0 || ^7.0.0"
  },
  "dependencies": {
    "@typescript-eslint/utils": "^7.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/rule-tester": "^7.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Plugin Entry Point (src/index.ts)

```typescript
import type { ESLint, Linter } from "eslint"
import { rules } from "./rules"
import recommended from "./configs/recommended"
import strict from "./configs/strict"

const plugin: ESLint.Plugin = {
  rules,
  configs: {
    recommended,
    strict,
  },
}

export = plugin
```

### Recommended Configuration (src/configs/recommended.ts)

```typescript
import type { Linter } from "eslint"

const config: Linter.Config = {
  plugins: ["functype"],
  rules: {
    // Disable conflicting rules
    "no-console": "off",
    "no-case-declarations": "off",

    // Error on dangerous patterns
    "no-throw-literal": "error",
    "no-extra-semi": "error",
    "no-mixed-spaces-and-tabs": "error",

    // TypeScript rules
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-readonly": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/explicit-function-return-type": "off",

    // Immutability rules
    "prefer-const": "error",
    "no-var": "error",
    "functype/no-let": "error",
    "functype/no-loop-statements": "off", // TODO: Enable soon
    "functype/immutable-data": "warn",

    // Import sorting
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",

    // Prettier
    "prettier/prettier": [
      "error",
      {},
      {
        usePrettierrc: true,
      },
    ],
  },
  overrides: [
    {
      files: ["*.test.ts", "*.spec.ts"],
      rules: {
        "functype/no-let": "off",
        "functype/immutable-data": "off",
      },
    },
  ],
}

export default config
```

### Custom Rule: no-let (src/rules/no-let.ts)

```typescript
import { ESLintUtils } from "@typescript-eslint/utils"

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/cquenced/eslint-plugin-functype/blob/main/docs/rules/${name}.md`,
)

export const noLetRule = createRule({
  name: "no-let",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow let declarations to enforce immutability",
      recommended: "error",
    },
    messages: {
      noLet: "Use 'const' instead of 'let' for immutable bindings",
    },
    schema: [],
    fixable: "code",
  },
  defaultOptions: [],
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind === "let") {
          context.report({
            node,
            messageId: "noLet",
            fix(fixer) {
              const sourceCode = context.getSourceCode()
              const letToken = sourceCode.getFirstToken(node)
              if (letToken) {
                return fixer.replaceText(letToken, "const")
              }
              return null
            },
          })
        }
      },
    }
  },
})
```

### Custom Rule: immutable-data (src/rules/immutable-data.ts)

```typescript
import { ESLintUtils, TSESTree } from "@typescript-eslint/utils"

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/cquenced/eslint-plugin-functype/blob/main/docs/rules/${name}.md`,
)

export const immutableDataRule = createRule({
  name: "immutable-data",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce immutable data patterns",
      recommended: "warn",
    },
    messages: {
      noMutation: "Avoid mutating data. Use immutable update patterns instead.",
      noArrayMutation: "Array method '{{method}}' mutates the array. Use {{alternative}} instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const mutatingArrayMethods = new Map([
      ["push", "concat or spread syntax"],
      ["pop", "slice(0, -1)"],
      ["shift", "slice(1)"],
      ["unshift", "spread syntax"],
      ["splice", "slice or filter"],
      ["sort", "toSorted or [...].sort()"],
      ["reverse", "toReversed or [...].reverse()"],
    ])

    return {
      AssignmentExpression(node: TSESTree.AssignmentExpression) {
        if (node.left.type === "MemberExpression" && node.operator === "=") {
          context.report({
            node,
            messageId: "noMutation",
          })
        }
      },

      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
          const method = node.callee.property.name
          const alternative = mutatingArrayMethods.get(method)

          if (alternative) {
            context.report({
              node,
              messageId: "noArrayMutation",
              data: {
                method,
                alternative,
              },
            })
          }
        }
      },
    }
  },
})
```

### Rule Index (src/rules/index.ts)

```typescript
import { noLetRule } from "./no-let"
import { immutableDataRule } from "./immutable-data"
import { noLoopStatementsRule } from "./no-loop-statements"

export const rules = {
  "no-let": noLetRule,
  "immutable-data": immutableDataRule,
  "no-loop-statements": noLoopStatementsRule,
}
```

## Usage in Projects

### Installation

```bash
npm install --save-dev eslint-plugin-functype
```

### ESLint Configuration (.eslintrc.js)

```javascript
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "functype", "simple-import-sort", "prettier"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:functype/recommended", "prettier"],
  rules: {
    // Additional project-specific overrides
  },
}
```

### Or use the provided config directly

```javascript
module.exports = require("eslint-plugin-functype/dist/configs/recommended").default
```

## Testing Strategy

### Rule Tests (tests/rules/no-let.test.ts)

```typescript
import { RuleTester } from "@typescript-eslint/rule-tester"
import { noLetRule } from "../../src/rules/no-let"

const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
})

ruleTester.run("no-let", noLetRule, {
  valid: ["const x = 1", "const obj = { a: 1 }", "function test() { const y = 2; return y }"],
  invalid: [
    {
      code: "let x = 1",
      errors: [{ messageId: "noLet" }],
      output: "const x = 1",
    },
    {
      code: "let x = 1, y = 2",
      errors: [{ messageId: "noLet" }],
      output: "const x = 1, y = 2",
    },
  ],
})
```

## Documentation Structure

```
docs/
├── README.md
├── rules/
│   ├── no-let.md
│   ├── immutable-data.md
│   └── no-loop-statements.md
└── configs/
    ├── recommended.md
    └── strict.md
```

## Publishing Checklist

1. **Build and Test**

   ```bash
   npm run build
   npm test
   npm run lint
   ```

2. **Documentation**
   - Complete rule documentation
   - Usage examples
   - Migration guide

3. **Version and Publish**
   ```bash
   npm version minor
   npm publish --access public
   ```

## Rollout Plan

1. **Phase 1**: Implement core rules (no-let, immutable-data)
2. **Phase 2**: Add loop statement rules
3. **Phase 3**: Add advanced immutability rules
4. **Phase 4**: Create auto-fix capabilities
5. **Phase 5**: Add configuration presets for different strictness levels

## Success Criteria

1. Zero runtime overhead
2. Clear, actionable error messages
3. Auto-fixable where possible
4. Minimal false positives
5. Easy integration with existing TypeScript projects
6. Compatible with Prettier

## Future Enhancements

- Type-aware immutability checking
- Custom immutable data structure support
- Integration with functional libraries (fp-ts, Ramda)
- Performance rules for functional patterns
- Async/await functional patterns
