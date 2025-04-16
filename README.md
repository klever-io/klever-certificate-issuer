## Certification Issuer

This package provides an easy and fast way to interact with the Certification Smart Contract.

### Installation

```bash
npm install @klever/certificate-issuer
```

or

```bash
yarn add @klever/certificate-issuer
```

<br/>

# Basic Usage

To use the contract functions, you need to instantiate a Certificate object. You can do this by calling:

```ts
import { Certificate, IProvider } from '@klever/certificate-issuer'

const provider: IProvider = {
  api: 'https://api.testnet.klever.org',
  node: 'https://node.testnet.klever.org',
}

(...)

const certificate = new Certificate(contractAddress, provider, privateKey, salt)
```

### Initialization Parameters

- `contractAddress`:  
  The smart contract address on the blockchain. It is the unique identifier of the contract that will be used in the operations.

- `provider`:  
  Object responsible for defining which network the application will interact with. Example networks:  
  - `mainnet` (production network)  
  - `testnet` (test network)  
  - `localnet` (local development network)

- `privateKey`:  
  The private key of the contract owner. This key must be the same one used to deploy the contract on the blockchain. It is required to sign and authorize transactions.

- `salt`:  
  Optional value used to enhance encryption security. It serves as an extra piece of data (random or defined) that makes brute force attacks or data predictability more difficult.

## Methods

### `create(inputs: object, expirationDate?: number): Promise<string>`

Creates a new certificate based on the provided data.

- `inputs`: Object containing the certificate data (for example, name, course, date, etc).
- `expirationDate`: (Optional) Certificate expiration timestamp. Default is `0` (no expiration).
- **Returns**: The transaction hash of the certificate creation.

About the inputs, any object is accepted as long as after being flattened it results in 32 fields. For example:

```json
{
  "student": {
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "wallet": "klever123xyz"
  },
  "course": {
    "title": "Full Stack Web Development",
    "description": "A complete program covering frontend and backend development.",
    "duration_hours": 120,
    "language": "English",
    "modules": [
      "HTML & CSS",
      "JavaScript",
      "Node.js & Express",
      "Databases"
    ]
  },
  "certificate": {
    "id": "CERT-2025-001",
    "issue_date": "2025-04-15",
    "expiration_date": "2028-04-15",
    "issuer": {
      "name": "Klever Academy",
      "website": "https://academy.klever.org"
    }
  }
}
```

The input will be converted inside the create method to:

```ts
{
  "student.name": "Alice Johnson",
  "student.email": "alice.johnson@example.com",
  "student.wallet": "klever123xyz",
  "course.title": "Full Stack Web Development",
  "course.description": "A complete program covering frontend and backend development.",
  "course.duration_hours": 120,
  "course.language": "English",
  "course.modules.0": "HTML & CSS",
  "course.modules.1": "JavaScript",
  "course.modules.2": "Node.js & Express",
  "course.modules.3": "Databases",
  "certificate.id": "CERT-2025-001",
  "certificate.issue_date": "2025-04-15",
  "certificate.expiration_date": "2028-04-15",
  "certificate.issuer.name": "Klever Academy",
  "certificate.issuer.website": "https://academy.klever.org"
}
```

> ⚠️ **Important Note:**  
> The smart contract **does not automatically handle certificate expiration**. It is the responsibility of the application integrating this package to validate the `expirationDate` field externally, ensuring that expired certificates are treated accordingly in the final solution. you can check the timestamps (issue, revoke and expirationDate) by calling getEvents method

---

### `check(certificateId: string): Promise<boolean>`

Checks if a certificate is active on the blockchain.

- `certificateId`: ID of the certificate to be checked.
- **Returns**: `true` if the certificate is valid, `false` otherwise.

---

### `proof(certificateId: string, key: string, value: string): Promise<boolean>`

Validates whether a specific `key/value` pair exists and matches within the certificate.

- `certificateId`: The ID of the certificate.
- `key`: The flattened key corresponding to a field in the certificate.  
  **Important**: The key must exactly match the flattened structure used when creating the certificate. For example, to validate a course module, you must use its precise flattened path like `"course.modules.2"`.
- `value`: The expected value associated with the key.
- **Returns**: `true` if the key/value pair is valid and found in the certificate, `false` otherwise.

#### Example

If you want to verify the third module of the course from the certificate created in the `create` example, you must use the exact key:

```json
{
  "course.modules.2": "Node.js & Express"
}
```

Using incorrect or unflattened keys such as `course.modules` or `modules[2]` will result in a failed validation.

---

### `revoke(certificateId: string): Promise<string>`

Revokes a certificate on the blockchain.

- `certificateId`: ID of the certificate to be revoked.
- **Returns**: The transaction hash of the revocation.

---

### `changeExpirationDate(certificateId: string, expirationDate: number): Promise<string>`

Changes the expiration date of a certificate.

- `certificateId`: ID of the certificate.
- `expirationDate`: New expiration date (timestamp).
- **Returns**: The transaction hash of the update.

---

### `getCertificateIdByHash(hash: string): Promise<string>`

Retrieves the original `certificateId` from its hash.

- `hash`: Corresponding hash of the certificate.
- **Returns**: The certificate ID linked to the hash.

---

### `getEvents(certificateId: string): Promise<EventsResponse>`

Gets the events associated with a certificate.

- `certificateId`: ID of the certificate.
- **Returns**: An `EventsResponse` object containing:
  - `issuanceDate`: Issuance date.
  - `expirationDate`: Expiration date.
  - `revokedDate`: Revocation date (0 if not revoked).

---

## Used Types

### `EventsResponse`

```ts
interface EventsResponse {
  issuanceDate: number
  expirationDate: number
  revokedDate: number
}
```

