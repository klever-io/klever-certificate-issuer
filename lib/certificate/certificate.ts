import { abiDecoder, Account, IProvider, utils } from '@klever/sdk-node'
import { TimeBetweenRetries, Retries } from '../constants';
import { createCertificateRequest, revokeCertificateRequest, getProof, getEventData } from '../api';
import { flattenJSON, hashKeyValue, prepareCreateCertificateData, prepareRevokeCertificateData, retry } from "../utils";
import { contractABI, AuditType } from '../abi';

export type InputCreateCertificate = {
    [key:string]: string | number | boolean | object;
}

export type EventsResponse = {
    isValid: boolean;
    issuanceDate: number;
    expirationDate: number;
}

export interface TransactionResponse {
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

export type ProofCertificateResponse = {
    data: {
        data: string;
    }
}

export class Certificate {
    private account: Account
    private nodeApi: string
    private proxyApi: string
  
    constructor(private contractAddress: string,
      provider: IProvider,
      privateKey: string) {
      this.account = new Account(privateKey, false)
      this.contractAddress = contractAddress
      this.nodeApi = provider.node
      this.proxyApi = provider.api
      privateKey = ''
  
      utils.setProviders(provider)
    }


    async create(input: InputCreateCertificate) : Promise<string> {
         // Flatten given input
        const flattenData = await flattenJSON(input);

        // Convert flatten data to create certificate partern
        const callInput = await prepareCreateCertificateData(flattenData);

        // Prepare and Broadcast TX
        return await createCertificateRequest(this.account, this.contractAddress, callInput)
    }

    async proof(certificateId: string, key: string, value: string) : Promise<boolean> {
        // Hash the key and value
        const inputContract = hashKeyValue(key, value)

        // Check proof in Certificate contract
        return await getProof(this.nodeApi, this.contractAddress, certificateId, inputContract)
    }

    async revoke(certificateId: string) : Promise<string> {
      const callInput = await prepareRevokeCertificateData(certificateId)

      return await revokeCertificateRequest(this.account, this.contractAddress, callInput)
    }

    async getCertificateIdByTransaction(txHash: string) : Promise<string> {
        // Get certificate ID from transaction
        return await retry(
            async () => {
              const response = await fetch(`${this.proxyApi}/transaction/${txHash}?withResults=true`)
              const result: TransactionResponse = await response.json()
              return result.data.transaction.logs.events[0].data[0]
            },
            Retries,
            TimeBetweenRetries
          )
    }

    async getEvents(certificateId: string) : Promise<EventsResponse> { 
        // Get events from Certificate contract
        const eventsHex = await getEventData(this.nodeApi, this.contractAddress, certificateId)

        // Decode events
        const decodedEvents = abiDecoder.decodeStruct(eventsHex, AuditType, contractABI)

        return {
            isValid: decodedEvents.is_valid,
            issuanceDate: Number(decodedEvents.issuance_date),
            expirationDate: Number(decodedEvents.expiration_date)
        }
    }
}
