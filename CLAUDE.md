# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

eslint-plugin-functype is a curated ESLint configuration bundle for functional TypeScript programming. This plugin combines and configures rules from established ESLint plugins rather than creating custom rules.

## Commands

### Build and Development
```bash
# Build with tsup (fast, esbuild-powered)
pnpm run build

# Watch mode for development
pnpm run build:watch

# Lint the codebase
pnpm run lint

# Build and run rule list CLI
pnpm run build && pnpm run list-rules
```

### CLI Tools
```bash
# List all configured rules
pnpm run list-rules

# Show rule options/configuration
pnpm run list-rules:verbose  

# Show usage examples
pnpm run list-rules:usage

# Show help
pnpm run cli:help
```

### Package Management
```bash
# Install dependencies
pnpm install

# Prepare package for publishing
pnpm run prepare
```

## Architecture

### Core Philosophy
This plugin follows **composition over recreation** - it curates and combines existing ESLint rules rather than creating new ones. This approach provides:
- Less maintenance burden
- Better rule quality and edge case handling
- Community-driven improvements

### Package Structure
- **`src/index.ts`**: Main plugin entry point, exports configurations
- **`src/configs/`**: ESLint configuration presets (recommended, strict)
- **`src/cli/`**: Command-line tools for rule inspection
- **`dist/`**: Compiled JavaScript output

### Plugin Design
- **ESLint 9+ Flat Config**: Uses modern flat config format
- **Zero Custom Rules**: Only configures existing community rules
- **Peer Dependencies**: Requires `@typescript-eslint/eslint-plugin`, `eslint-plugin-functional`, etc.
- **Binary**: Provides `functype-list-rules` CLI command

### Rule Sources
The plugin curates rules from:
- **eslint-plugin-functional**: Core functional programming rules
- **@typescript-eslint/eslint-plugin**: TypeScript-specific patterns  
- **ESLint core**: JavaScript immutability basics
- **eslint-plugin-prettier**: Code formatting
- **eslint-plugin-simple-import-sort**: Import organization

### Configuration Tiers
- **`recommended`**: Balanced functional programming (warnings for mutations)
- **`strict`**: Maximum enforcement (errors for all functional violations)

## Key Implementation Details

### Build System
- **tsup**: Fast esbuild-powered bundler for optimal performance
- **CommonJS Output**: Required for ESLint plugin compatibility  
- **Source Maps**: Generated for better debugging experience
- **Declaration Files**: Automatic TypeScript `.d.ts` generation
- **Tree Shaking**: Enabled for smaller bundle sizes
- **Watch Mode**: Available for development (`pnpm run build:watch`)

### Flat Config Format
The plugin exports ESLint 9.x flat config objects with rule definitions only - no plugins or parser configuration (users must provide these).

### CLI Architecture
The `list-rules.ts` CLI tool dynamically loads built configurations and provides formatted rule inspection with:
- Color-coded output by severity
- Grouping by rule source
- Summary statistics
- Usage examples
- Dependency validation

### TypeScript Configuration
- Target: ES2020 with CommonJS modules via tsup
- Strict mode disabled (for ESLint plugin compatibility)
- Declaration files generated automatically
- `noEmit: true` for IDE support (tsup handles compilation)