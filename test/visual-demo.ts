// Visual Demo: Before/After transformations with functype ESLint plugin
// This file demonstrates all plugin transformations with real-world examples

// ===========================================
// PREFER-OPTION: Nullable Types → Option<T>
// ===========================================

// Authentication service example
class AuthService {
  // BEFORE: Nullable return types
  getCurrentUser(): User | null {
    return this.validateToken() ? this.loadUserFromToken() : null
  }

  // BEFORE: Optional parameters
  login(email: string, password?: string): LoginResult | undefined {
    return this.authenticate(email, password)
  }

  // BEFORE: Complex nullable object
  getUserPermissions(): { admin: boolean; roles: string[] } | null {
    const user = this.getCurrentUser()
    return user ? { admin: user.isAdmin, roles: user.roles } : null
  }
}

// ===========================================
// PREFER-LIST: Native Arrays → List<T>
// ===========================================

// Data processing service
class DataProcessor {
  // BEFORE: Array type annotations
  private items: string[] = []
  private readonly config: ReadonlyArray<ConfigItem> = []

  // BEFORE: Array parameters and return types
  processData(input: number[]): Array<ProcessedItem> {
    return input.map(this.transform)
  }

  // BEFORE: Array literals in code
  getDefaultValues() {
    const numbers = [1, 2, 3, 4, 5]
    const nested = [
      [1, 2],
      [3, 4],
      [5, 6],
    ]
    return { numbers, nested }
  }
}

// ===========================================
// PREFER-DO-NOTATION: Complex Chains → Do
// ===========================================

// User profile service with nested null checks
class ProfileService {
  // BEFORE: Nested && chains
  getUserDisplayName(userId: string) {
    const user = this.findUser(userId)
    return (user && user.profile && user.profile.display && user.profile.display.name) || "Anonymous"
  }

  // BEFORE: Complex property navigation
  getUserContactInfo(userId: string) {
    const user = this.findUser(userId)
    const contact = user && user.profile && user.profile.contact
    const email = contact && contact.email && contact.email.primary
    const phone = contact && contact.phone && contact.phone.mobile

    return { email, phone }
  }
}

// ===========================================
// NO-IMPERATIVE-LOOPS: Loops → Functional
// ===========================================

class ReportGenerator {
  // BEFORE: For loop for transformation
  generateUserReport(users: User[]) {
    const reports: UserReport[] = []
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      reports.push({
        id: user.id,
        name: user.name.toUpperCase(),
        status: this.calculateStatus(user),
      })
    }
    return reports
  }

  // BEFORE: While loop for accumulation
  calculateTotalScore(scores: number[]): number {
    let total = 0
    let index = 0
    while (index < scores.length) {
      total += scores[index] * this.getMultiplier(index)
      index++
    }
    return total
  }

  // BEFORE: For-of loop with side effects
  notifyAllUsers(users: User[]) {
    for (const user of users) {
      if (user.preferences.emailNotifications) {
        this.emailService.send(user.email, this.generateMessage(user))
      }
    }
  }
}

// ===========================================
// COMPLEX REAL-WORLD EXAMPLE
// ===========================================

// E-commerce order processing with multiple violations
class OrderService {
  // Multiple violations in one method
  async processOrder(orderId: string): Promise<OrderResult | null> {
    // VIOLATION: try/catch (should be Either)
    try {
      // VIOLATION: nullable chain (should be Option with Do notation)
      const order = await this.fetchOrder(orderId)
      const user = order && order.user
      const address = user && user.billing && user.billing.address
      const paymentMethod = user && user.payment && user.payment.default

      if (!address || !paymentMethod) {
        throw new Error("Missing required information")
      }

      // VIOLATION: imperative loop (should be functional)
      const processedItems: ProcessedItem[] = []
      for (const item of order.items) {
        const processed = await this.processItem(item)
        if (processed.isValid) {
          processedItems.push({
            ...processed,
            tax: this.calculateTax(processed.price, address.state),
          })
        }
      }

      // VIOLATION: nested && chains (should be Do notation)
      const shipping =
        address && address.country === "US"
          ? this.calculateDomesticShipping(processedItems)
          : address && address.country && this.calculateInternationalShipping(address.country, processedItems)

      return {
        orderId,
        items: processedItems,
        shipping,
        total: this.calculateTotal(processedItems, shipping),
      }
    } catch (error) {
      console.error("Order processing failed:", error)
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
  isAdmin: boolean
  roles: string[]
  profile?: {
    display?: { name: string }
    contact?: {
      email?: { primary: string }
      phone?: { mobile: string }
    }
  }
  preferences: {
    emailNotifications: boolean
  }
  billing?: {
    address?: Address
  }
  payment?: {
    default?: PaymentMethod
  }
}

interface Address {
  street: string
  city: string
  state: string
  country: string
}

interface PaymentMethod {
  type: "card" | "paypal" | "bank"
  id: string
}

interface OrderResult {
  orderId: string
  items: ProcessedItem[]
  shipping: ShippingInfo
  total: number
}

interface ProcessedItem {
  id: string
  name: string
  price: number
  tax: number
  isValid: boolean
}

interface ShippingInfo {
  method: string
  cost: number
  estimatedDays: number
}

interface ConfigItem {
  key: string
  value: string
}

interface LoginResult {
  token: string
  expiresAt: Date
}

interface UserReport {
  id: string
  name: string
  status: string
}

// Mock methods for compilation
declare class AuthService {
  validateToken(): boolean
  loadUserFromToken(): User
  authenticate(email: string, password?: string): LoginResult | undefined
}

declare class ProfileService {
  findUser(id: string): User | null
}

declare class DataProcessor {
  transform(n: number): ProcessedItem
}

declare class ReportGenerator {
  calculateStatus(user: User): string
  getMultiplier(index: number): number
  emailService: { send(email: string, message: string): void }
  generateMessage(user: User): string
}

declare class OrderService {
  fetchOrder(id: string): Promise<{ user: User; items: any[] }>
  processItem(item: any): Promise<ProcessedItem>
  calculateTax(price: number, state: string): number
  calculateDomesticShipping(items: ProcessedItem[]): ShippingInfo
  calculateInternationalShipping(country: string, items: ProcessedItem[]): ShippingInfo
  calculateTotal(items: ProcessedItem[], shipping: ShippingInfo): number
}
