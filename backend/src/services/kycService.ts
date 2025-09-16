/**
 * KYC/AML Service Integration
 * Supports Sumsub, Onfido, and domestic compliance providers
 * @author RedMagicVer7
 */

import axios, { AxiosResponse } from 'axios'
import crypto from 'crypto'
import FormData from 'form-data'

// KYC Provider Types
export type KYCProvider = 'sumsub' | 'onfido' | 'domestic'

// KYC Document Types
export type DocumentType = 'passport' | 'id_card' | 'driving_license' | 'utility_bill' | 'bank_statement' | 'selfie'

// KYC Status Types
export type KYCStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired'

// Risk Level Types
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

// Base KYC Request Interface
export interface KYCRequest {
  userId: string
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    address: {
      country: string
      state: string
      city: string
      street: string
      postalCode: string
    }
    phoneNumber: string
    email: string
  }
  documents: {
    type: DocumentType
    file: Buffer
    fileName: string
    mimeType: string
  }[]
}

// KYC Response Interface
export interface KYCResponse {
  applicationId: string
  status: KYCStatus
  riskLevel: RiskLevel
  confidence: number
  reasons?: string[]
  expiresAt?: Date
  documents: {
    type: DocumentType
    status: 'approved' | 'rejected' | 'pending'
    confidence: number
    extractedData?: any
  }[]
  amlCheck: {
    status: 'clear' | 'flagged' | 'pending'
    riskScore: number
    sanctions: boolean
    pep: boolean
    watchlist: boolean
  }
  provider: KYCProvider
  timestamp: Date
}

// Sumsub API Configuration
interface SumsubConfig {
  apiUrl: string
  apiKey: string
  secret: string
  levelName: string
}

// Onfido API Configuration
interface OnfidoConfig {
  apiUrl: string
  apiKey: string
  region: string
}

// Domestic Provider Configuration
interface DomesticConfig {
  apiUrl: string
  apiKey: string
  merchantId: string
}

export class KYCService {
  private providers: Map<KYCProvider, any> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders(): void {
    // Initialize Sumsub
    if (process.env.SUMSUB_API_KEY) {
      this.providers.set('sumsub', {
        apiUrl: process.env.SUMSUB_API_URL || 'https://api.sumsub.com',
        apiKey: process.env.SUMSUB_API_KEY,
        secret: process.env.SUMSUB_SECRET,
        levelName: process.env.SUMSUB_LEVEL_NAME || 'basic-kyc-level'
      })
    }

    // Initialize Onfido
    if (process.env.ONFIDO_API_KEY) {
      this.providers.set('onfido', {
        apiUrl: process.env.ONFIDO_API_URL || 'https://api.onfido.com/v3.6',
        apiKey: process.env.ONFIDO_API_KEY,
        region: process.env.ONFIDO_REGION || 'US'
      })
    }

    // Initialize Domestic Provider (e.g., Chinese KYC service)
    if (process.env.DOMESTIC_KYC_API_KEY) {
      this.providers.set('domestic', {
        apiUrl: process.env.DOMESTIC_KYC_API_URL,
        apiKey: process.env.DOMESTIC_KYC_API_KEY,
        merchantId: process.env.DOMESTIC_KYC_MERCHANT_ID
      })
    }
  }

  // Submit KYC Application
  public async submitKYC(request: KYCRequest, provider: KYCProvider = 'sumsub'): Promise<KYCResponse> {
    try {
      switch (provider) {
        case 'sumsub':
          return await this.submitSumsubKYC(request)
        case 'onfido':
          return await this.submitOnfidoKYC(request)
        case 'domestic':
          return await this.submitDomesticKYC(request)
        default:
          throw new Error(`Unsupported KYC provider: ${provider}`)
      }
    } catch (error) {
      console.error(`KYC submission failed for provider ${provider}:`, error)
      throw error
    }
  }

  // Sumsub KYC Implementation
  private async submitSumsubKYC(request: KYCRequest): Promise<KYCResponse> {
    const config = this.providers.get('sumsub') as SumsubConfig
    if (!config) {
      throw new Error('Sumsub configuration not found')
    }

    // Step 1: Create applicant
    const applicantData = {
      externalUserId: request.userId,
      info: {
        firstName: request.personalInfo.firstName,
        lastName: request.personalInfo.lastName,
        dob: request.personalInfo.dateOfBirth,
        country: request.personalInfo.address.country,
        phone: request.personalInfo.phoneNumber,
        email: request.personalInfo.email
      }
    }

    const applicantResponse = await this.sumsubRequest('POST', '/resources/applicants', applicantData, config)
    const applicantId = applicantResponse.data.id

    // Step 2: Upload documents
    const documentPromises = request.documents.map(async (doc) => {
      const formData = new FormData()
      formData.append('content', doc.file, {
        filename: doc.fileName,
        contentType: doc.mimeType
      })

      return await this.sumsubRequest(
        'POST',
        `/resources/applicants/${applicantId}/info/idDoc`,
        formData,
        config,
        { headers: formData.getHeaders() }
      )
    })

    await Promise.all(documentPromises)

    // Step 3: Set applicant status to pending
    await this.sumsubRequest('POST', `/resources/applicants/${applicantId}/status/pending`, {}, config)

    // Step 4: Get applicant status and risk assessment
    const statusResponse = await this.sumsubRequest('GET', `/resources/applicants/${applicantId}/one`, null, config)
    const applicant = statusResponse.data

    return {
      applicationId: applicantId,
      status: this.mapSumsubStatus(applicant.reviewStatus),
      riskLevel: this.mapSumsubRiskLevel(applicant.riskLevel),
      confidence: applicant.reviewResult?.reviewAnswer?.score || 0,
      reasons: applicant.reviewResult?.reviewAnswer?.rejectLabels || [],
      documents: applicant.info?.idDocs?.map((doc: any) => ({
        type: this.mapSumsubDocType(doc.idDocType),
        status: doc.reviewResult?.reviewAnswer?.action === 'GREEN' ? 'approved' : 'pending',
        confidence: doc.reviewResult?.reviewAnswer?.score || 0,
        extractedData: doc.info
      })) || [],
      amlCheck: {
        status: applicant.amlResult?.status === 'GREEN' ? 'clear' : 'flagged',
        riskScore: applicant.amlResult?.score || 0,
        sanctions: applicant.amlResult?.sanctions || false,
        pep: applicant.amlResult?.pep || false,
        watchlist: applicant.amlResult?.watchlist || false
      },
      provider: 'sumsub',
      timestamp: new Date()
    }
  }

  // Onfido KYC Implementation
  private async submitOnfidoKYC(request: KYCRequest): Promise<KYCResponse> {
    const config = this.providers.get('onfido') as OnfidoConfig
    if (!config) {
      throw new Error('Onfido configuration not found')
    }

    // Step 1: Create applicant
    const applicantData = {
      first_name: request.personalInfo.firstName,
      last_name: request.personalInfo.lastName,
      email: request.personalInfo.email,
      phone_number: request.personalInfo.phoneNumber,
      address: {
        country: request.personalInfo.address.country,
        state: request.personalInfo.address.state,
        town: request.personalInfo.address.city,
        street: request.personalInfo.address.street,
        postcode: request.personalInfo.address.postalCode
      }
    }

    const applicantResponse = await axios.post(
      `${config.apiUrl}/applicants`,
      applicantData,
      {
        headers: {
          'Authorization': `Token token=${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const applicantId = applicantResponse.data.id

    // Step 2: Upload documents
    const documentPromises = request.documents.map(async (doc) => {
      const formData = new FormData()
      formData.append('file', doc.file, {
        filename: doc.fileName,
        contentType: doc.mimeType
      })
      formData.append('type', this.mapToOnfidoDocType(doc.type))
      formData.append('applicant_id', applicantId)

      return await axios.post(
        `${config.apiUrl}/documents`,
        formData,
        {
          headers: {
            'Authorization': `Token token=${config.apiKey}`,
            ...formData.getHeaders()
          }
        }
      )
    })

    const uploadedDocs = await Promise.all(documentPromises)

    // Step 3: Create check
    const checkData = {
      applicant_id: applicantId,
      report_names: ['document', 'facial_similarity_photo', 'watchlist_aml']
    }

    const checkResponse = await axios.post(
      `${config.apiUrl}/checks`,
      checkData,
      {
        headers: {
          'Authorization': `Token token=${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const check = checkResponse.data

    return {
      applicationId: check.id,
      status: this.mapOnfidoStatus(check.status),
      riskLevel: this.mapOnfidoRiskLevel(check.result),
      confidence: this.calculateOnfidoConfidence(check.reports),
      documents: uploadedDocs.map((doc, index) => ({
        type: request.documents[index].type,
        status: 'pending',
        confidence: 0
      })),
      amlCheck: {
        status: 'pending',
        riskScore: 0,
        sanctions: false,
        pep: false,
        watchlist: false
      },
      provider: 'onfido',
      timestamp: new Date()
    }
  }

  // Domestic KYC Implementation (Example for Chinese market)
  private async submitDomesticKYC(request: KYCRequest): Promise<KYCResponse> {
    const config = this.providers.get('domestic') as DomesticConfig
    if (!config) {
      throw new Error('Domestic KYC configuration not found')
    }

    // Implementation would depend on specific domestic provider
    // This is a generic example
    const kycData = {
      merchant_id: config.merchantId,
      user_id: request.userId,
      name: `${request.personalInfo.firstName} ${request.personalInfo.lastName}`,
      id_number: '', // Would need to extract from documents
      phone: request.personalInfo.phoneNumber,
      documents: request.documents.map(doc => ({
        type: doc.type,
        content: doc.file.toString('base64')
      }))
    }

    const response = await axios.post(
      `${config.apiUrl}/kyc/submit`,
      kycData,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const result = response.data

    return {
      applicationId: result.application_id,
      status: this.mapDomesticStatus(result.status),
      riskLevel: this.mapDomesticRiskLevel(result.risk_level),
      confidence: result.confidence || 0,
      documents: result.documents?.map((doc: any) => ({
        type: doc.type,
        status: doc.status,
        confidence: doc.confidence || 0
      })) || [],
      amlCheck: {
        status: result.aml_status || 'pending',
        riskScore: result.aml_score || 0,
        sanctions: result.sanctions || false,
        pep: result.pep || false,
        watchlist: result.watchlist || false
      },
      provider: 'domestic',
      timestamp: new Date()
    }
  }

  // Utility methods for Sumsub
  private async sumsubRequest(
    method: string,
    path: string,
    data: any,
    config: SumsubConfig,
    options: any = {}
  ): Promise<AxiosResponse> {
    const timestamp = Math.floor(Date.now() / 1000)
    const body = data ? (data instanceof FormData ? data : JSON.stringify(data)) : ''
    
    const signature = crypto
      .createHmac('sha256', config.secret)
      .update(timestamp + method.toUpperCase() + path + body)
      .digest('hex')

    const headers = {
      'X-App-Token': config.apiKey,
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': timestamp.toString(),
      ...options.headers
    }

    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    return await axios({
      method,
      url: `${config.apiUrl}${path}`,
      data,
      headers
    })
  }

  // Status mapping methods
  private mapSumsubStatus(status: string): KYCStatus {
    const mapping: { [key: string]: KYCStatus } = {
      'pending': 'pending',
      'completed': 'approved',
      'rejected': 'rejected',
      'review': 'in_review'
    }
    return mapping[status] || 'pending'
  }

  private mapOnfidoStatus(status: string): KYCStatus {
    const mapping: { [key: string]: KYCStatus } = {
      'in_progress': 'pending',
      'awaiting_approval': 'in_review',
      'complete': 'approved',
      'withdrawn': 'rejected'
    }
    return mapping[status] || 'pending'
  }

  private mapDomesticStatus(status: string): KYCStatus {
    const mapping: { [key: string]: KYCStatus } = {
      '0': 'pending',
      '1': 'approved',
      '2': 'rejected',
      '3': 'in_review'
    }
    return mapping[status] || 'pending'
  }

  // Risk level mapping methods
  private mapSumsubRiskLevel(level: string): RiskLevel {
    const mapping: { [key: string]: RiskLevel } = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high'
    }
    return mapping[level] || 'medium'
  }

  private mapOnfidoRiskLevel(result: string): RiskLevel {
    const mapping: { [key: string]: RiskLevel } = {
      'clear': 'low',
      'consider': 'medium',
      'unidentified': 'high'
    }
    return mapping[result] || 'medium'
  }

  private mapDomesticRiskLevel(level: number): RiskLevel {
    if (level <= 30) return 'low'
    if (level <= 70) return 'medium'
    return 'high'
  }

  // Document type mapping
  private mapSumsubDocType(type: string): DocumentType {
    const mapping: { [key: string]: DocumentType } = {
      'PASSPORT': 'passport',
      'ID_CARD': 'id_card',
      'DRIVERS': 'driving_license',
      'UTILITY_BILL': 'utility_bill',
      'SELFIE': 'selfie'
    }
    return mapping[type] || 'id_card'
  }

  private mapToOnfidoDocType(type: DocumentType): string {
    const mapping: { [key in DocumentType]: string } = {
      'passport': 'passport',
      'id_card': 'national_identity_card',
      'driving_license': 'driving_licence',
      'utility_bill': 'utility_bill',
      'bank_statement': 'bank_building_society_statement',
      'selfie': 'live_photo'
    }
    return mapping[type] || 'national_identity_card'
  }

  private calculateOnfidoConfidence(reports: any[]): number {
    if (!reports || reports.length === 0) return 0
    
    const scores = reports
      .filter(report => report.properties?.score)
      .map(report => report.properties.score)
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0
  }

  // Get KYC status
  public async getKYCStatus(applicationId: string, provider: KYCProvider): Promise<KYCResponse> {
    const config = this.providers.get(provider)
    if (!config) {
      throw new Error(`Provider ${provider} not configured`)
    }

    switch (provider) {
      case 'sumsub':
        const sumsubResponse = await this.sumsubRequest('GET', `/resources/applicants/${applicationId}/one`, null, config)
        return this.parseSumsubResponse(sumsubResponse.data)
      
      case 'onfido':
        const onfidoResponse = await axios.get(
          `${config.apiUrl}/checks/${applicationId}`,
          {
            headers: {
              'Authorization': `Token token=${config.apiKey}`
            }
          }
        )
        return this.parseOnfidoResponse(onfidoResponse.data)
      
      case 'domestic':
        const domesticResponse = await axios.get(
          `${config.apiUrl}/kyc/status/${applicationId}`,
          {
            headers: {
              'Authorization': `Bearer ${config.apiKey}`
            }
          }
        )
        return this.parseDomesticResponse(domesticResponse.data)
      
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  // Response parsing methods (implementation details would go here)
  private parseSumsubResponse(data: any): KYCResponse {
    // Implementation would parse Sumsub response format
    return {} as KYCResponse
  }

  private parseOnfidoResponse(data: any): KYCResponse {
    // Implementation would parse Onfido response format
    return {} as KYCResponse
  }

  private parseDomesticResponse(data: any): KYCResponse {
    // Implementation would parse domestic provider response format
    return {} as KYCResponse
  }
}

export default KYCService