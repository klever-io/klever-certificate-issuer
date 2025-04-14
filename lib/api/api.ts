import { Account } from '@klever/sdk-node'
import { SmartContractType, InvokeType } from '../constants'
import { PROOF_CERTIFICATE, GET_CERTIFICATE_EVENTS, CHECK_CERTIFICATE } from '../abi'

type NodeContractResponse = {
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

export async function invokeRequest(account: Account, contractAddress: string, callInput : string): Promise<string> {
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

export async function getCertificateIdByHash(apiUrl: string, hash: string): Promise<string> {
  const response = await fetch(`${apiUrl}/transaction/${hash}?withResults=true`)
  const result: TransactionResponse = await response.json()

  return result.data.transaction.logs.events[0].data[0]
}

export async function getCertificationStatus(nodeUrl: string, contractAddress: string, certificateId: string) {
  const response = await fetch(`${nodeUrl}/vm/hex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scAddress: contractAddress,
      funcName: CHECK_CERTIFICATE,
      args: [certificateId]
    })
  })

  const result: NodeContractResponse = await response.json()

  return result.data.data === '01'
}

export async function getProof(nodeUrl: string, contractAddress: string, certificateId: string, inputContract: string, salt: string): Promise<boolean> {
  const response = await fetch(`${nodeUrl}/vm/hex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scAddress: contractAddress,
      funcName: PROOF_CERTIFICATE,
      args: [certificateId, salt, inputContract]
    })
  })

  const result: NodeContractResponse = await response.json()

  return result.data.data === '01'
}

export async function getEventData(nodeUrl: string, contractAddress: string, certificateId: string): Promise<string> {
  const response = await fetch(`${nodeUrl}/vm/hex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scAddress: contractAddress,
      funcName: GET_CERTIFICATE_EVENTS,
      args: [certificateId]
    })
  })

  const result: NodeContractResponse = await response.json()
  return result.data.data
}
