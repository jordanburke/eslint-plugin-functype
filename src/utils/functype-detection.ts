import type { Rule } from "eslint"
import type { ASTNode } from "../types/ast"

/**
 * Utility functions for detecting functype library usage in ESLint rules
 */

/**
 * Check if functype library is imported in the current file
 */
export function hasFunctypeImport(context: Rule.RuleContext): boolean {
  const sourceCode = context.sourceCode
  const program = sourceCode.ast
  
  // Look for import statements that import from 'functype'
  for (const node of program.body) {
    if (node.type === "ImportDeclaration" && 
        node.source.type === "Literal" && 
        node.source.value === "functype") {
      return true
    }
  }
  
  return false
}

/**
 * Get imported functype symbols from the current file
 */
export function getFunctypeImports(context: Rule.RuleContext): Set<string> {
  const imports = new Set<string>()
  const sourceCode = context.sourceCode
  const program = sourceCode.ast
  
  for (const node of program.body) {
    if (node.type === "ImportDeclaration" && 
        node.source.type === "Literal" && 
        node.source.value === "functype") {
      
      // Handle named imports: import { Option, Either } from 'functype'
      if (node.specifiers) {
        for (const spec of node.specifiers) {
          if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier") {
            imports.add(spec.imported.name)
          } else if (spec.type === "ImportDefaultSpecifier") {
            imports.add("default")
          } else if (spec.type === "ImportNamespaceSpecifier") {
            imports.add("*")
          }
        }
      }
    }
  }
  
  return imports
}

/**
 * Check if a type reference is using functype types
 */
export function isFunctypeType(node: ASTNode, functypeImports: Set<string>): boolean {
  if (!node) return false
  
  // Check direct type names
  if (node.type === "TSTypeReference" && node.typeName?.type === "Identifier") {
    const typeName = node.typeName.name
    return functypeImports.has(typeName) || 
           ["Option", "Either", "List", "LazyList", "Task"].includes(typeName)
  }
  
  return false
}

/**
 * Check if a call expression is using functype methods
 */
export function isFunctypeCall(node: ASTNode, functypeImports: Set<string>): boolean {
  if (!node || node.type !== "CallExpression") return false
  
  const callee = node.callee
  
  // Check for static method calls like Option.some(), Either.left(), List.of()
  if (callee.type === "MemberExpression" && 
      callee.object.type === "Identifier") {
    const objectName = callee.object.name
    const methodName = callee.property?.name
    
    // Check if calling methods on imported functype types
    if (functypeImports.has(objectName)) return true
    
    // Check for common functype patterns
    if ((objectName === "Option" && ["some", "none", "of"].includes(methodName)) ||
        (objectName === "Either" && ["left", "right", "of"].includes(methodName)) ||
        (objectName === "List" && ["of", "from", "empty"].includes(methodName))) {
      return true
    }
  }
  
  // Check for method calls on functype instances like someOption.map()
  if (callee.type === "MemberExpression") {
    const methodName = callee.property?.name
    
    // Common functype methods
    if (["map", "flatMap", "filter", "fold", "foldLeft", "foldRight", 
         "getOrElse", "orElse", "isEmpty", "nonEmpty", "isDefined",
         "isSome", "isNone", "isLeft", "isRight", "toArray"].includes(methodName)) {
      return true
    }
  }
  
  return false
}

/**
 * Check if current context is already using functype patterns appropriately
 */
export function isAlreadyUsingFunctype(node: ASTNode, functypeImports: Set<string>): boolean {
  let parent = node.parent
  
  // Walk up the AST to find functype usage
  while (parent) {
    if (isFunctypeCall(parent as ASTNode, functypeImports) || 
        isFunctypeType(parent as ASTNode, functypeImports)) {
      return true
    }
    parent = parent.parent
  }
  
  return false
}

/**
 * Check if a variable or parameter is typed with functype types
 */
export function hasFunctypeTypeAnnotation(node: ASTNode, functypeImports: Set<string>): boolean {
  // Check for type annotation
  if (node.typeAnnotation?.typeAnnotation) {
    return isFunctypeType(node.typeAnnotation.typeAnnotation, functypeImports)
  }
  
  return false
}