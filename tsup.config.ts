import { defineConfig } from 'tsup'

export default defineConfig({
  // Entry points
  entry: {
    // Main plugin entry
    'index': 'src/index.ts',
    // Configuration files
    'configs/recommended': 'src/configs/recommended.ts',
    'configs/strict': 'src/configs/strict.ts',
    // CLI binary
    'cli/list-rules': 'src/cli/list-rules.ts',
    // Utility files
    'utils/dependency-validator': 'src/utils/dependency-validator.ts'
  },
  
  // Output format - CommonJS for ESLint plugin compatibility
  format: ['cjs'],
  
  // Generate TypeScript declaration files
  dts: true,
  
  // Generate source maps for better debugging
  sourcemap: true,
  
  // Clean dist directory before build
  clean: true,
  
  // Target Node.js environment
  target: 'node18',
  
  // Note: We'll handle shebang differently since banner functions aren't working
  // The CLI binary will need its shebang added manually or via a separate build step
  
  // External dependencies (don't bundle peer dependencies)
  external: [
    'eslint',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser', 
    'eslint-plugin-functional',
    'eslint-plugin-prettier',
    'eslint-plugin-simple-import-sort',
    'prettier'
  ],
  
  // Ensure proper CommonJS interop
  cjsInterop: false, // Disable to avoid export issues
  
  // Enable tree shaking
  treeshake: true,
  
  // Minify output for smaller bundle size
  minify: false, // Keep disabled for debugging during development
  
  // Split chunks to keep configs separate
  splitting: false
})