#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { validatePeerDependencies, type ValidationResult } from '../utils/dependency-validator'

// Remove unused type
// type RuleSeverity = 'off' | 'warn' | 'error' | 0 | 1 | 2

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
} as const

function colorize(text: string, color: keyof typeof colors): string {
  return colors[color] + text + colors.reset
}


// Removed unused utility functions - they were for the old config-based approach


function printDependencyStatus(result: ValidationResult): void {
  console.log(colorize('\n🔍 Dependency Status Check:', 'bright'))
  console.log(colorize('='.repeat(40), 'blue'))
  
  // Show available dependencies
  if (result.available.length > 0) {
    console.log(colorize('\n✅ Available:', 'green'))
    result.available.forEach(dep => {
      const icon = dep.required ? '🔧' : '🔌'
      console.log(`  ${icon} ${colorize(dep.name, 'green')} - ${dep.description}`)
    })
  }
  
  // Show missing dependencies
  if (result.missing.length > 0) {
    console.log(colorize('\n❌ Missing:', 'red'))
    result.missing.forEach(dep => {
      const icon = dep.required ? '⚠️ ' : '💡'
      const color = dep.required ? 'red' : 'yellow'
      console.log(`  ${icon} ${colorize(dep.name, color)} - ${dep.description}`)
    })
    
    if (result.installCommand) {
      console.log(colorize('\n📦 Install missing dependencies:', 'bright'))
      console.log(`   ${colorize(result.installCommand, 'cyan')}`)
    }
  }
  
  // Show warnings
  if (result.warnings.length > 0) {
    console.log(colorize('\n⚠️  Warnings:', 'yellow'))
    result.warnings.forEach(warning => console.log(`   ${warning}`))
  }
  
  // Overall status
  const status = result.isValid ? '✅ Ready to use' : '❌ Configuration will fail'
  const statusColor = result.isValid ? 'green' : 'red'
  console.log(colorize(`\n${status}`, statusColor))
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const showHelp = args.includes('--help') || args.includes('-h')
  const showUsage = args.includes('--usage') || args.includes('-u')
  const checkDeps = args.includes('--check-deps') || args.includes('--check')
  
  if (showHelp) {
    console.log(colorize('📋 ESLint Plugin Functype - Custom Rules', 'bright'))
    console.log('\nUsage: pnpm run list-rules [options]')
    console.log('\nOptions:')
    console.log('  --verbose, -v      Show rule descriptions and schemas')
    console.log('  --usage, -u        Show usage examples')
    console.log('  --check-deps       Check peer dependency status')  
    console.log('  --help, -h         Show this help message')
    console.log('\nThis command lists all custom rules provided by the functype plugin.')
    return
  }
  
  // Handle dependency check
  if (checkDeps) {
    console.log(colorize('🔧 ESLint Plugin Functype - Dependency Check', 'bright'))
    const result = validatePeerDependencies()
    printDependencyStatus(result)
    
    if (!result.isValid) {
      process.exit(1)
    }
    return
  }
  
  console.log(colorize('🔧 ESLint Plugin Functype - Custom Rules', 'bright'))
  
  const distPath = path.join(__dirname, '..', '..', 'dist')
  
  if (!fs.existsSync(distPath)) {
    console.error(colorize('❌ Build directory not found. Run `pnpm run build` first.', 'red'))
    process.exit(1)
  }
  
  // Load the plugin to get available rules
  try {
    const pluginPath = path.join(distPath, 'index.js')
    const plugin = require(pluginPath)
    
    if (!plugin.rules) {
      console.error(colorize('❌ No rules found in plugin.', 'red'))
      process.exit(1)
    }
    
    console.log(colorize('\n📦 Available Custom Rules:', 'bright'))
    console.log(colorize('='.repeat(40), 'blue'))
    
    const rules = Object.keys(plugin.rules)
    
    rules.forEach(ruleName => {
      const rule = plugin.rules[ruleName]
      const fullName = `functype/${ruleName}`
      
      console.log(`\n${colorize('●', 'green')} ${colorize(fullName, 'bright')}`)
      
      if (rule.meta?.docs?.description) {
        console.log(`  ${colorize('Description:', 'cyan')} ${rule.meta.docs.description}`)
      }
      
      if (rule.meta?.type) {
        const typeColor = rule.meta.type === 'problem' ? 'red' : 
                         rule.meta.type === 'suggestion' ? 'yellow' : 'blue'
        console.log(`  ${colorize('Type:', 'cyan')} ${colorize(rule.meta.type, typeColor)}`)
      }
      
      if (rule.meta?.fixable) {
        console.log(`  ${colorize('Fixable:', 'cyan')} ${colorize('Yes', 'green')}`)
      }
      
      if (showUsage) {
        console.log(`  ${colorize('Usage:', 'cyan')} "${fullName}": "error"`)
      }
    })
    
    console.log(colorize(`\n📊 Summary: ${rules.length} custom rules available`, 'bright'))
    
    if (showUsage) {
      printCustomUsageInfo()
    }
    
    console.log(colorize('\n💡 Tips:', 'bright'))
    console.log('• Use --verbose to see detailed rule information')
    console.log('• Use --usage to see configuration examples')
    console.log('• All rules are prefixed with "functype/"')
    console.log('• Consider using eslint-config-functype for pre-configured setup')
    
    console.log(colorize('\n🔗 Links:', 'bright'))
    console.log('• Documentation: https://github.com/jordanburke/eslint-plugin-functype')
    console.log('• Configuration Bundle: https://github.com/jordanburke/eslint-config-functype')
    console.log('• Functype Library: https://github.com/jordanburke/functype')
    
  } catch (error) {
    console.error(colorize('❌ Error loading plugin:', 'red'), (error as Error).message)
    process.exit(1)
  }
}

function printCustomUsageInfo(): void {
  console.log(colorize('\n💡 Usage Examples:', 'bright'))
  console.log(colorize('='.repeat(30), 'blue'))
  console.log('\n' + colorize('ESLint 9+ (flat config):', 'green'))
  console.log('  import functypePlugin from "eslint-plugin-functype"')
  console.log('  export default [')
  console.log('    {')
  console.log('      plugins: { functype: functypePlugin },')
  console.log('      rules: {')
  console.log('        "functype/prefer-option": "error",')
  console.log('        "functype/prefer-either": "error",')
  console.log('        "functype/no-get-unsafe": "error",')
  console.log('      }')
  console.log('    }')
  console.log('  ]')
  console.log('\n' + colorize('With eslint-config-functype (recommended):', 'green'))
  console.log('  import functypeConfig from "eslint-config-functype"')
  console.log('  export default [functypeConfig.recommended]')
}

// Run the CLI
main().catch(error => {
  console.error(colorize('❌ Unexpected error:', 'red'), error)
  process.exit(1)
})