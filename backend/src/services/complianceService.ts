import { EventEmitter } from 'events';

export interface ComplianceCheck {
  id: string;
  userId: string;
  transactionId: string;
  checkType: 'sanction' | 'aml' | 'kyc' | 'geographical';
  status: 'pending' | 'approved' | 'rejected' | 'requires_review';
  result: ComplianceResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceResult {
  score: number; // 0-100, 0 是最高风险
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: ComplianceFlag[];
  recommendations: string[];
  blockedCountries?: string[];
  sanctionMatches?: SanctionMatch[];
}

export interface ComplianceFlag {
  type: 'sanction_list' | 'high_risk_country' | 'suspicious_pattern' | 'kyc_incomplete';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: any;
}

export interface SanctionMatch {
  listName: string; // OFAC, EU, UN 等
  entityName: string;
  matchScore: number;
  details: string;
}

export interface GeographicalRestriction {
  countryCode: string;
  countryName: string;
  restrictionType: 'full_block' | 'enhanced_dd' | 'monitoring';
  reason: string;
  effectiveDate: Date;
}

class ComplianceService extends EventEmitter {
  private checks: Map<string, ComplianceCheck> = new Map();
  private sanctionLists: Map<string, any[]> = new Map();
  private restrictedCountries: Map<string, GeographicalRestriction> = new Map();

  constructor() {
    super();
    this.initializeSanctionLists();
    this.initializeGeographicalRestrictions();
  }

  private initializeSanctionLists() {
    // 模拟OFAC制裁名单
    this.sanctionLists.set('OFAC', [
      { name: 'North Korea', type: 'country', aliases: ['DPRK', 'Democratic People\'s Republic of Korea'] },
      { name: 'Iran', type: 'country', aliases: ['Islamic Republic of Iran'] },
      { name: 'Syria', type: 'country', aliases: ['Syrian Arab Republic'] },
      // 模拟个人和实体
      { name: 'Vladimir Putin', type: 'individual', aliases: ['Putin, Vladimir'] },
      { name: 'Bank Rossiya', type: 'entity', aliases: ['Rossiya Bank'] }
    ]);

    // 模拟EU制裁名单
    this.sanctionLists.set('EU', [
      { name: 'Russia', type: 'country', aliases: ['Russian Federation'] },
      { name: 'Belarus', type: 'country', aliases: ['Republic of Belarus'] }
    ]);

    // 模拟UN制裁名单
    this.sanctionLists.set('UN', [
      { name: 'Taliban', type: 'organization', aliases: ['Islamic Emirate of Afghanistan'] },
      { name: 'Al-Qaeda', type: 'organization', aliases: ['Al-Qaida'] }
    ]);
  }

  private initializeGeographicalRestrictions() {
    // 高风险国家/地区
    const restrictedCountries = [
      { code: 'KP', name: 'North Korea', type: 'full_block' as const, reason: 'UN sanctions' },
      { code: 'IR', name: 'Iran', type: 'full_block' as const, reason: 'OFAC sanctions' },
      { code: 'SY', name: 'Syria', type: 'full_block' as const, reason: 'Multiple sanctions' },
      { code: 'RU', name: 'Russia', type: 'enhanced_dd' as const, reason: 'EU/US sanctions' },
      { code: 'BY', name: 'Belarus', type: 'enhanced_dd' as const, reason: 'EU sanctions' },
      { code: 'AF', name: 'Afghanistan', type: 'enhanced_dd' as const, reason: 'Political instability' },
      { code: 'MM', name: 'Myanmar', type: 'enhanced_dd' as const, reason: 'Political sanctions' }
    ];

    restrictedCountries.forEach(country => {
      this.restrictedCountries.set(country.code, {
        countryCode: country.code,
        countryName: country.name,
        restrictionType: country.type,
        reason: country.reason,
        effectiveDate: new Date('2022-01-01')
      });
    });
  }

  async performComplianceCheck(
    userId: string,
    transactionId: string,
    checkData: {
      userCountry?: string;
      destinationCountry?: string;
      amount: number;
      currency: string;
      userInfo: any;
      transactionPattern?: any;
    }
  ): Promise<ComplianceCheck> {
    const checkId = `compliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const check: ComplianceCheck = {
      id: checkId,
      userId,
      transactionId,
      checkType: 'sanction',
      status: 'pending',
      result: {
        score: 0,
        riskLevel: 'low',
        flags: [],
        recommendations: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 执行多层次合规检查
    const sanctionResult = await this.checkSanctions(checkData);
    const geoResult = await this.checkGeographicalRestrictions(checkData);
    const amlResult = await this.checkAML(checkData);
    const kycResult = await this.checkKYC(checkData);

    // 汇总检查结果
    check.result = this.consolidateResults([sanctionResult, geoResult, amlResult, kycResult]);
    
    // 确定最终状态
    check.status = this.determineCheckStatus(check.result);
    check.updatedAt = new Date();

    this.checks.set(checkId, check);
    this.emit('complianceCheckCompleted', check);

    return check;
  }

  private async checkSanctions(checkData: any): Promise<Partial<ComplianceResult>> {
    const flags: ComplianceFlag[] = [];
    const sanctionMatches: SanctionMatch[] = [];
    let score = 100;

    // 检查用户信息是否匹配制裁名单
    for (const [listName, entities] of this.sanctionLists.entries()) {
      for (const entity of entities) {
        if (this.matchesEntity(checkData.userInfo, entity)) {
          const match: SanctionMatch = {
            listName,
            entityName: entity.name,
            matchScore: 0.95,
            details: `Potential match found in ${listName} sanctions list`
          };
          sanctionMatches.push(match);
          
          flags.push({
            type: 'sanction_list',
            severity: 'critical',
            description: `Potential sanction list match: ${entity.name}`,
            details: match
          });
          
          score = 0; // 制裁名单匹配直接设为最高风险
        }
      }
    }

    return {
      score: Math.min(score, 100),
      flags,
      sanctionMatches
    };
  }

  private async checkGeographicalRestrictions(checkData: any): Promise<Partial<ComplianceResult>> {
    const flags: ComplianceFlag[] = [];
    const blockedCountries: string[] = [];
    let score = 100;

    // 检查用户所在国家
    if (checkData.userCountry) {
      const restriction = this.restrictedCountries.get(checkData.userCountry);
      if (restriction) {
        if (restriction.restrictionType === 'full_block') {
          flags.push({
            type: 'high_risk_country',
            severity: 'critical',
            description: `User from blocked country: ${restriction.countryName}`,
            details: { countryCode: checkData.userCountry, reason: restriction.reason }
          });
          blockedCountries.push(restriction.countryName);
          score = 0;
        } else if (restriction.restrictionType === 'enhanced_dd') {
          flags.push({
            type: 'high_risk_country',
            severity: 'high',
            description: `User from high-risk country: ${restriction.countryName}`,
            details: { countryCode: checkData.userCountry, reason: restriction.reason }
          });
          score = Math.min(score, 30);
        }
      }
    }

    // 检查目标国家
    if (checkData.destinationCountry) {
      const restriction = this.restrictedCountries.get(checkData.destinationCountry);
      if (restriction && restriction.restrictionType === 'full_block') {
        flags.push({
          type: 'high_risk_country',
          severity: 'critical',
          description: `Transaction to blocked country: ${restriction.countryName}`,
          details: { countryCode: checkData.destinationCountry, reason: restriction.reason }
        });
        blockedCountries.push(restriction.countryName);
        score = 0;
      }
    }

    return {
      score: Math.min(score, 100),
      flags,
      blockedCountries
    };
  }

  private async checkAML(checkData: any): Promise<Partial<ComplianceResult>> {
    const flags: ComplianceFlag[] = [];
    let score = 100;

    // 检查交易金额模式
    if (checkData.amount > 10000) {
      const severity = checkData.amount > 50000 ? 'high' : 'medium';
      flags.push({
        type: 'suspicious_pattern',
        severity,
        description: `Large transaction amount: ${checkData.amount} ${checkData.currency}`,
        details: { amount: checkData.amount, currency: checkData.currency }
      });
      score = Math.min(score, severity === 'high' ? 40 : 60);
    }

    // 检查频率模式（简化版）
    if (checkData.transactionPattern?.dailyCount > 10) {
      flags.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        description: 'High frequency trading pattern detected',
        details: checkData.transactionPattern
      });
      score = Math.min(score, 50);
    }

    return {
      score: Math.min(score, 100),
      flags
    };
  }

  private async checkKYC(checkData: any): Promise<Partial<ComplianceResult>> {
    const flags: ComplianceFlag[] = [];
    let score = 100;

    // 检查KYC完整性
    const kycRequiredFields = ['fullName', 'dateOfBirth', 'address', 'idDocument'];
    const missingFields = kycRequiredFields.filter(field => !checkData.userInfo[field]);

    if (missingFields.length > 0) {
      flags.push({
        type: 'kyc_incomplete',
        severity: 'medium',
        description: `Incomplete KYC: Missing ${missingFields.join(', ')}`,
        details: { missingFields }
      });
      score = Math.min(score, 70);
    }

    return {
      score: Math.min(score, 100),
      flags
    };
  }

  private matchesEntity(userInfo: any, entity: any): boolean {
    // 简化的匹配逻辑
    const userName = (userInfo.fullName || '').toLowerCase();
    const entityName = entity.name.toLowerCase();
    
    // 精确匹配或别名匹配
    if (userName.includes(entityName) || entityName.includes(userName)) {
      return true;
    }

    // 检查别名
    if (entity.aliases) {
      return entity.aliases.some((alias: string) => 
        userName.includes(alias.toLowerCase()) || alias.toLowerCase().includes(userName)
      );
    }

    return false;
  }

  private consolidateResults(results: Partial<ComplianceResult>[]): ComplianceResult {
    const allFlags: ComplianceFlag[] = [];
    const allRecommendations: string[] = [];
    const allBlockedCountries: string[] = [];
    const allSanctionMatches: SanctionMatch[] = [];
    
    let minScore = 100;

    results.forEach(result => {
      if (result.flags) allFlags.push(...result.flags);
      if (result.recommendations) allRecommendations.push(...result.recommendations);
      if (result.blockedCountries) allBlockedCountries.push(...result.blockedCountries);
      if (result.sanctionMatches) allSanctionMatches.push(...result.sanctionMatches);
      if (result.score !== undefined) minScore = Math.min(minScore, result.score);
    });

    // 确定风险等级
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (minScore >= 80) riskLevel = 'low';
    else if (minScore >= 60) riskLevel = 'medium';
    else if (minScore >= 20) riskLevel = 'high';
    else riskLevel = 'critical';

    // 生成建议
    const recommendations = this.generateRecommendations(allFlags, riskLevel);

    return {
      score: minScore,
      riskLevel,
      flags: allFlags,
      recommendations,
      blockedCountries: allBlockedCountries.length > 0 ? allBlockedCountries : undefined,
      sanctionMatches: allSanctionMatches.length > 0 ? allSanctionMatches : undefined
    };
  }

  private generateRecommendations(flags: ComplianceFlag[], riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('立即阻止交易');
      recommendations.push('进行手动审查');
      recommendations.push('联系合规团队');
    } else if (riskLevel === 'high') {
      recommendations.push('需要额外的尽职调查');
      recommendations.push('考虑延迟处理');
      recommendations.push('收集额外文档');
    } else if (riskLevel === 'medium') {
      recommendations.push('进行增强监控');
      recommendations.push('记录详细交易信息');
    }

    // 基于具体标记生成建议
    flags.forEach(flag => {
      switch (flag.type) {
        case 'kyc_incomplete':
          recommendations.push('完成KYC验证流程');
          break;
        case 'high_risk_country':
          recommendations.push('进行地理位置验证');
          break;
        case 'sanction_list':
          recommendations.push('进行制裁名单详细核查');
          break;
        case 'suspicious_pattern':
          recommendations.push('分析交易模式');
          break;
      }
    });

    return [...new Set(recommendations)]; // 去重
  }

  private determineCheckStatus(result: ComplianceResult): 'approved' | 'rejected' | 'requires_review' {
    if (result.riskLevel === 'critical') {
      return 'rejected';
    } else if (result.riskLevel === 'high') {
      return 'requires_review';
    } else {
      return 'approved';
    }
  }

  // 获取合规检查结果
  getComplianceCheck(checkId: string): ComplianceCheck | undefined {
    return this.checks.get(checkId);
  }

  // 获取用户的所有合规检查
  getUserComplianceChecks(userId: string): ComplianceCheck[] {
    return Array.from(this.checks.values()).filter(check => check.userId === userId);
  }

  // 更新合规检查状态（手动审查后）
  updateCheckStatus(checkId: string, status: 'approved' | 'rejected', notes?: string): boolean {
    const check = this.checks.get(checkId);
    if (!check) return false;

    check.status = status;
    check.updatedAt = new Date();
    
    if (notes) {
      check.result.recommendations.push(`Manual review: ${notes}`);
    }

    this.emit('complianceStatusUpdated', check);
    return true;
  }

  // 获取风险统计
  getRiskStatistics(): {
    totalChecks: number;
    riskDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
  } {
    const checks = Array.from(this.checks.values());
    
    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    const statusDistribution = {
      pending: 0,
      approved: 0,
      rejected: 0,
      requires_review: 0
    };

    checks.forEach(check => {
      riskDistribution[check.result.riskLevel]++;
      statusDistribution[check.status]++;
    });

    return {
      totalChecks: checks.length,
      riskDistribution,
      statusDistribution
    };
  }
}

export default ComplianceService;