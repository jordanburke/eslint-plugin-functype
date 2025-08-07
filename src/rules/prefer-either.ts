import type { Rule } from "eslint"

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer Either<E, T> over try/catch blocks and throw statements",
      category: "Best Practices",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          allowThrowInTests: {
            type: "boolean",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferEitherOverTryCatch: "Prefer Either<Error, T> over try/catch block",
      preferEitherOverThrow: "Prefer Either.left(error) over throw statement",
      preferEitherReturn: "Consider returning Either<Error, {{type}}> instead of throwing",
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const allowThrowInTests = options.allowThrowInTests !== false

    function isInTestFile() {
      const filename = context.getFilename()
      return /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(filename) ||
             filename.includes("__tests__") ||
             filename.includes("/test/") ||
             filename.includes("/tests/")
    }

    return {
      TryStatement(node: any) {
        context.report({
          node,
          messageId: "preferEitherOverTryCatch",
        })
      },

      ThrowStatement(node: any) {
        // Allow throws in test files if configured
        if (allowThrowInTests && isInTestFile()) return

        // Allow re-throwing in catch blocks (common pattern)
        const parent = node.parent
        if (parent && parent.type === "CatchClause") return

        context.report({
          node,
          messageId: "preferEitherOverThrow",
        })
      },

      FunctionDeclaration(node: any) {
        if (!node.body || !node.body.body) return

        // Check if function contains throw statements
        const hasThrow = node.body.body.some((stmt: any) => {
          return stmt.type === "ThrowStatement" ||
                 (stmt.type === "ExpressionStatement" && 
                  stmt.expression?.type === "CallExpression" &&
                  stmt.expression?.callee?.name === "throw")
        })

        if (hasThrow && !allowThrowInTests || !isInTestFile()) {
          const returnType = node.returnType?.typeAnnotation
          if (returnType && !context.getSourceCode().getText(returnType).includes("Either")) {
            const sourceCode = context.getSourceCode()
            const returnTypeText = returnType ? sourceCode.getText(returnType) : "unknown"
            
            context.report({
              node: node.id || node,
              messageId: "preferEitherReturn",
              data: { type: returnTypeText },
            })
          }
        }
      },
    }
  },
}

export = rule