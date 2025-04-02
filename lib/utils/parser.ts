const MAX_DEPTH = 3
const MAX_SIZE = 32

import { hashKeyValue } from './hash'
import { CREATE_CERTIFICATE, REVOKE_CERTIFICATE } from '../abi'

export async function flattenJSON(obj: object,
    parentKey = '',
    depth = 0): Promise<object> {
    if (depth >= MAX_DEPTH) {
      return Promise.reject(new Error('Depth limit exceeded'))
    }

    const result: Record<string, any> = {}

    for (const key of Object.keys(obj)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key
      if (typeof (obj as any)[key] === 'object' && (obj as any)[key] !== null) {
        try {
          Object.assign(result,
            await flattenJSON((obj as any)[key], newKey, depth + 1)
          )
        } catch (error) {
          return Promise.reject(error)
        }
      } else {
        result[newKey] = (obj as any)[key]
      }
    }

    if (Object.keys(result).length > MAX_SIZE) {
      return Promise.reject(new Error('Size limit exceeded'))
    }
    return result
}

export async function unflattenJSON(obj:object) {
    const result: Record<string, any> = {}

    for (const key of Object.keys(obj)) {
      const keys = key.split('.')
      let current = result

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = (obj as any)[key]
    }

    return result
}

export async function prepareCreateCertificateData(input: object) {
  let dataVec = []

  for (const [field, value] of Object.entries(input)) {
    const hash = hashKeyValue(field, value)
    dataVec.push(hash)
  }

  dataVec = [`${CREATE_CERTIFICATE}@`, ...dataVec]

  const dataString = dataVec.join('')

  return Buffer.from(dataString).toString('base64')
}

export async function prepareRevokeCertificateData(certificateId: string) {
  const data = [`${REVOKE_CERTIFICATE}@`, certificateId].join('')

  return  Buffer.from(data).toString('base64')
}