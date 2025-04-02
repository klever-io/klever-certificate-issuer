import { Account } from '@klever/sdk-node'
import { SmartContractType, InvokeType } from '../constants'
import { PROOF_CERTIFICATE, AUDIT_CERTIFICATE, REVOKE_CERTIFICATE } from '../abi'

type ProofCertificateResponse = {
  data: {
    data: string;
  }
}

interface TransactionResponse {
  data: {
    transaction: {
      logs: {
        events: {
          address: string;
          identifier: string;
          topics: string[];
          data: string[];
          order: number;
        }[];
      };
    };
  };
  error: string;
  code: string;
};

export async function createCertificateRequest(account: Account, contractAddress: string, callInput : string) {
  await account.sync()

  const unsignedTx = await account.buildTransaction([
    {
      payload: {
        scType: InvokeType,
        address: contractAddress,
      },
      type: SmartContractType,
    }
  ],
  [callInput],
  {
    nonce: account.getNonce(),
  })

  const signedTx = await account.signTransaction(unsignedTx)
  const broadcastedTx = await account.broadcastTransactions([signedTx])

  return broadcastedTx.data.txsHashes[0]
}

export async function revokeCertificateRequest(account: Account, contractAddress: string, callInput : string): Promise<string> {
  await account.sync()

  const unsignedTx = await account.buildTransaction([
    {
      payload: {
        scType: InvokeType,
        address: contractAddress,
      },
      type: SmartContractType,
    }
  ],
  [callInput],
  {
    nonce: account.getNonce(),
  })

  const signedTx = await account.signTransaction(unsignedTx)

  const broadcastRes = await account.broadcastTransactions([signedTx])

  return broadcastRes.data.txsHashes[0]
}

export async function getCertificateIdByHash(apiUrl: string, hash: string): Promise<string> {
  const response = await fetch(`${apiUrl}/transaction/${hash}?withResults=true`)
  const result: TransactionResponse = await response.json()

  return result.data.transaction.logs.events[0].data[0]
}

export async function getProof(nodeUrl: string, contractAddress: string, certificateId: string, inputContract: string): Promise<boolean> {
  const response = await fetch(`${nodeUrl}/vm/hex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scAddress: contractAddress,
      funcName: PROOF_CERTIFICATE,
      args: [certificateId, inputContract]
    })
  })

  const result: ProofCertificateResponse = await response.json()

  return result.data.data === '01'
}

export async function getEventData(nodeUrl: string, contractAddress: string, certificateId: string): Promise<string> {
  const response = await fetch(`${nodeUrl}/vm/hex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scAddress: contractAddress,
      funcName: AUDIT_CERTIFICATE,
      args: [certificateId]
    })
  })

  const result: ProofCertificateResponse = await response.json()
  return result.data.data
}
