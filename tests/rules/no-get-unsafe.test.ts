import { describe } from "vitest"
import { ruleTester } from "../utils/rule-tester"
import rule from "../../src/rules/no-get-unsafe"

describe("no-get-unsafe", () => {
  ruleTester.run("no-get-unsafe", rule, {
    valid: [
      // Using safe methods
      {
        name: "Using fold() is allowed",
        code: `
          const result = option.fold(
            () => "default",
            (value) => value
          )
        `,
      },
      // Using getOrElse
      {
        name: "Using getOrElse() is allowed",
        code: 'const value = option.getOrElse("default")',
      },
      // Using map
      {
        name: "Using map() is allowed",
        code: "const mapped = option.map(x => x.toUpperCase())",
      },
      // Regular method calls
      {
        name: "Regular method calls are allowed",
        code: "const result = obj.getData()",
      },
      // Non-monadic get calls
      {
        name: "Non-monadic get() calls are allowed",
        code: 'const item = map.get("key")',
      },
    ],
    invalid: [
      // Unsafe get() call on Option
      {
        name: "get() call on Option should be avoided",
        code: "const value = someOption.get()",
        errors: [
          {
            messageId: "noUnsafeGet",
            data: { method: "get" },
          },
        ],
      },
      // Unsafe getOrThrow() call
      {
        name: "getOrThrow() call should be avoided",
        code: "const value = either.getOrThrow()",
        errors: [
          {
            messageId: "noUnsafeGet",
            data: { method: "getOrThrow" },
          },
        ],
      },
      // Unsafe unwrap() call
      {
        name: "unwrap() call should be avoided",
        code: "const value = result.unwrap()",
        errors: [
          {
            messageId: "noUnsafeGet",
            data: { method: "unwrap" },
          },
        ],
      },
      // Unsafe expect() call
      {
        name: "expect() call should be avoided",
        code: 'const value = option.expect("Should have value")',
        errors: [
          {
            messageId: "noUnsafeGet",
            data: { method: "expect" },
          },
        ],
      },
      // Chained method calls
      {
        name: "Chained unsafe calls should be detected",
        code: 'const value = Some("test").map(x => x.toUpperCase()).get()',
        errors: [
          {
            messageId: "noUnsafeGet",
            data: { method: "get" },
          },
        ],
      },
      // Method call in assignment
      {
        name: "Unsafe get in variable assignment",
        code: `
          function processOption(opt: Option<string>) {
            const result = opt.get()
            return result.toUpperCase()
          }
        `,
        errors: [
          {
            messageId: "noUnsafeGet",
            data: { method: "get" },
          },
        ],
      },
      // Multiple unsafe calls
      {
        name: "Multiple unsafe calls should all be flagged",
        code: `
          const value1 = option1.get()
          const value2 = option2.getOrThrow()
          const value3 = result.unwrap()
        `,
        errors: [
          {
            messageId: "noUnsafeGet",
            data: { method: "get" },
          },
          {
            messageId: "noUnsafeGet",
            data: { method: "getOrThrow" },
          },
          {
            messageId: "noUnsafeGet",
            data: { method: "unwrap" },
          },
        ],
      },
    ],
  })
})
