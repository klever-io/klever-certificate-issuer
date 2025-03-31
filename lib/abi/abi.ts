export const contractABI = JSON.stringify({
    types: {
      Audit: {
        type: 'struct',
        fields: [
          {
            name: 'issuance_date',
            type: 'u64'
          },
          {
            name: 'expiration_date',
            type: 'u64'
          },
          {
            name: 'is_valid',
            type: 'bool'
          }
        ]
      }
    }
  })
  
  export const CREATE_CERTIFICATE = 'create_certificate'
  export const PROOF_CERTIFICATE = 'proof_certificate'
  export const REVOKE_CERTIFICATE = 'revoke_certificate'
  export const AUDIT_CERTIFICATE = 'audit_certificate'
  
  export const AuditType = 'Audit'