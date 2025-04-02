import { keccak256 } from 'js-sha3'

export function hashKeyValue(key: string, value: any): string {
  const keyValue = `${key}:${value}`
  return keccak256(keyValue)
}
