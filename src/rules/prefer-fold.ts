import type { Rule } from "eslint"
import type { ASTNode } from "../types/ast"

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer .fold() over if/else chains when working with monadic types",
      category: "Best Practices", 
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          minComplexity: {
            type: "integer",
            minimum: 1,
            default: 2,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferFold: "Prefer .fold() over if/else when working with {{type}} types",
      preferFoldTernary: "Consider using .fold() instead of ternary operator for {{type}}",
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const minComplexity = options.minComplexity || 2

    function isMonadicCheck(node: ASTNode): { isMonadic: boolean; type: string } {
      const sourceCode = context.getSourceCode()
      const text = sourceCode.getText(node)

      // Check for common monadic type checks
      if (/\.(isSome|isNone|isEmpty|isDefined)\s*\(\s*\)/.test(text)) {
        return { isMonadic: true, type: "Option" }
      }
      
      if (/\.(isLeft|isRight)\s*\(\s*\)/.test(text)) {
        return { isMonadic: true, type: "Either" }
      }

      if (/\.(isSuccess|isFailure)\s*\(\s*\)/.test(text)) {
        return { isMonadic: true, type: "Result" }
      }

      // Check for null/undefined checks on variables that might be Options
      if (node.type === "BinaryExpression") {
        if ((node.operator === "===" || node.operator === "!==") &&
            ((node.left.type === "Literal" && (node.left.value === null || node.left.value === undefined)) ||
             (node.right.type === "Literal" && (node.right.value === null || node.right.value === undefined)))) {
          // This might be checking an Option that hasn't been properly typed
          return { isMonadic: true, type: "Option" }
        }
        
        // Check for == or != with undefined
        if ((node.operator === "==" || node.operator === "!=" || node.operator === "===" || node.operator === "!==")) {
          const leftIsUndefined = (node.left.type === "Identifier" && node.left.name === "undefined") ||
                                 (node.left.type === "Literal" && node.left.value === undefined)
          const rightIsUndefined = (node.right.type === "Identifier" && node.right.name === "undefined") ||
                                  (node.right.type === "Literal" && node.right.value === undefined)
          
          if (leftIsUndefined || rightIsUndefined) {
            return { isMonadic: true, type: "Option" }
          }
        }
      }

      return { isMonadic: false, type: "" }
    }

    function analyzeIfStatement(node: ASTNode) {
      const test = node.test
      const monadicInfo = isMonadicCheck(test)
      
      if (!monadicInfo.isMonadic) return

      // Count the complexity (if/else if/else chain)
      let complexity = 1
      let current = node
      while (current.alternate) {
        complexity++
        if (current.alternate.type === "IfStatement") {
          current = current.alternate
        } else {
          break
        }
      }

      if (complexity >= minComplexity) {
        context.report({
          node,
          messageId: "preferFold",
          data: { type: monadicInfo.type },
        })
      }
    }

    return {
      IfStatement(node: ASTNode) {
        analyzeIfStatement(node)
      },

      ConditionalExpression(node: ASTNode) {
        const monadicInfo = isMonadicCheck(node.test)
        if (monadicInfo.isMonadic) {
          context.report({
            node,
            messageId: "preferFoldTernary", 
            data: { type: monadicInfo.type },
          })
        }
      },
    }
  },
}

export = rule