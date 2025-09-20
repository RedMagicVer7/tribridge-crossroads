# AML检查引擎

<cite>
**Referenced Files in This Document**   
- [complianceService.ts](file://backend/src/services/complianceService.ts)
- [compliance.ts](file://backend/src/routes/compliance.ts)
- [transaction.ts](file://backend/src/routes/transaction.ts)
- [AMLAssessment.tsx](file://src/components/Compliance/AMLAssessment.tsx)
- [Compliance.tsx](file://src/pages/Compliance.tsx)
- [database.ts](file://backend/src/services/database.ts)
</cite>

## 目录
1. [引言](#引言)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构概述](#架构概述)
5. [详细组件分析](#详细组件分析)
6. [依赖分析](#依赖分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)

## 引言
本文档详细描述了反洗钱（AML）检查引擎的架构与实现，重点分析了合规服务中的规则引擎设计、风险评估算法、制裁名单比对机制以及前端风险展示逻辑。系统通过多层次的合规检查，确保交易符合监管要求，防止洗钱和恐怖融资活动。

## 项目结构
项目采用前后端分离的架构，后端服务位于`backend/src`目录，前端组件位于`src`目录。合规相关的核心逻辑集中在`backend/src/services/complianceService.ts`，而前端展示组件位于`src/components/Compliance`目录。

**Section sources**
- [complianceService.ts](file://backend/src/services/complianceService.ts#L1-L50)
- [AMLAssessment.tsx](file://src/components/Compliance/AMLAssessment.tsx#L1-L50)

## 核心组件
AML检查引擎的核心是`ComplianceService`类，它实现了多层次的合规检查机制，包括制裁名单检查、地理限制检查、反洗钱模式识别和KYC验证。前端通过`AMLAssessment`组件展示风险评估结果。

**Section sources**
- [complianceService.ts](file://backend/src/services/complianceService.ts#L44-L458)
- [AMLAssessment.tsx](file://src/components/Compliance/AMLAssessment.tsx#L36-L344)

## 架构概述
系统采用分层架构，前端通过API路由与后端服务交互，后端服务调用合规检查引擎执行具体的检查逻辑。

```mermaid
graph TB
subgraph "前端"
A[AMLAssessment] --> B[CompliancePage]
end
subgraph "后端"
C[compliance.ts] --> D[ComplianceService]
E[transaction.ts] --> D
end
B --> C
D --> F[database.ts]
```

**Diagram sources **
- [compliance.ts](file://backend/src/routes/compliance.ts#L1-L181)
- [complianceService.ts](file://backend/src/services/complianceService.ts#L44-L458)
- [transaction.ts](file://backend/src/routes/transaction.ts#L1-L313)

## 详细组件分析

### 合规服务分析
`ComplianceService`是AML检查引擎的核心，实现了完整的合规检查流程。

#### 类图
```mermaid
classDiagram
class ComplianceService {
-checks : Map<string, ComplianceCheck>
-sanctionLists : Map<string, any[]>
-restrictedCountries : Map<string, GeographicalRestriction>
+performComplianceCheck(userId, transactionId, checkData) : Promise<ComplianceCheck>
+getComplianceCheck(checkId) : ComplianceCheck | undefined
+getUserComplianceChecks(userId) : ComplianceCheck[]
+updateCheckStatus(checkId, status, notes) : boolean
+getRiskStatistics() : RiskStatistics
}
class ComplianceCheck {
+id : string
+userId : string
+transactionId : string
+checkType : 'sanction' | 'aml' | 'kyc' | 'geographical'
+status : 'pending' | 'approved' | 'rejected' | 'requires_review'
+result : ComplianceResult
+createdAt : Date
+updatedAt : Date
}
class ComplianceResult {
+score : number
+riskLevel : 'low' | 'medium' | 'high' | 'critical'
+flags : ComplianceFlag[]
+recommendations : string[]
+blockedCountries? : string[]
+sanctionMatches? : SanctionMatch[]
}
class ComplianceFlag {
+type : 'sanction_list' | 'high_risk_country' | 'suspicious_pattern' | 'kyc_incomplete'
+severity : 'low' | 'medium' | 'high' | 'critical'
+description : string
+details : any
}
class SanctionMatch {
+listName : string
+entityName : string
+matchScore : number
+details : string
}
class GeographicalRestriction {
+countryCode : string
+countryName : string
+restrictionType : 'full_block' | 'enhanced_dd' | 'monitoring'
+reason : string
+effectiveDate : Date
}
ComplianceService --> ComplianceCheck : "creates"
ComplianceService --> ComplianceResult : "generates"
ComplianceResult --> ComplianceFlag : "contains"
ComplianceResult --> SanctionMatch : "contains"
ComplianceService --> GeographicalRestriction : "uses"
```

**Diagram sources **
- [complianceService.ts](file://backend/src/services/complianceService.ts#L1-L458)

#### 合规检查流程
```mermaid
sequenceDiagram
participant Frontend as 前端
participant ComplianceRoute as compliance.ts
participant ComplianceService as ComplianceService
participant Database as database.ts
Frontend->>ComplianceRoute : POST /check
ComplianceRoute->>ComplianceService : performComplianceCheck()
ComplianceService->>ComplianceService : checkSanctions()
ComplianceService->>ComplianceService : checkGeographicalRestrictions()
ComplianceService->>ComplianceService : checkAML()
ComplianceService->>ComplianceService : checkKYC()
ComplianceService->>ComplianceService : consolidateResults()
ComplianceService->>Database : 保存检查结果
ComplianceService-->>ComplianceRoute : 返回检查结果
ComplianceRoute-->>Frontend : JSON响应
```

**Diagram sources **
- [compliance.ts](file://backend/src/routes/compliance.ts#L4-L40)
- [complianceService.ts](file://backend/src/services/complianceService.ts#L102-L149)

### AML风险评估分析
`AMLAssessment`组件负责在前端展示用户的风险评估结果。

#### 组件结构
```mermaid
classDiagram
class AMLAssessment {
-amlReport : AMLReport | null
-isLoading : boolean
+simulateAMLAssessment() : void
+getRiskColor(level) : string
+getRiskIcon(level) : JSX.Element
}
class AMLReport {
+overallRiskScore : number
+riskLevel : 'low' | 'medium' | 'high'
+lastUpdated : string
+factors : RiskFactor[]
+recommendations : string[]
}
class RiskFactor {
+id : string
+name : string
+description : string
+score : number
+maxScore : number
+status : 'low' | 'medium' | 'high'
+details : string[]
}
AMLAssessment --> AMLReport : "displays"
AMLReport --> RiskFactor : "contains"
```

**Diagram sources **
- [AMLAssessment.tsx](file://src/components/Compliance/AMLAssessment.tsx#L1-L344)

#### 风险评估流程
```mermaid
flowchart TD
Start([组件挂载]) --> Simulate["simulateAMLAssessment()"]
Simulate --> SetLoading["setIsLoading(true)"]
SetLoading --> Delay["setTimeout(2000ms)"]
Delay --> CreateMock["创建模拟报告"]
CreateMock --> SetReport["setAmlReport(mockReport)"]
SetReport --> SetLoadingFalse["setIsLoading(false)"]
SetLoadingFalse --> Display["显示风险评估"]
Display --> Overall["总体风险概览"]
Display --> Factors["风险因素详情"]
Display --> Recommendations["风险管理建议"]
Display --> QuickIndicators["快速风险指标"]
Overall --> Score["显示综合风险评分"]
Factors --> Geographic["地理风险"]
Factors --> Pattern["交易模式"]
Factors --> Counterparty["交易对手风险"]
Factors --> Behavioral["行为分析"]
```

**Diagram sources **
- [AMLAssessment.tsx](file://src/components/Compliance/AMLAssessment.tsx#L36-L344)

## 依赖分析
系统各组件之间存在明确的依赖关系，确保了合规检查的完整性和数据持久化。

```mermaid
graph TD
A[AMLAssessment] --> B[CompliancePage]
B --> C[compliance.ts]
C --> D[ComplianceService]
D --> E[database.ts]
F[transaction.ts] --> D
D --> G[EventEmitter]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#f96,stroke:#333
style D fill:#6f9,stroke:#333
style E fill:#69f,stroke:#333
```

**Diagram sources **
- [complianceService.ts](file://backend/src/services/complianceService.ts#L1-L10)
- [compliance.ts](file://backend/src/routes/compliance.ts#L1-L10)
- [database.ts](file://backend/src/services/database.ts#L1-L10)

**Section sources**
- [complianceService.ts](file://backend/src/services/complianceService.ts#L1-L50)
- [compliance.ts](file://backend/src/routes/compliance.ts#L1-L50)
- [database.ts](file://backend/src/services/database.ts#L1-L50)

## 性能考虑
系统在设计时考虑了性能优化，通过内存存储检查结果避免频繁的数据库查询，同时使用异步处理确保API响应速度。

**Section sources**
- [complianceService.ts](file://backend/src/services/complianceService.ts#L44-L50)
- [compliance.ts](file://backend/src/routes/compliance.ts#L4-L10)

## 故障排除指南
当合规检查功能出现问题时，应首先检查`complianceService.ts`中的检查逻辑和`compliance.ts`中的API路由配置。

**Section sources**
- [complianceService.ts](file://backend/src/services/complianceService.ts#L150-L200)
- [compliance.ts](file://backend/src/routes/compliance.ts#L10-L50)

## 结论
AML检查引擎通过多层次的合规检查机制，有效识别和防范洗钱风险。系统设计合理，前后端分离清晰，便于维护和扩展。未来可考虑引入机器学习算法优化风险评分模型，并集成外部合规API提高检查准确性。