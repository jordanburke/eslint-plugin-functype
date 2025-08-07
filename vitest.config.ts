import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/cli/**',
        'dist/**',
      ],
    },
  },
})