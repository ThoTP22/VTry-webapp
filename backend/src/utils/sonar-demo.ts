/**
 * DEMO: Các lỗi mà chỉ SonarQube phát hiện được
 * VS Code built-in sẽ KHÔNG báo lỗi những issues này!
 */

import * as crypto from 'crypto'
import { Request, Response } from 'express'
import dotenv from 'dotenv'
dotenv.config()

//  SONAR ISSUE 1: Hardcoded credentials (Security Vulnerability)
const API_KEY = process.env.API_KEY // SonarQube sẽ báo: "Hardcoded credentials"
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD // SonarQube sẽ báo: "Hardcoded password"

// SONAR ISSUE 2: Weak cryptographic algorithm (Security Vulnerability)
export function weakEncryption(data: string) {
  // MD5 là thuật toán yếu, dễ bị crack
  return crypto.createHash('md5').update(data).digest('hex') // SonarQube sẽ báo: "Weak cryptographic algorithm"
}

//  SONAR ISSUE 3: SQL Injection vulnerability (Critical Security Issue)
export function unsafeQuery(userId: string) {
  // Concatenation trực tiếp vào SQL query
  const query = `SELECT * FROM users WHERE id = ${userId}` // SonarQube sẽ báo: "SQL injection vulnerability"
  return query
}

//  SONAR ISSUE 4: parseInt without radix (Code Quality)
export function parseNumber(value: string) {
  return parseInt(value) // SonarQube sẽ báo: "parseInt should specify radix"
}

//  SONAR ISSUE 5: Cognitive Complexity too high (Code Smell)
export function complexFunction(a: number, b: number, c: number, d: number) {
  // Quá nhiều nested conditions
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        if (d > 0) {
          if (a > b) {
            if (b > c) {
              if (c > d) {
                if (a > 10) {
                  if (b > 5) {
                    return 'Very complex logic' // SonarQube sẽ báo: "Cognitive complexity too high"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return 'Default'
}

//  SONAR ISSUE 6: Insecure random number generation (Security Hotspot)
export function generateToken() {
  return Math.random().toString(36) // SonarQube sẽ báo: "Insecure random number generation"
}

// SONAR ISSUE 7: Too many parameters (Code Smell)
export function functionWithTooManyParams(
  param1: string,
  param2: string,
  param3: string,
  param4: string,
  param5: string,
  param6: string,
  param7: string,
  param8: string // SonarQube sẽ báo: "Too many parameters"
) {
  return `${param1}-${param2}-${param3}-${param4}-${param5}-${param6}-${param7}-${param8}`
}

//  SONAR ISSUE 8: Regular expression DoS vulnerability (Security Vulnerability)
export function vulnerableRegex(input: string) {
  const regex = /^(a+)+$/ // Catastrophic backtracking
  return regex.test(input) // SonarQube sẽ báo: "Regular expression DoS vulnerability"
}

// SONAR ISSUE 9: Unused private method (Code Smell)
class ExampleClass {
  public doSomething() {
    return 'public method'
  }

  private unusedMethod() {
    // SonarQube sẽ báo: "Unused private method"
    return 'never called'
  }
}

//  SONAR ISSUE 10: Insecure cookie configuration (Security Hotspot)
export function setCookie(res: Response) {
  res.cookie('sessionId', '12345', {
    secure: false, // SonarQube sẽ báo: "Cookie should be secure"
    httpOnly: false, // SonarQube sẽ báo: "Cookie should be httpOnly"
    sameSite: 'none' // SonarQube sẽ báo: "Insecure sameSite setting"
  })
}

//  SONAR ISSUE 11: Empty catch block (Code Smell)
export async function silentFail() {
  try {
    throw new Error('Something went wrong')
  } catch (error) {
    // SonarQube sẽ báo: "Empty catch block"
  }
}

//  SONAR ISSUE 12: Magic numbers (Code Smell)
export function calculateDiscount(price: number) {
  if (price > 1000) {
    return price * 0.15 // SonarQube sẽ báo: "Magic number 0.15"
  } else if (price > 500) {
    return price * 0.1 // SonarQube sẽ báo: "Magic number 0.10"
  }
  return price * 0.05 // SonarQube sẽ báo: "Magic number 0.05"
}

//  SONAR ISSUE 13: Function length too long (Code Smell)
export function veryLongFunction() {
  let result = ''

  // Hàm này sẽ có > 50 lines
  result += 'line 1\n'
  result += 'line 2\n'
  result += 'line 3\n'
  result += 'line 4\n'
  result += 'line 5\n'
  result += 'line 6\n'
  result += 'line 7\n'
  result += 'line 8\n'
  result += 'line 9\n'
  result += 'line 10\n'
  result += 'line 11\n'
  result += 'line 12\n'
  result += 'line 13\n'
  result += 'line 14\n'
  result += 'line 15\n'
  result += 'line 16\n'
  result += 'line 17\n'
  result += 'line 18\n'
  result += 'line 19\n'
  result += 'line 20\n'
  result += 'line 21\n'
  result += 'line 22\n'
  result += 'line 23\n'
  result += 'line 24\n'
  result += 'line 25\n'
  result += 'line 26\n'
  result += 'line 27\n'
  result += 'line 28\n'
  result += 'line 29\n'
  result += 'line 30\n'
  result += 'line 31\n'
  result += 'line 32\n'
  result += 'line 33\n'
  result += 'line 34\n'
  result += 'line 35\n'
  result += 'line 36\n'
  result += 'line 37\n'
  result += 'line 38\n'
  result += 'line 39\n'
  result += 'line 40\n'
  result += 'line 41\n'
  result += 'line 42\n'
  result += 'line 43\n'
  result += 'line 44\n'
  result += 'line 45\n'
  result += 'line 46\n'
  result += 'line 47\n'
  result += 'line 48\n'
  result += 'line 49\n'
  result += 'line 50\n'
  result += 'line 51\n' // SonarQube sẽ báo: "Function too long"

  return result
}

//  SONAR ISSUE 14: Duplicate string literals (Code Smell)
export function duplicateStrings() {
  const user1 = 'john@example.com' // SonarQube sẽ báo: "Duplicate string literal"
  const user2 = 'john@example.com' // Same string repeated
  const user3 = 'john@example.com' // Should use constants

  return [user1, user2, user3]
}

//  SONAR ISSUE 15: Suspicious comment (Code Smell)
export function suspiciousCode() {
  // TODO: Fix this security issue later  // SonarQube sẽ báo: "Suspicious comment"
  // HACK: Temporary workaround          // SonarQube sẽ báo: "Suspicious comment"
  // FIXME: This might cause problems    // SonarQube sẽ báo: "Suspicious comment"

  return 'Code with suspicious comments'
}
