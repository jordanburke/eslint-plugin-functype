import type { Rule } from "eslint"
import type { ASTNode } from "../types/ast"

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer List<T> over native arrays for immutable collections",
      category: "Stylistic Issues",
      recommended: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          allowArraysInTests: {
            type: "boolean",
            default: true,
          },
          allowReadonlyArrays: {
            type: "boolean", 
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferList: "Prefer List<{{type}}> over array type {{arrayType}}",
      preferListLiteral: "Prefer List.of(...) or List.from([...]) over array literal",
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const allowArraysInTests = options.allowArraysInTests !== false
    const allowReadonlyArrays = options.allowReadonlyArrays !== false

    function isInTestFile() {
      const filename = context.getFilename()
      return /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(filename) ||
             filename.includes("__tests__") ||
             filename.includes("/test/") ||
             filename.includes("/tests/")
    }

    return {
      TSArrayType(node: ASTNode) {
        if (allowArraysInTests && isInTestFile()) return

        const sourceCode = context.getSourceCode()
        const elementType = sourceCode.getText(node.elementType)
        const fullType = sourceCode.getText(node)

        context.report({
          node,
          messageId: "preferList",
          data: {
            type: elementType,
            arrayType: fullType,
          },
          fix(fixer) {
            return fixer.replaceText(node, `List<${elementType}>`)
          },
        })
      },

      TSTypeReference(node: ASTNode) {
        if (allowArraysInTests && isInTestFile()) return

        const sourceCode = context.getSourceCode()
        
        // Get type name - handle both simple identifiers and member expressions
        let typeName = ""
        if (node.typeName.type === "Identifier") {
          typeName = node.typeName.name
        } else {
          typeName = sourceCode.getText(node.typeName)
        }

        // Handle Array<T> syntax
        if (typeName === "Array" && node.typeParameters?.params?.[0]) {
          const typeParam = sourceCode.getText(node.typeParameters.params[0])
          const fullType = sourceCode.getText(node)

          // Skip if already readonly
          if (allowReadonlyArrays && fullType.startsWith("readonly")) return

          context.report({
            node,
            messageId: "preferList",
            data: {
              type: typeParam,
              arrayType: fullType,
            },
            fix(fixer) {
              return fixer.replaceText(node, `List<${typeParam}>`)
            },
          })
        }

        // Handle ReadonlyArray<T> - suggest List even if allowing readonly arrays
        if (typeName === "ReadonlyArray" && node.typeParameters?.params?.[0]) {
          const typeParam = sourceCode.getText(node.typeParameters.params[0])
          const fullType = sourceCode.getText(node)

          context.report({
            node,
            messageId: "preferList",
            data: {
              type: typeParam,
              arrayType: fullType,
            },
            fix(fixer) {
              return fixer.replaceText(node, `List<${typeParam}>`)
            },
          })
        }
      },

      ArrayExpression(node: ASTNode) {
        if (allowArraysInTests && isInTestFile()) return

        // Only flag non-empty arrays to avoid noise
        if (node.elements.length === 0) return

        // Don't flag array literals that are already part of a type annotation context
        // (those should be handled by the type checking rules)
        let parent = node.parent
        let hasTypeAnnotation = false
        while (parent) {
          if (parent.type === "VariableDeclarator" && parent.id?.typeAnnotation) {
            // Skip array literal if there's already a type annotation that would be flagged
            hasTypeAnnotation = true
            break
          }
          if (parent.type === "TSTypeAnnotation") {
            hasTypeAnnotation = true
            break
          }
          parent = parent.parent
        }
        
        if (hasTypeAnnotation) return

        context.report({
          node,
          messageId: "preferListLiteral",
          fix(fixer) {
            const sourceCode = context.getSourceCode()
            const elements = sourceCode.getText(node)
            // Avoid infinite loop by checking if we're already wrapped in List.from
            if (elements.startsWith("List.from(")) {
              return null
            }
            return fixer.replaceText(node, `List.from(${elements})`)
          },
        })
      },
    }
  },
}

export = rule