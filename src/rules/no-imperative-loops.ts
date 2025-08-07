import type { Rule } from "eslint"

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer functional iteration methods over imperative for loops",
      category: "Best Practices",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          allowForIndexAccess: {
            type: "boolean",
            default: false,
          },
          allowWhileLoops: {
            type: "boolean", 
            default: false,
          },
          allowInTests: {
            type: "boolean",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noForLoop: "Prefer functional methods (.map, .filter, .forEach, .reduce) over for loops",
      noForInLoop: "Prefer Object.keys().forEach() or functional methods over for..in loops",
      noForOfLoop: "Prefer .forEach() or .map() over for..of loops", 
      noWhileLoop: "Prefer functional iteration or recursion over while loops",
      noDoWhileLoop: "Prefer functional iteration or recursion over do..while loops",
      suggestFunctional: "Consider: {{suggestion}}",
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const allowForIndexAccess = options.allowForIndexAccess || false
    const allowWhileLoops = options.allowWhileLoops || false
    const allowInTests = options.allowInTests !== false

    function isInTestFile() {
      const filename = context.getFilename()
      return /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(filename) ||
             filename.includes("__tests__") ||
             filename.includes("/test/") ||
             filename.includes("/tests/")
    }

    function needsIndexAccess(node: any): boolean {
      if (!node.body || node.body.type !== "BlockStatement") return false
      
      const sourceCode = context.getSourceCode()
      const bodyText = sourceCode.getText(node.body)
      
      // Look for array index access patterns like arr[i]
      return /\[\s*\w+\s*\]/.test(bodyText) && node.init && 
             node.init.type === "VariableDeclaration"
    }

    function getSuggestionForForLoop(node: any): string {
      if (!node.body) return "functional iteration method"
      
      const sourceCode = context.getSourceCode()
      const bodyText = sourceCode.getText(node.body)
      
      // Simple heuristics for suggestions
      if (bodyText.includes("push")) {
        return "array.map() to transform elements"
      } else if (bodyText.includes("console.log") || bodyText.includes("print")) {
        return "array.forEach() for side effects"
      } else if (bodyText.includes("+=") || bodyText.includes("sum")) {
        return "array.reduce() for accumulation"
      } else if (bodyText.includes("if") && bodyText.includes("push")) {
        return "array.filter().map() for conditional transformation"
      }
      
      return "functional iteration method (.map, .filter, .forEach, .reduce)"
    }

    return {
      ForStatement(node: any) {
        if (allowInTests && isInTestFile()) return
        
        // Allow traditional for loops if they need index access and option is set
        if (allowForIndexAccess && needsIndexAccess(node)) return

        const suggestion = getSuggestionForForLoop(node)
        context.report({
          node,
          messageId: "noForLoop",
        })
      },

      ForInStatement(node: any) {
        if (allowInTests && isInTestFile()) return

        context.report({
          node,
          messageId: "noForInLoop",
        })
      },

      ForOfStatement(node: any) {
        if (allowInTests && isInTestFile()) return

        context.report({
          node,
          messageId: "noForOfLoop",
        })
      },

      WhileStatement(node: any) {
        if (allowWhileLoops) return
        if (allowInTests && isInTestFile()) return

        context.report({
          node,
          messageId: "noWhileLoop",
        })
      },

      DoWhileStatement(node: any) {
        if (allowWhileLoops) return
        if (allowInTests && isInTestFile()) return

        context.report({
          node,
          messageId: "noDoWhileLoop",
        })
      },
    }
  },
}

export = rule