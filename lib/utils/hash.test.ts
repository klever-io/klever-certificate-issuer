import { describe, it, expect } from 'vitest'
import { hashKeyValue } from './hash'
import { keccak256 } from 'js-sha3'

describe('hashKeyValue', () => {
  it('should hash a string key-value pair correctly', () => {
    const key = 'key'
    const value = 'value'
    const expected = keccak256(`${key}:${value}`)
    expect(hashKeyValue(key, value)).toBe(expected)
  })

  it('should hash a numeric value correctly', () => {
    const key = 'age'
    const value = 30
    const expected = keccak256(`${key}:${value}`)
    expect(hashKeyValue(key, value)).toBe(expected)
  })

  it('should hash an object value (converted to string)', () => {
    const key = 'data'
    const value = { a: 1, b: 2 }
    const expected = keccak256(`${key}:${value}`)
    expect(hashKeyValue(key, value)).toBe(expected)
  })

  it('should hash with empty key or value', () => {
    const expected1 = keccak256(`:value`)
    expect(hashKeyValue('', 'value')).toBe(expected1)

    const expected2 = keccak256(`key:`)
    expect(hashKeyValue('key', '')).toBe(expected2)
  })

  it('should hash null and undefined values as strings', () => {
    const key = 'nullable'

    const expectedNull = keccak256(`${key}:null`)
    expect(hashKeyValue(key, null)).toBe(expectedNull)

    const expectedUndefined = keccak256(`${key}:undefined`)
    expect(hashKeyValue(key, undefined)).toBe(expectedUndefined)
  })
})