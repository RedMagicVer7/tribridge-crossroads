/**
 * 合规服务
 * 处理 KYC/AML 合规检查和认证管理
 */

export interface KYCDocument {
  id: string;
  type: 'passport' | 'id_card' | 'business_license' | 'bank_statement' | 'address_proof';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  reviewDate?: string;
  reviewNotes?: string;
}

export interface KYCProfile {
  userId: string;
  level: 1 | 2 | 3;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    phoneNumber: string;
    email: string;
  };
  businessInfo?: {
    companyName: string;
    registrationNumber: string;
    businessType: string;
    address: string;
  };
  documents: KYCDocument[];
  lastUpdated: string;
}

export interface AMLCheckResult {
  userId: string;
  checkDate: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  checks: {
    ofacSanctions: boolean;
    euSanctions: boolean;
    russiaSanctions: boolean;
    sourceOfFunds: boolean;
    pep: boolean;
    adverseMedia: boolean;
  };
  details: string[];
}

export interface ComplianceScore {
  userId: string;
  totalScore: number;
  maxScore: number;
  breakdown: {
    identity: number;
    address: number;
    sourceOfFunds: number;
    amlCheck: number;
  };
  level: string;
  lastCalculated: string;
}

class ComplianceService {
  private baseUrl = '/api/compliance';

  /**
   * 获取用户的 KYC 资料
   */
  async getKYCProfile(userId: string): Promise<KYCProfile> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      userId,
      level: 2,
      status: 'approved',
      personalInfo: {
        firstName: 'Ivan',
        lastName: 'Petrov',
        dateOfBirth: '1985-03-15',
        nationality: 'Russian',
        address: '莫斯科市中央区列宁大街123号',
        phoneNumber: '+7-495-123-4567',
        email: 'ivan.petrov@example.com'
      },
      businessInfo: {
        companyName: 'RusMach Engineering LLC',
        registrationNumber: 'RU-1234567890',
        businessType: '重型机械制造',
        address: '莫斯科市工业区机械街45号'
      },
      documents: [
        {
          id: 'doc-1',
          type: 'passport',
          fileName: 'passport_ivan_petrov.pdf',
          fileUrl: '/documents/passport_ivan_petrov.pdf',
          status: 'approved',
          uploadDate: '2024-01-05',
          reviewDate: '2024-01-06',
          reviewNotes: '文件清晰，信息完整'
        },
        {
          id: 'doc-2',
          type: 'address_proof',
          fileName: 'utility_bill_jan2024.pdf',
          fileUrl: '/documents/utility_bill_jan2024.pdf',
          status: 'approved',
          uploadDate: '2024-01-10',
          reviewDate: '2024-01-11',
          reviewNotes: '地址验证通过'
        },
        {
          id: 'doc-3',
          type: 'business_license',
          fileName: 'business_license_rusmach.pdf',
          fileUrl: '/documents/business_license_rusmach.pdf',
          status: 'approved',
          uploadDate: '2024-01-15',
          reviewDate: '2024-01-16',
          reviewNotes: '营业执照有效'
        }
      ],
      lastUpdated: '2024-01-16'
    };
  }

  /**
   * 上传 KYC 文档
   */
  async uploadKYCDocument(userId: string, file: File, documentType: KYCDocument['type']): Promise<KYCDocument> {
    // 模拟文件上传
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newDocument: KYCDocument = {
      id: `doc-${Date.now()}`,
      type: documentType,
      fileName: file.name,
      fileUrl: `/documents/${file.name}`,
      status: 'pending',
      uploadDate: new Date().toISOString(),
    };

    return newDocument;
  }

  /**
   * 执行 AML 检查
   */
  async performAMLCheck(userId: string): Promise<AMLCheckResult> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      userId,
      checkDate: new Date().toISOString(),
      riskLevel: 'low',
      score: 92,
      checks: {
        ofacSanctions: true,
        euSanctions: true,
        russiaSanctions: true,
        sourceOfFunds: true,
        pep: false,
        adverseMedia: true
      },
      details: [
        'OFAC 制裁名单检查: 未发现匹配项',
        'EU 制裁名单检查: 未发现匹配项',
        '俄罗斯制裁检查: 未发现匹配项',
        '资金来源验证: 通过企业银行对账单验证',
        'PEP 检查: 非政治敏感人员',
        '负面媒体检查: 无不良记录'
      ]
    };
  }

  /**
   * 获取合规评分
   */
  async getComplianceScore(userId: string): Promise<ComplianceScore> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      userId,
      totalScore: 92,
      maxScore: 100,
      breakdown: {
        identity: 25,
        address: 20,
        sourceOfFunds: 22,
        amlCheck: 25
      },
      level: '优秀',
      lastCalculated: new Date().toISOString()
    };
  }

  /**
   * 获取合规历史记录
   */
  async getComplianceHistory(userId: string): Promise<Array<{
    date: string;
    action: string;
    status: string;
    description: string;
  }>> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      {
        date: '2024-01-15',
        action: 'KYC-2 升级',
        status: 'completed',
        description: '成功升级到 KYC Level 2'
      },
      {
        date: '2024-01-10',
        action: '地址验证',
        status: 'completed',
        description: '地址验证文档审核通过'
      },
      {
        date: '2024-01-05',
        action: '身份认证',
        status: 'completed',
        description: '身份认证文档审核通过'
      },
      {
        date: '2024-01-01',
        action: 'AML检查',
        status: 'completed',
        description: '反洗钱检查通过'
      }
    ];
  }

  /**
   * 检查用户是否符合特定操作的合规要求
   */
  async checkComplianceRequirement(userId: string, action: string, amount?: number): Promise<{
    allowed: boolean;
    reason?: string;
    requiredLevel?: number;
  }> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const profile = await this.getKYCProfile(userId);
    
    // 检查不同操作的合规要求
    switch (action) {
      case 'trade':
        if (amount && amount > 10000 && profile.level < 2) {
          return {
            allowed: false,
            reason: '大额交易需要 KYC Level 2 或更高级别',
            requiredLevel: 2
          };
        }
        return { allowed: true };
        
      case 'withdraw':
        if (amount && amount > 50000 && profile.level < 3) {
          return {
            allowed: false,
            reason: '大额提现需要 KYC Level 3 认证',
            requiredLevel: 3
          };
        }
        return { allowed: true };
        
      default:
        return { allowed: true };
    }
  }

  /**
   * 验证文档
   */
  validateDocument(file: File, documentType: KYCDocument['type']): {
    isValid: boolean;
    error?: string;
  } {
    // 文件大小检查 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: '文件大小不能超过 10MB' };
    }
    
    // 文件类型检查
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: '只支持 JPG、PNG 或 PDF 格式' };
    }
    
    return { isValid: true };
  }

  /**
   * 获取制裁名单检查状态
   */
  async getSanctionCheckStatus(userId: string): Promise<{
    isClean: boolean;
    lastCheck: string;
    sources: string[];
  }> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      isClean: true,
      lastCheck: new Date().toISOString(),
      sources: ['OFAC', 'EU Sanctions', 'UN Sanctions', 'Russia Federal List']
    };
  }
}

export const complianceService = new ComplianceService();