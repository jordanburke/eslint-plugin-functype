// Demo file showcasing patterns that eslint-plugin-functype should catch and fix
// This file intentionally contains violations to demonstrate the plugin's capabilities

// ===========================================
// PREFER-OPTION VIOLATIONS
// ===========================================

// Nullable user lookup
function findUser(id: string): User | null {
  return users.find((u) => u.id === id) || null
}

// Optional configuration
const config: AppConfig | undefined = getConfig()

// Function parameter with optional value
function processName(name: string | null | undefined): string {
  return name?.toUpperCase() || "UNKNOWN"
}

// Complex object with null
const currentUser: { name: string; age: number } | null = getCurrentUser()

// ===========================================
// PREFER-LIST VIOLATIONS
// ===========================================

// Native array declarations
const userIds: string[] = ["user1", "user2", "user3"]
const scores: Array<number> = [85, 92, 78, 96]
const items: ReadonlyArray<string> = ["apple", "banana", "orange"]

// Array literals
const colors = ["red", "green", "blue"]
const matrix = [
  [1, 2],
  [3, 4],
  [5, 6],
]

// Function with array parameters and returns
function processItems(items: string[]): number[] {
  return items.map((item) => item.length)
}

// ===========================================
// PREFER-EITHER VIOLATIONS
// ===========================================

// Try/catch for JSON parsing
function parseJsonData(jsonString: string) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error("Parse error:", error)
    return null
  }
}

// Function that throws errors
function validateAge(age: number): number {
  if (age < 0) {
    throw new Error("Age cannot be negative")
  }
  if (age > 150) {
    throw new Error("Age seems unrealistic")
  }
  return age
}

// Division function with error throwing
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero")
  }
  return a / b
}

// ===========================================
// NO-IMPERATIVE-LOOPS VIOLATIONS
// ===========================================

// Basic for loop for printing
function printItems(items: string[]): void {
  for (let i = 0; i < items.length; i++) {
    console.log(`Item ${i}: ${items[i]}`)
  }
}

// For-of loop for processing
function processUsers(users: User[]): void {
  for (const user of users) {
    console.log(`Processing user: ${user.name}`)
  }
}

// While loop for accumulation
function sumArray(numbers: number[]): number {
  let sum = 0
  let i = 0
  while (i < numbers.length) {
    sum += numbers[i]
    i++
  }
  return sum
}

// For loop for transformation (should use map)
function transformData(items: string[]): string[] {
  const results: string[] = []
  for (let i = 0; i < items.length; i++) {
    results.push(items[i].toUpperCase())
  }
  return results
}

// Nested loops for matrix operations
function printMatrix(matrix: number[][]): void {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      console.log(`[${i}][${j}] = ${matrix[i][j]}`)
    }
  }
}

// ===========================================
// COMPLEX REAL-WORLD EXAMPLE
// ===========================================

// User service with multiple violations
class UserService {
  private users: User[] = []

  // Returns nullable user (should be Option<User>)
  findById(id: string): User | null {
    for (let i = 0; i < this.users.length; i++) {
      // Imperative loop
      if (this.users[i].id === id) {
        return this.users[i]
      }
    }
    return null
  }

  // Throws exceptions (should return Either)
  createUser(data: CreateUserData): User {
    if (!data.email) {
      throw new Error("Email is required")
    }
    if (!data.name) {
      throw new Error("Name is required")
    }

    const user: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
      age: data.age || null, // Nullable age
    }

    this.users.push(user)
    return user
  }

  // Uses try/catch and imperative loops
  validateAndProcessUsers(): ProcessedUser[] | null {
    try {
      const results: ProcessedUser[] = []
      for (const user of this.users) {
        // Imperative loop
        if (user.age && user.age < 18) {
          throw new Error(`User ${user.name} is too young`)
        }
        results.push({
          id: user.id,
          displayName: user.name.toUpperCase(),
          isAdult: user.age ? user.age >= 18 : false,
        })
      }
      return results
    } catch (error) {
      console.error("Validation failed:", error)
      return null
    }
  }
}

// ===========================================
// TYPE DEFINITIONS (for context)
// ===========================================

interface User {
  id: string
  name: string
  email: string
  age: number | null // This should also be Option<number>
}

interface CreateUserData {
  name?: string
  email?: string
  age?: number
}

interface ProcessedUser {
  id: string
  displayName: string
  isAdult: boolean
}

interface AppConfig {
  apiUrl: string
  timeout: number
}

// Mock functions for context
declare const users: User[]
declare function getConfig(): AppConfig | undefined
declare function getCurrentUser(): { name: string; age: number } | null
declare function generateId(): string
