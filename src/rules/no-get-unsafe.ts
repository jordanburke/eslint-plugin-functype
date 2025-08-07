import type { Rule } from "eslint"

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Avoid unsafe .get() calls on Option, Either, and other monadic types",
      category: "Possible Errors",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          allowInTests: {
            type: "boolean",
            default: true,
          },
          unsafeMethods: {
            type: "array",
            items: { type: "string" },
            default: ["get", "getOrThrow", "unwrap", "expect"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noUnsafeGet: "Avoid unsafe .{{method}}() call. Use .fold(), .map(), or .getOrElse() instead",
      noUnsafeGetSuggestion: "Consider using .getOrElse(defaultValue) or .fold() for safe access",
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const allowInTests = options.allowInTests !== false
    const unsafeMethods = options.unsafeMethods || ["get", "getOrThrow", "unwrap", "expect"]

    function isInTestFile() {
      const filename = context.getFilename()
      return /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(filename) ||
             filename.includes("__tests__") ||
             filename.includes("/test/") ||
             filename.includes("/tests/")
    }

    function isMonadicType(node: any): boolean {
      // This is a simplified check - in a real implementation, you'd want
      // more sophisticated type checking using TypeScript's type checker
      if (!node) return false
      
      const sourceCode = context.getSourceCode()
      
      // Check for common patterns that indicate monadic types
      const text = sourceCode.getText(node)
      return /\b(Option|Either|Maybe|Result|Some|None|Left|Right)\b/.test(text) ||
             // Check for method chains that suggest monadic operations
             /\.(map|flatMap|filter|fold)\s*\(/.test(text)
    }

    return {
      MemberExpression(node: any) {
        if (allowInTests && isInTestFile()) return

        const property = node.property
        if (!property || property.type !== "Identifier") return

        const methodName = property.name
        if (!unsafeMethods.includes(methodName)) return

        // Check if this looks like it's being called on a monadic type
        if (isMonadicType(node.object)) {
          context.report({
            node,
            messageId: "noUnsafeGet",
            data: { method: methodName },
          })
        }
      },

      CallExpression(node: any) {
        if (allowInTests && isInTestFile()) return

        if (node.callee.type !== "MemberExpression") return

        const property = node.callee.property
        if (!property || property.type !== "Identifier") return

        const methodName = property.name
        if (!unsafeMethods.includes(methodName)) return

        // Check if this looks like it's being called on a monadic type
        if (isMonadicType(node.callee.object)) {
          context.report({
            node,
            messageId: "noUnsafeGet",
            data: { method: methodName },
          })
        }
      },
    }
  },
}

export = rule