import { describe, it, expect } from 'vitest'

describe('Basic Test', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2)
  })
  
  it('should test basic arithmetic', () => {
    expect(5 * 3).toBe(15)
    expect(10 / 2).toBe(5)
  })
})
