import rules from "./rules"

// ESLint 9.x Flat Config Plugin
const plugin = {
  rules,
  // Meta information
  meta: {
    name: "eslint-plugin-functype",
    version: "2.0.0",
  },
}

export = plugin
