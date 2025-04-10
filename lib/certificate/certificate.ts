import { abiDecoder, Account, IProvider, utils } from '@klever/sdk-node'
import { TimeBetweenRetries, Retries } from '../constants'
import {
  invokeRequest,
  getCertificateIdByHash,
  getProof,
  getEventData,
  getCertificationStatus
} from '../api'
import {
  flattenJSON,
  hashKeyValue,
  prepareCreateCertificateData,
  prepareRevokeCertificateData,
  prepareChangeExpirationDateData,
  retry
} from '../utils'
import { contractABI, CertificateEventsType } from '../abi'

export type InputCreateCertificate = {
  [key:string]: string | number | boolean | object;
}

export type EventsResponse = {
  issuanceDate: number;
  expirationDate: number;
  revokedDate: number;
}
export class Certificate {
  private account: Account
  private nodeApi: string
  private proxyApi: string
  private salt: string

  constructor(private contractAddress: string,
    provider: IProvider,
    privateKey: string, salt: string) {
    this.account = new Account(privateKey, false)
    this.contractAddress = contractAddress
    this.nodeApi = provider.node
    this.proxyApi = provider.api
    this.salt = salt
    privateKey = ''

    utils.setProviders(provider)
  }

  async create(inputs: InputCreateCertificate, expirationDate: number = 0) : Promise<string> {
    // Flatten given input
    const flattenData = await flattenJSON(inputs)

    // Convert flatten data to create certificate partern
    const callInput = await prepareCreateCertificateData(flattenData, expirationDate, this.salt)

    // Prepare and Broadcast TX
    return await invokeRequest(this.account, this.contractAddress, callInput)
  }

  async check(certificateId: string) : Promise<boolean> {
    return await getCertificationStatus(this.nodeApi, this.contractAddress, certificateId)
  }

  async proof(certificateId: string, key: string, value: string) : Promise<boolean> {
    // Hash the key and value
    const inputContract = hashKeyValue(key, value)

    // Check proof in Certificate contract
    return await getProof(this.nodeApi, this.contractAddress, certificateId, inputContract)
  }

  async revoke(certificateId: string) : Promise<string> {
    const callInput = await prepareRevokeCertificateData(certificateId)

    return await invokeRequest(this.account, this.contractAddress, callInput)
  }

  async changeExpirationDate(certificateId: string, expirationDate: number) : Promise<string> {
    const callInput = await prepareChangeExpirationDateData(certificateId, expirationDate)

    return await invokeRequest(this.account, this.contractAddress, callInput)
  }

  async getCertificateIdByHash(hash: string) : Promise<string> {
    return await retry(
      async () => getCertificateIdByHash(this.proxyApi, hash),
      Retries,
      TimeBetweenRetries
    )
  }

  async getEvents(certificateId: string) : Promise<EventsResponse> {
    // Get events from Certificate contract
    const eventsHex = await getEventData(this.nodeApi, this.contractAddress, certificateId)

    // Decode events
    const decodedEvents = abiDecoder.decodeStruct(eventsHex, CertificateEventsType, contractABI)

    return {
      issuanceDate: Number(decodedEvents.issuance_date),
      expirationDate: Number(decodedEvents.expiration_date),
      revokedDate: Number(decodedEvents.revoked_date)
    }
  }
}
