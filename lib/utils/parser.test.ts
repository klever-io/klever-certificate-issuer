import { describe, it, expect } from 'vitest'
import { flattenJSON, unflattenJSON } from './parser'

describe('flattenJSON', () => {
  it('should flatten a simple object', async () => {
    const input = { a: 1, b: 2 }
    const output = await flattenJSON(input)
    expect(output).toEqual({ a: 1, b: 2 })
  })

  it('should flatten a nested object', async () => {
    const input = { a: { b: { c: 3 } } }
    const output = await flattenJSON(input)
    expect(output).toEqual({ 'a.b.c': 3 })
  })

  it('should flatten up to MAX_DEPTH and throw if exceeded', async () => {
    const input = { a: { b: { c: { d: 4 } } } }
    await expect(flattenJSON(input)).rejects.toThrow('Depth limit exceeded')
  })

  it('should flatten up to MAX_SIZE and throw if exceeded', async () => {
    const input = { 
       arr1: [1,2,3,4,5,6,7,8,9,10],
       arr2: [1,2,3,4,5,6,7,8,9,10],
       arr3: [1,2,3,4,5,6,7,8,9,10],
       arr4: [1,2,3,4,5,6,7,8,9,10],
      }

    await expect(flattenJSON(input)).rejects.toThrow('Size limit exceeded')
  })

  it('should handle null and primitive values correctly', async () => {
    const input = { a: null, b: 1, c: 'test', d: false }
    const output = await flattenJSON(input)
    expect(output).toEqual({ a: null, b: 1, c: 'test', d: false })
  })

  it('should flatten arrays as objects', async () => {
    const input = { arr: [1, 2, { x: 3 }] }
    const output = await flattenJSON(input)
    expect(output).toEqual({
      'arr.0': 1,
      'arr.1': 2,
      'arr.2.x': 3,
    })
  })

  it('should flatten multiple arrays as objects', async () => {
    const input = { arr: [1, 2, { x: 3 }] , arr2 : [4] }
    const output = await flattenJSON(input)
    expect(output).toEqual({
      'arr.0': 1,
      'arr.1': 2,
      'arr.2.x': 3,
      'arr2.0': 4,
    })
  })

  it('should return an empty object when input is empty', async () => {
    const input = {}
    const output = await flattenJSON(input)
    expect(output).toEqual({})
  })

    it('should flatten a simple object', async () => {
    const input = { a: 1, b: 2 }
    const output = await flattenJSON(input)
    expect(output).toEqual({ a: 1, b: 2 })
  })
})


describe('unflattenJSON', () => {
  it('should unflatten a simple flat object', async () => {
    const input = { a: 1, b: 2 }
    const output = await unflattenJSON(input)
    expect(output).toEqual({ a: 1, b: 2 })
  })

  it('should unflatten a nested flat object', async () => {
    const input = { 'a.b.c': 3 }
    const output = await unflattenJSON(input)
    expect(output).toEqual({ a: { b: { c: 3 } } })
  })

  it('should unflatten multiple nested keys', async () => {
    const input = {
      'user.name': 'Alice',
      'user.age': 30,
      'user.address.city': 'Wonderland'
    }
    const output = await unflattenJSON(input)
    expect(output).toEqual({
      user: {
        name: 'Alice',
        age: 30,
        address: {
          city: 'Wonderland'
        }
      }
    })
  })

  it('should handle numeric keys (array-like structure)', async () => {
    const input = {
      'arr.0': 1,
      'arr.1': 2,
      'arr.2.x': 3
    }
    const output = await unflattenJSON(input)
    expect(output).toEqual({
      arr: {
        0: 1,
        1: 2,
        2: { x: 3 }
      }
    })
  })

  it('should return an empty object when input is empty', async () => {
    const input = {}
    const output = await unflattenJSON(input)
    expect(output).toEqual({})
  })

  it('should handle keys without nesting', async () => {
    const input = { key: 'value' }
    const output = await unflattenJSON(input)
    expect(output).toEqual({ key: 'value' })
  })
})