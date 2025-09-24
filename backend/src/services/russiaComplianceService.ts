import { EventEmitter } from 'events';

// 俄罗斯KYC等级
export enum RussiaKYCLevel {
  BASIC = 'basic',           // 基础验证
  ENHANCED = 'enhanced',     // 增强验证
  CORPORATE = 'corporate'    // 企业验证
}

// 俄罗斯KYC状态
export enum RussiaKYCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

// 制裁清单类型
export enum SanctionListType {
  OFAC = 'ofac',                    // 美国财政部外国资产控制办公室
  EU_SANCTIONS = 'eu_sanctions',    // 欧盟制裁
  UN_SANCTIONS = 'un_sanctions',    // 联合国制裁
  ROSFINMONITORING = 'rosfinmonitoring', // 俄罗斯金融监管局
  UK_SANCTIONS = 'uk_sanctions',    // 英国制裁
  CANADA_SANCTIONS = 'canada_sanctions' // 加拿大制裁
}

// 俄罗斯身份证件类型
export enum RussiaDocumentType {
  PASSPORT = 'passport',            // 护照
  INTERNAL_PASSPORT = 'internal_passport', // 内政护照
  DRIVER_LICENSE = 'driver_license', // 驾驶证
  SNILS = 'snils',                 // СНИЛС (养老保险号)
  INN = 'inn',                     // ИНН (税号)
  REGISTRATION_CERTIFICATE = 'registration_certificate' // 企业注册证书
}

// 俄罗斯KYC文档
export interface RussiaKYCDocument {
  id: string;
  type: RussiaDocumentType;
  number: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate?: Date;
  fileUrl: string;
  fileHash: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  metadata: {
    ocrData?: any;           // OCR提取的数据
    faceMatch?: number;      // 人脸匹配度 (0-1)
    documentIntegrity?: number; // 文档完整性 (0-1)
  };
}

// 俄罗斯个人信息
export interface RussiaPersonalInfo {
  // 基本信息
  firstName: string;
  lastName: string;
  middleName?: string;      // 父称
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: 'male' | 'female';
  nationality: string;
  
  // 联系信息
  phone: string;
  email: string;
  telegramUsername?: string;
  
  // 地址信息
  registrationAddress: {
    region: string;          // 地区
    city: string;
    street: string;
    building: string;
    apartment?: string;
    postalCode: string;
  };
  actualAddress?: {
    region: string;
    city: string;
    street: string;
    building: string;
    apartment?: string;
    postalCode: string;
  };
  
  // 税务信息
  inn?: string;            // ИНН税号
  snils?: string;          // СНИЛС养老保险号
  
  // 银行信息
  bankAccounts?: Array<{
    bankName: string;
    accountNumber: string;
    bik: string;           // БИК银行识别码
    isVerified: boolean;
  }>;
}

// 俄罗斯企业信息
export interface RussiaCompanyInfo {
  // 基本信息
  fullName: string;        // 全称
  shortName: string;       // 简称
  legalForm: string;       // 法律形式 (ООО, ПАО, ЗАО等)
  
  // 注册信息
  inn: string;             // ИНН
  kpp: string;             // КПП
  ogrn: string;            // ОГРН
  okpo?: string;           // ОКПО
  okved: string[];         // ОКВЭД代码
  
  // 地址信息
  legalAddress: {
    region: string;
    city: string;
    street: string;
    building: string;
    office?: string;
    postalCode: string;
  };
  actualAddress?: {
    region: string;
    city: string;
    street: string;
    building: string;
    office?: string;
    postalCode: string;
  };
  
  // 联系信息
  phone: string;
  email: string;
  website?: string;
  
  // 银行信息
  bankAccounts: Array<{
    bankName: string;
    accountNumber: string;
    correspondentAccount: string;
    bik: string;
  }>;
  
  // 管理信息
  ceo: {
    fullName: string;
    inn: string;
    position: string;
  };
  
  // 注册信息
  registrationDate: Date;
  registrationAuthority: string;
  
  // 股东信息
  shareholders?: Array<{
    name: string;
    inn?: string;
    sharePercentage: number;
    isIndividual: boolean;
  }>;
}

// 制裁检查结果
export interface SanctionCheckResult {
  userId: string;
  checkedAt: Date;
  results: {
    [key in SanctionListType]: {
      isListed: boolean;
      confidence: number;
      matchedEntries?: Array<{
        name: string;
        reason: string;
        listDate: Date;
        additionalInfo?: string;
      }>;
    };
  };
  overallRisk: 'low' | 'medium' | 'high' | 'blocked';
  recommendations: string[];
}

// 俄罗斯KYC记录
export interface RussiaKYCRecord {
  id: string;
  userId: string;
  level: RussiaKYCLevel;
  status: RussiaKYCStatus;
  
  // 个人/企业信息
  personalInfo?: RussiaPersonalInfo;
  companyInfo?: RussiaCompanyInfo;
  
  // 文档
  documents: RussiaKYCDocument[];
  
  // 制裁检查
  sanctionCheck?: SanctionCheckResult;
  
  // 风险评估
  riskAssessment: {
    score: number;           // 风险评分 (0-100)
    level: 'low' | 'medium' | 'high';
    factors: string[];       // 风险因素
    mitigatingFactors: string[]; // 缓解因素
  };
  
  // 时间信息
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  expiryDate?: Date;
  
  // 审核信息
  reviewNotes?: string;
  rejectionReason?: string;
  
  // 监管报告
  regulatoryReports: Array<{
    id: string;
    type: string;
    submittedTo: string;
    submittedAt: Date;
    reportData: any;
  }>;
}

/**
 * 俄罗斯合规服务
 * 处理俄罗斯KYC验证、制裁检查和合规报告
 */
export class RussiaComplianceService extends EventEmitter {
  private kycRecords: Map<string, RussiaKYCRecord> = new Map();
  private sanctionLists: Map<SanctionListType, any[]> = new Map();
  
  // 外部API配置
  private apiConfigs = {
    ofac: {
      url: 'https://sdnsearch.ofac.treas.gov/api/v1/search',
      apiKey: process.env.OFAC_API_KEY
    },
    euSanctions: {
      url: 'https://ec.europa.eu/info/business-economy-euro/banking-finance/international-relations/restrictive-measures-sanctions_en',
      apiKey: process.env.EU_SANCTIONS_API_KEY
    },
    rosfinmonitoring: {
      url: 'http://www.fedsfm.ru/documents/terrorists-catalog-portal-act',
      apiKey: process.env.ROSFINMONITORING_API_KEY
    }
  };

  constructor() {
    super();
    this.loadSanctionLists();
    this.initializeMockData();
  }

  /**
   * 提交俄罗斯KYC申请
   */
  async submitRussiaKYC(
    userId: string,
    level: RussiaKYCLevel,
    personalInfo?: RussiaPersonalInfo,
    companyInfo?: RussiaCompanyInfo
  ): Promise<RussiaKYCRecord> {
    // 基础验证
    if (level === RussiaKYCLevel.CORPORATE && !companyInfo) {
      throw new Error('企业验证需要提供企业信息');
    }

    if ((level === RussiaKYCLevel.BASIC || level === RussiaKYCLevel.ENHANCED) && !personalInfo) {
      throw new Error('个人验证需要提供个人信息');
    }

    const record: RussiaKYCRecord = {
      id: `RU-KYC-${Date.now()}`,
      userId,
      level,
      status: RussiaKYCStatus.PENDING,
      personalInfo,
      companyInfo,
      documents: [],
      riskAssessment: {
        score: 0,
        level: 'low',
        factors: [],
        mitigatingFactors: []
      },
      submittedAt: new Date(),
      regulatoryReports: []
    };

    this.kycRecords.set(record.id, record);
    
    // 自动进行制裁检查
    if (personalInfo || companyInfo) {
      const sanctionCheck = await this.performSanctionCheck(userId, personalInfo, companyInfo);
      record.sanctionCheck = sanctionCheck;
      
      // 根据制裁检查结果更新状态
      if (sanctionCheck.overallRisk === 'blocked') {
        record.status = RussiaKYCStatus.REJECTED;
        record.rejectionReason = '发现制裁名单匹配';
      }
    }

    this.kycRecords.set(record.id, record);
    this.emit('kycSubmitted', record);
    
    return record;
  }

  /**
   * 上传KYC文档
   */
  async uploadKYCDocument(
    kycId: string,
    documentType: RussiaDocumentType,
    file: {
      data: Buffer;
      filename: string;
      mimetype: string;
    },
    documentInfo: {
      number: string;
      issuedBy: string;
      issuedDate: Date;
      expiryDate?: Date;
    }
  ): Promise<RussiaKYCDocument> {
    const record = this.kycRecords.get(kycId);
    if (!record) {
      throw new Error('KYC记录不存在');
    }

    // 计算文件哈希
    const crypto = await import('crypto');
    const fileHash = crypto.createHash('sha256').update(file.data).digest('hex');
    
    // 模拟文件上传和OCR处理
    const fileUrl = `https://storage.tribridge.com/kyc/${kycId}/${documentType}_${Date.now()}.pdf`;
    const ocrData = await this.performOCR(file.data, documentType);
    
    const document: RussiaKYCDocument = {
      id: `DOC-${Date.now()}`,
      type: documentType,
      number: documentInfo.number,
      issuedBy: documentInfo.issuedBy,
      issuedDate: documentInfo.issuedDate,
      expiryDate: documentInfo.expiryDate,
      fileUrl,
      fileHash,
      isVerified: false,
      metadata: {
        ocrData,
        documentIntegrity: this.calculateDocumentIntegrity(ocrData),
        faceMatch: documentType === RussiaDocumentType.PASSPORT ? 
                   await this.performFaceMatch(file.data, record.personalInfo) : undefined
      }
    };

    record.documents.push(document);
    this.kycRecords.set(kycId, record);
    
    // 自动验证某些文档
    if (document.metadata.documentIntegrity && document.metadata.documentIntegrity > 0.9) {
      await this.verifyDocument(document.id, 'auto_system');
    }

    this.emit('documentUploaded', { kycId, document });
    return document;
  }

  /**
   * 验证KYC文档
   */
  async verifyDocument(documentId: string, verifiedBy: string): Promise<RussiaKYCDocument> {
    for (const record of this.kycRecords.values()) {
      const document = record.documents.find(doc => doc.id === documentId);
      if (document) {
        document.isVerified = true;
        document.verifiedAt = new Date();
        document.verifiedBy = verifiedBy;
        
        this.kycRecords.set(record.id, record);
        
        // 检查是否所有必需文档都已验证
        await this.checkKYCCompletion(record.id);
        
        this.emit('documentVerified', { kycId: record.id, document });
        return document;
      }
    }
    
    throw new Error('文档不存在');
  }

  /**
   * 制裁检查
   */
  async performSanctionCheck(
    userId: string,
    personalInfo?: RussiaPersonalInfo,
    companyInfo?: RussiaCompanyInfo
  ): Promise<SanctionCheckResult> {
    const result: SanctionCheckResult = {
      userId,
      checkedAt: new Date(),
      results: {} as any,
      overallRisk: 'low',
      recommendations: []
    };

    // 检查所有制裁清单
    for (const listType of Object.values(SanctionListType)) {
      const checkResult = await this.checkAgainstSanctionList(
        listType,
        personalInfo,
        companyInfo
      );
      result.results[listType] = checkResult;
    }

    // 评估整体风险
    result.overallRisk = this.calculateOverallSanctionRisk(result.results);
    
    // 生成建议
    if (result.overallRisk === 'high') {
      result.recommendations.push('建议人工审核');
      result.recommendations.push('需要额外的尽职调查');
    } else if (result.overallRisk === 'medium') {
      result.recommendations.push('建议定期重新检查');
    }

    return result;
  }

  /**
   * 检查特定制裁清单
   */
  private async checkAgainstSanctionList(
    listType: SanctionListType,
    personalInfo?: RussiaPersonalInfo,
    companyInfo?: RussiaCompanyInfo
  ): Promise<{
    isListed: boolean;
    confidence: number;
    matchedEntries?: Array<{
      name: string;
      reason: string;
      listDate: Date;
      additionalInfo?: string;
    }>;
  }> {
    // 模拟制裁检查
    const searchTerms = [];
    
    if (personalInfo) {
      searchTerms.push(`${personalInfo.firstName} ${personalInfo.lastName}`);
      if (personalInfo.inn) searchTerms.push(personalInfo.inn);
    }
    
    if (companyInfo) {
      searchTerms.push(companyInfo.fullName);
      searchTerms.push(companyInfo.shortName);
      searchTerms.push(companyInfo.inn);
    }

    // 这里应该调用真实的制裁API
    // 目前返回模拟结果
    const isHighRisk = searchTerms.some(term => 
      term.toLowerCase().includes('sanction') || 
      term.toLowerCase().includes('blocked')
    );

    return {
      isListed: isHighRisk,
      confidence: isHighRisk ? 0.95 : 0.05,
      matchedEntries: isHighRisk ? [{
        name: searchTerms[0],
        reason: 'Test sanction match',
        listDate: new Date(),
        additionalInfo: 'This is a test match'
      }] : undefined
    };
  }

  /**
   * 计算整体制裁风险
   */
  private calculateOverallSanctionRisk(
    results: { [key in SanctionListType]: any }
  ): 'low' | 'medium' | 'high' | 'blocked' {
    const hasHighConfidenceMatch = Object.values(results).some(
      result => result.isListed && result.confidence > 0.8
    );
    
    if (hasHighConfidenceMatch) return 'blocked';
    
    const hasMediumConfidenceMatch = Object.values(results).some(
      result => result.isListed && result.confidence > 0.5
    );
    
    if (hasMediumConfidenceMatch) return 'high';
    
    const hasLowConfidenceMatch = Object.values(results).some(
      result => result.isListed && result.confidence > 0.2
    );
    
    return hasLowConfidenceMatch ? 'medium' : 'low';
  }

  /**
   * OCR文档处理
   */
  private async performOCR(fileData: Buffer, documentType: RussiaDocumentType): Promise<any> {
    // 模拟OCR处理
    return {
      extractedText: 'Sample extracted text',
      fields: {
        number: '1234567890',
        name: 'ИВАНОВ ИВАН ИВАНОВИЧ',
        birthDate: '01.01.1990',
        issueDate: '01.01.2020'
      },
      confidence: 0.95
    };
  }

  /**
   * 计算文档完整性
   */
  private calculateDocumentIntegrity(ocrData: any): number {
    if (!ocrData || !ocrData.confidence) return 0;
    return ocrData.confidence;
  }

  /**
   * 人脸匹配
   */
  private async performFaceMatch(fileData: Buffer, personalInfo?: RussiaPersonalInfo): Promise<number> {
    // 模拟人脸匹配
    return Math.random() * 0.3 + 0.7; // 0.7-1.0
  }

  /**
   * 检查KYC完成状态
   */
  private async checkKYCCompletion(kycId: string): Promise<void> {
    const record = this.kycRecords.get(kycId);
    if (!record) return;

    const requiredDocs = this.getRequiredDocuments(record.level);
    const verifiedDocs = record.documents.filter(doc => doc.isVerified);
    
    const hasAllRequiredDocs = requiredDocs.every(requiredType =>
      verifiedDocs.some(doc => doc.type === requiredType)
    );

    if (hasAllRequiredDocs && record.status === RussiaKYCStatus.PENDING) {
      // 进行风险评估
      const riskAssessment = await this.performRiskAssessment(record);
      record.riskAssessment = riskAssessment;
      
      // 根据风险评估决定是否批准
      if (riskAssessment.level === 'low' || riskAssessment.level === 'medium') {
        record.status = RussiaKYCStatus.APPROVED;
        record.reviewedAt = new Date();
        record.reviewedBy = 'auto_system';
        record.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1年后过期
      } else {
        record.status = RussiaKYCStatus.REJECTED;
        record.rejectionReason = '风险评估等级过高';
      }
      
      this.kycRecords.set(kycId, record);
      this.emit('kycStatusChanged', record);
    }
  }

  /**
   * 获取所需文档类型
   */
  private getRequiredDocuments(level: RussiaKYCLevel): RussiaDocumentType[] {
    switch (level) {
      case RussiaKYCLevel.BASIC:
        return [RussiaDocumentType.PASSPORT];
      case RussiaKYCLevel.ENHANCED:
        return [RussiaDocumentType.PASSPORT, RussiaDocumentType.INN];
      case RussiaKYCLevel.CORPORATE:
        return [
          RussiaDocumentType.REGISTRATION_CERTIFICATE,
          RussiaDocumentType.INN
        ];
      default:
        return [];
    }
  }

  /**
   * 风险评估
   */
  private async performRiskAssessment(record: RussiaKYCRecord): Promise<{
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigatingFactors: string[];
  }> {
    let score = 0;
    const factors: string[] = [];
    const mitigatingFactors: string[] = [];

    // 制裁检查风险
    if (record.sanctionCheck) {
      switch (record.sanctionCheck.overallRisk) {
        case 'blocked':
          score += 100;
          factors.push('制裁名单匹配');
          break;
        case 'high':
          score += 70;
          factors.push('高风险制裁匹配');
          break;
        case 'medium':
          score += 30;
          factors.push('中等风险制裁匹配');
          break;
      }
    }

    // 文档完整性
    const avgDocIntegrity = record.documents.reduce((sum, doc) => 
      sum + (doc.metadata.documentIntegrity || 0), 0) / record.documents.length;
    
    if (avgDocIntegrity < 0.7) {
      score += 20;
      factors.push('文档完整性不足');
    } else {
      mitigatingFactors.push('文档完整性良好');
    }

    // 企业风险（如果是企业KYC）
    if (record.companyInfo) {
      // 检查企业注册时间
      const daysSinceRegistration = (Date.now() - record.companyInfo.registrationDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceRegistration < 365) {
        score += 15;
        factors.push('新成立企业');
      }
    }

    // 确定风险等级
    let level: 'low' | 'medium' | 'high' = 'low';
    if (score >= 70) level = 'high';
    else if (score >= 30) level = 'medium';

    return { score, level, factors, mitigatingFactors };
  }

  /**
   * 加载制裁清单
   */
  private async loadSanctionLists(): Promise<void> {
    // 这里应该从各个制裁API加载最新数据
    // 目前使用模拟数据
    this.sanctionLists.set(SanctionListType.OFAC, []);
    this.sanctionLists.set(SanctionListType.EU_SANCTIONS, []);
    this.sanctionLists.set(SanctionListType.ROSFINMONITORING, []);
  }

  /**
   * 初始化模拟数据
   */
  private initializeMockData(): void {
    // 模拟KYC记录
    const mockRecord: RussiaKYCRecord = {
      id: 'RU-KYC-TEST-001',
      userId: 'rusmach_user',
      level: RussiaKYCLevel.CORPORATE,
      status: RussiaKYCStatus.APPROVED,
      companyInfo: {
        fullName: 'Общество с ограниченной ответственностью "РусМаш"',
        shortName: 'ООО "РусМаш"',
        legalForm: 'ООО',
        inn: '7707083893',
        kpp: '770701001',
        ogrn: '1037739010891',
        okved: ['46.69', '47.78'],
        legalAddress: {
          region: 'Москва',
          city: 'Москва',
          street: 'ул. Промышленная',
          building: '15',
          postalCode: '123456'
        },
        phone: '+7 (495) 123-45-67',
        email: 'info@rusmach.ru',
        bankAccounts: [{
          bankName: 'ПАО Сбербанк',
          accountNumber: '40702810338000123456',
          correspondentAccount: '30101810400000000225',
          bik: '044525225'
        }],
        ceo: {
          fullName: 'Иванов Иван Иванович',
          inn: '770708389300',
          position: 'Генеральный директор'
        },
        registrationDate: new Date('2020-01-15'),
        registrationAuthority: 'Межрайонная ИФНС России № 46 по г. Москве'
      },
      documents: [],
      riskAssessment: {
        score: 15,
        level: 'low',
        factors: [],
        mitigatingFactors: ['良好的文档完整性', '成立时间较长']
      },
      submittedAt: new Date('2024-01-01'),
      reviewedAt: new Date('2024-01-02'),
      reviewedBy: 'admin',
      expiryDate: new Date('2025-01-01'),
      regulatoryReports: []
    };

    this.kycRecords.set(mockRecord.id, mockRecord);
  }

  /**
   * 获取KYC记录
   */
  getKYCRecord(kycId: string): RussiaKYCRecord | null {
    return this.kycRecords.get(kycId) || null;
  }

  /**
   * 获取用户的KYC记录
   */
  getUserKYCRecords(userId: string): RussiaKYCRecord[] {
    return Array.from(this.kycRecords.values()).filter(record => record.userId === userId);
  }

  /**
   * 获取最新的已批准KYC记录
   */
  getLatestApprovedKYC(userId: string): RussiaKYCRecord | null {
    const userRecords = this.getUserKYCRecords(userId)
      .filter(record => record.status === RussiaKYCStatus.APPROVED)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    
    return userRecords[0] || null;
  }
}

export const russiaComplianceService = new RussiaComplianceService();
export default russiaComplianceService;