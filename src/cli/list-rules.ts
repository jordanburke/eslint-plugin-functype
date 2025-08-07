#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { validatePeerDependencies, type ValidationResult } from '../utils/dependency-validator'

// Types for better type safety
type RuleSeverity = 'off' | 'warn' | 'error' | 0 | 1 | 2
type RuleConfig = RuleSeverity | [RuleSeverity, ...unknown[]]

interface RuleData {
  severity: RuleSeverity
  options: unknown[]
  source: string
}

interface Config {
  rules?: Record<string, RuleConfig>
  extends?: string[]
  plugins?: string[]
}

interface LoadedConfig {
  name: string
  rules: Map<string, RuleData>
}

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

async function loadConfig(configPath: string): Promise<Config | null> {
  try {
    // For built JS files, use require
    if (configPath.endsWith('.js')) {
      const configModule = require(configPath)
      return configModule.default || configModule
    }
    
    // For TS files, we'd need to use dynamic import
    const configModule = await import(configPath)
    return configModule.default || configModule
  } catch (error) {
    console.error(
      colorize(`Error loading config from ${configPath}:`, 'red'), 
      (error as Error).message
    )
    return null
  }
}

function extractRules(config: Config): Map<string, RuleData> {
  const rules = new Map<string, RuleData>()
  
  if (config.rules) {
    Object.entries(config.rules).forEach(([ruleName, ruleConfig]) => {
      const severity = Array.isArray(ruleConfig) ? ruleConfig[0] : ruleConfig
      const options = Array.isArray(ruleConfig) ? ruleConfig.slice(1) : []
      
      rules.set(ruleName, {
        severity,
        options,
        source: getRuleSource(ruleName)
      })
    })
  }
  
  return rules
}

function getRuleSource(ruleName: string): string {
  if (ruleName.startsWith('functype/')) return 'eslint-plugin-functype'
  if (ruleName.startsWith('functional/')) return 'eslint-plugin-functional'
  if (ruleName.startsWith('@typescript-eslint/')) return '@typescript-eslint/eslint-plugin'
  return 'eslint (core)'
}

function getSeverityColor(severity: RuleSeverity): keyof typeof colors {
  switch (severity) {
    case 'error':
    case 2:
      return 'red'
    case 'warn':
    case 1:
      return 'yellow'
    case 'off':
    case 0:
      return 'cyan'
    default:
      return 'reset'
  }
}

function formatSeverity(severity: RuleSeverity): string {
  const severityMap: Record<string, string> = {
    '0': 'off',
    '1': 'warn', 
    '2': 'error',
    'off': 'off',
    'warn': 'warn',
    'error': 'error'
  }
  return severityMap[String(severity)] || String(severity)
}

function printRules(configName: string, rules: Map<string, RuleData>): void {
  console.log(colorize(`\n📋 ${configName} Configuration Rules:`, 'bright'))
  console.log(colorize('='.repeat(50), 'blue'))
  
  // Group rules by source
  const rulesBySource = new Map<string, Map<string, RuleData>>()
  rules.forEach((ruleData, ruleName) => {
    const source = ruleData.source
    if (!rulesBySource.has(source)) {
      rulesBySource.set(source, new Map())
    }
    rulesBySource.get(source)!.set(ruleName, ruleData)
  })
  
  // Print rules grouped by source
  rulesBySource.forEach((sourceRules, source) => {
    console.log(colorize(`\n📦 ${source}:`, 'magenta'))
    
    sourceRules.forEach((ruleData, ruleName) => {
      const shortName = ruleName.replace(/^.*\//, '')
      const severity = formatSeverity(ruleData.severity)
      const severityColored = colorize(`[${severity.toUpperCase()}]`, getSeverityColor(ruleData.severity))
      const hasOptions = ruleData.options && ruleData.options.length > 0
      const optionsText = hasOptions ? colorize(' (with options)', 'cyan') : ''
      
      console.log(`  ${severityColored} ${colorize(shortName, 'green')}${optionsText}`)
      
      if (hasOptions && process.argv.includes('--verbose')) {
        console.log(`    ${colorize('Options:', 'cyan')} ${JSON.stringify(ruleData.options)}`)
      }
    })
  })
}

function printSummary(configs: LoadedConfig[]): void {
  console.log(colorize('\n📊 Summary:', 'bright'))
  console.log(colorize('='.repeat(30), 'blue'))
  
  configs.forEach(({name, rules}) => {
    const totalRules = rules.size
    const errorRules = Array.from(rules.values()).filter(r => 
      r.severity === 'error' || r.severity === 2
    ).length
    const warnRules = Array.from(rules.values()).filter(r => 
      r.severity === 'warn' || r.severity === 1
    ).length
    const offRules = Array.from(rules.values()).filter(r => 
      r.severity === 'off' || r.severity === 0
    ).length
    
    console.log(`\n${colorize(name, 'bright')}: ${totalRules} total rules`)
    console.log(`  ${colorize('●', 'red')} ${errorRules} errors`)
    console.log(`  ${colorize('●', 'yellow')} ${warnRules} warnings`)
    console.log(`  ${colorize('●', 'cyan')} ${offRules} disabled`)
  })
}

function printUsageInfo(): void {
  console.log(colorize('\n💡 Usage Information:', 'bright'))
  console.log(colorize('='.repeat(30), 'blue'))
  console.log('\n📖 How to use these configurations:')
  console.log('\n' + colorize('ESLint 8 (.eslintrc):', 'green'))
  console.log('  extends: ["plugin:functype/recommended"]')
  console.log('\n' + colorize('ESLint 9+ (flat config):', 'green'))
  console.log('  Copy the rules from our documentation into your eslint.config.js')
  console.log('\n' + colorize('Individual rules:', 'green'))
  console.log('  You can enable any rule individually in your rules section')
}

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