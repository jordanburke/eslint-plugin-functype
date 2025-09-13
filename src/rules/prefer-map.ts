import type { Rule } from "eslint"
import type { ASTNode } from "../types/ast"

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer .map() over manual transformations and imperative patterns",
      category: "Best Practices",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          checkArrayMethods: {
            type: "boolean",
            default: true,
          },
          checkForLoops: {
            type: "boolean",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferMapOverLoop: "Prefer .map() over for loop for transforming {{collection}}",
      preferMapOverPush: "Prefer .map() over manual .push() in loop",
      preferMapChain: "Consider using .map() for transformation instead of manual property access",
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const checkArrayMethods = options.checkArrayMethods !== false
    const checkForLoops = options.checkForLoops !== false

    function isTransformationLoop(node: ASTNode): boolean {
      if (!node.body || node.body.type !== "BlockStatement") return false

      const statements = node.body.body
      if (statements.length === 0) return false

      // Look for patterns like: newArray.push(transform(item))
      return statements.some((stmt: ASTNode) => {
        if (stmt.type === "ExpressionStatement" && stmt.expression.type === "CallExpression") {
          const call = stmt.expression
          return call.callee.type === "MemberExpression" && call.callee.property.name === "push"
        }
        return false
      })
    }

    function isSimplePropertyAccess(node: ASTNode): boolean {
      // Check for patterns like: items.forEach(item => console.log(item.name))
      // These could often be: items.map(item => item.name)
      if (
        node.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        node.callee.property.name === "forEach"
      ) {
        const callback = node.arguments[0]
        if (callback && (callback.type === "ArrowFunctionExpression" || callback.type === "FunctionExpression")) {
          const body = callback.body
          // Simple property access in arrow function
          if (body.type === "MemberExpression") {
            return true
          }
        }
      }
      return false
    }

    return {
      ForStatement(node: ASTNode) {
        if (!checkForLoops) return

        if (isTransformationLoop(node)) {
          context.report({
            node,
            messageId: "preferMapOverLoop",
            data: { collection: "array" },
          })
        }
      },

      ForInStatement(node: ASTNode) {
        if (!checkForLoops) return

        if (isTransformationLoop(node)) {
          context.report({
            node,
            messageId: "preferMapOverLoop",
            data: { collection: "object" },
          })
        }
      },

      ForOfStatement(node: ASTNode) {
        if (!checkForLoops) return

        if (isTransformationLoop(node)) {
          context.report({
            node,
            messageId: "preferMapOverLoop",
            data: { collection: "iterable" },
          })
        }
      },

      CallExpression(node: ASTNode) {
        if (!checkArrayMethods) return

        // Check for forEach that could be map
        if (node.callee.type === "MemberExpression" && node.callee.property.name === "forEach") {
          if (isSimplePropertyAccess(node)) {
            context.report({
              node,
              messageId: "preferMapChain",
            })
          }
        }

        // Check for manual push patterns in callbacks
        if (node.callee.type === "MemberExpression" && node.callee.property.name === "push") {
          // Check if we're inside a forEach or similar iteration
          let parent = node.parent
          while (parent) {
            if (
              parent.type === "CallExpression" &&
              parent.callee.type === "MemberExpression" &&
              (parent.callee.property.name === "forEach" || parent.callee.property.name === "for")
            ) {
              context.report({
                node,
                messageId: "preferMapOverPush",
              })
              break
            }
            parent = parent.parent
          }
        }
      },
    }
  },
}

export = rule
