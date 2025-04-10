export const contractABI = JSON.stringify({
  types: {
    CertificateEvents: {
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
          name: 'revoked_date',
          type: 'u64'
        },
      ]
    }
  }
})

export const CREATE_CERTIFICATE = 'create'
export const CHECK_CERTIFICATE = 'check'
export const PROOF_CERTIFICATE = 'proof'
export const REVOKE_CERTIFICATE = 'revoke'
export const GET_CERTIFICATE_EVENTS = 'get_certificate_events'
export const CHANGE_CERTIFICATE_EXPIRATION_DATE = 'change_expiration_date'

export const CertificateEventsType = 'CertificateEvents'
