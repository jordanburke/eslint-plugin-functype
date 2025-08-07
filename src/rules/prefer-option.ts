import type { Rule } from "eslint"
import type { ASTNode } from "../types/ast"

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer Option<T> over nullable types (T | null | undefined)",
      category: "Stylistic Issues",
      recommended: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          allowNullableIntersections: {
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferOption: "Prefer Option<{{type}}> over nullable type '{{nullable}}'",
      preferOptionReturn: "Prefer Option<{{type}}> as return type over nullable '{{nullable}}'",
    },
  },

  create(context) {
    // const options = context.options[0] || {}
    // Remove unused variable
    // const _allowNullableIntersections = options.allowNullableIntersections || false

    return {
      TSUnionType(node: ASTNode) {
        if (!node.types || node.types.length < 2) return

        const hasNull = node.types.some((type: ASTNode) => 
          type.type === "TSNullKeyword" || type.type === "TSUndefinedKeyword"
        )
        
        if (!hasNull) return

        const nonNullTypes = node.types.filter((type: ASTNode) => 
          type.type !== "TSNullKeyword" && type.type !== "TSUndefinedKeyword"
        )

        if (nonNullTypes.length === 1) {
          const sourceCode = context.getSourceCode()
          const nonNullType = sourceCode.getText(nonNullTypes[0])
          const fullType = sourceCode.getText(node)

          // Skip if it's already an Option type
          if (nonNullType.startsWith("Option<")) return

          context.report({
            node,
            messageId: "preferOption",
            data: {
              type: nonNullType,
              nullable: fullType,
            },
            fix(fixer) {
              return fixer.replaceText(node, `Option<${nonNullType}>`)
            },
          })
        }
      },
    }
  },
}

export = rule