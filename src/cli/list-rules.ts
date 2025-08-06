#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

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

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const showHelp = args.includes('--help') || args.includes('-h')
  const showUsage = args.includes('--usage') || args.includes('-u')
  
  if (showHelp) {
    console.log(colorize('📋 ESLint Plugin Functype - Rule Lister', 'bright'))
    console.log('\nUsage: pnpm run list-rules [options]')
    console.log('\nOptions:')
    console.log('  --verbose, -v    Show rule options')
    console.log('  --usage, -u      Show usage examples')  
    console.log('  --help, -h       Show this help message')
    console.log('\nThis command lists all rules configured in the functype plugin configurations.')
    return
  }
  
  console.log(colorize('🔧 ESLint Plugin Functype - Supported Rules', 'bright'))
  
  const distPath = path.join(__dirname, '..', '..', 'dist')
  
  if (!fs.existsSync(distPath)) {
    console.error(colorize('❌ Build directory not found. Run `pnpm run build` first.', 'red'))
    process.exit(1)
  }
  
  const configs = [
    {
      name: 'Recommended',
      path: path.join(distPath, 'configs', 'recommended.js')
    },
    {
      name: 'Strict',
      path: path.join(distPath, 'configs', 'strict.js')
    }
  ]
  
  const loadedConfigs: LoadedConfig[] = []
  
  for (const {name, path: configPath} of configs) {
    const config = await loadConfig(configPath)
    if (config) {
      const rules = extractRules(config)
      loadedConfigs.push({name, rules})
      printRules(name, rules)
    }
  }
  
  if (loadedConfigs.length > 0) {
    printSummary(loadedConfigs)
    
    if (showUsage) {
      printUsageInfo()
    }
    
    console.log(colorize('\n💡 Tips:', 'bright'))
    console.log('• Use --verbose to see rule options')
    console.log('• Use --usage to see configuration examples')
    console.log('• Red rules will cause build failures')
    console.log('• Yellow rules are warnings only')
    console.log('• Blue rules are disabled by default')
    
    console.log(colorize('\n🔗 Links:', 'bright'))
    console.log('• Documentation: https://github.com/jordanburke/eslint-plugin-functype')
    console.log('• eslint-plugin-functional: https://github.com/eslint-functional/eslint-plugin-functional')
    console.log('• @typescript-eslint: https://typescript-eslint.io/')
  }
}

// Run the CLI
main().catch(error => {
  console.error(colorize('❌ Unexpected error:', 'red'), error)
  process.exit(1)
})