# TriBridge区块链项目架构灰度图

## 项目总体架构图

```mermaid
graph TB
    subgraph "TriBridge v3.0.0 - Next.js全栈架构"
        A[用户界面层] --> B[应用层]
        B --> C[服务层]
        C --> D[数据层]
        C --> E[区块链层]
    end

    subgraph "用户界面层"
        A1[SiteNavigation 导航]
        A2[页面组件]
        A3[UI组件库]
        A4[移动端菜单]
    end

    subgraph "应用层"
        B1[首页 Index]
        B2[钱包管理 Wallet]
        B3[交易记录 Transactions]
        B4[合规检查 Compliance]
        B5[分析报表 Analytics]
        B6[个人资料 Profile]
        B7[通知中心 Notifications]
        B8[设置 Settings]
    end

    subgraph "服务层"
        C1[Next.js API路由]
        C2[认证服务]
        C3[钱包服务]
        C4[交易服务]
        C5[汇率服务]
        C6[区块链服务]
    end

    subgraph "数据层"
        D1[数据库服务]
        D2[Redis缓存]
        D3[KYC服务]
    end

    subgraph "区块链层"
        E1[以太坊 Ethereum]
        E2[波场 TRON]
        E3[币安智能链 BSC]
        E4[稳定币支持]
    end

    A --> A1
    A --> A2
    A --> A3
    A --> A4

    B --> B1
    B --> B2
    B --> B3
    B --> B4
    B --> B5
    B --> B6
    B --> B7
    B --> B8

    C --> C1
    C --> C2
    C --> C3
    C --> C4
    C --> C5
    C --> C6

    D --> D1
    D --> D2
    D --> D3

    E --> E1
    E --> E2
    E --> E3
    E --> E4
```

## 组件层次结构图

```mermaid
graph TB
    subgraph "页面组件 Pages"
        P1[Index 首页]
        P2[Wallet 钱包]
        P3[Transactions 交易]
        P4[Compliance 合规]
        P5[Analytics 分析]
        P6[Profile 个人资料]
        P7[Notifications 通知]
        P8[Settings 设置]
    end

    subgraph "布局组件 Layout"
        L1[SiteNavigation 导航栏]
        L2[Header 头部]
        L3[MobileMenu 移动菜单]
    end

    subgraph "功能组件 Components"
        C1[StatsCards 统计卡片]
        C2[CurrencyExchange 货币兑换]
        C3[RecentTransactions 最近交易]
        C4[WalletManagement 钱包管理]
        C5[TransactionHistory 交易历史]
        C6[KYCVerification KYC验证]
        C7[AMLAssessment AML评估]
        C8[Analytics 分析组件]
        C9[UserProfile 用户资料]
        C10[NotificationCenter 通知中心]
        C11[RiskMonitoring 风险监控]
    end

    subgraph "UI组件库 UI"
        U1[Button 按钮]
        U2[Card 卡片]
        U3[Dialog 对话框]
        U4[Form 表单]
        U5[Table 表格]
        U6[Navigation 导航]
        U7[Toast 提示]
    end

    P1 --> L1
    P1 --> C1
    P1 --> C2
    P1 --> C3

    P2 --> L1
    P2 --> C4

    P3 --> L1
    P3 --> C5

    P4 --> L1
    P4 --> C6
    P4 --> C7

    P5 --> L1
    P5 --> C8

    P6 --> L1
    P6 --> C9

    P7 --> L1
    P7 --> C10

    P8 --> L1

    L1 --> L3
    L2 --> L3

    C1 --> U2
    C2 --> U1
    C2 --> U4
    C3 --> U5
    C4 --> U1
    C4 --> U3
    C5 --> U5
    C6 --> U4
    C7 --> U4
    C8 --> U2
    C9 --> U1
    C9 --> U4
    C10 --> U7
    C11 --> U2
```

## API路由架构图

```mermaid
graph TB
    subgraph "Next.js API路由"
        API[/api]
        API --> AUTH[/api/auth]
        API --> HEALTH[/api/health]
        API --> WALLET[/api/wallet]
    end

    subgraph "认证路由"
        AUTH --> REGISTER[POST /api/auth/register]
        AUTH --> LOGIN[POST /api/auth/login]
        AUTH --> REFRESH[POST /api/auth/refresh]
    end

    subgraph "钱包路由"
        WALLET --> BALANCES[GET /api/wallet/balances]
        WALLET --> TRANSACTION[POST /api/wallet/transaction]
    end

    subgraph "健康检查"
        HEALTH --> HEALTHCHECK[GET /api/health]
    end

    subgraph "服务层"
        S1[认证中间件]
        S2[钱包服务]
        S3[交易服务]
        S4[汇率服务]
        S5[区块链服务]
    end

    REGISTER --> S1
    LOGIN --> S1
    REFRESH --> S1
    BALANCES --> S2
    TRANSACTION --> S3
    S2 --> S4
    S3 --> S5
```

## 数据流图

```mermaid
graph TB
    subgraph "用户交互"
        U[用户操作]
        U --> UI[UI组件]
    end

    subgraph "前端处理"
        UI --> HOOKS[React Hooks]
        HOOKS --> CONTEXT[React Context]
        CONTEXT --> QUERY[React Query]
    end

    subgraph "API通信"
        QUERY --> API[Next.js API]
        API --> MW[中间件]
        MW --> SERVICE[服务层]
    end

    subgraph "后端服务"
        SERVICE --> DB[数据库]
        SERVICE --> REDIS[Redis缓存]
        SERVICE --> BLOCKCHAIN[区块链网络]
    end

    subgraph "外部集成"
        BLOCKCHAIN --> ETH[以太坊]
        BLOCKCHAIN --> TRON[波场]
        BLOCKCHAIN --> BSC[币安智能链]
    end

    DB --> SERVICE
    REDIS --> SERVICE
    ETH --> SERVICE
    TRON --> SERVICE
    BSC --> SERVICE
    SERVICE --> API
    API --> QUERY
    QUERY --> UI
```

## 技术栈架构图

```mermaid
graph TB
    subgraph "前端技术栈"
        F1[Next.js 13+]
        F2[React 18]
        F3[TypeScript]
        F4[Tailwind CSS]
        F5[ShadCN/UI]
        F6[React Query]
        F7[React Hook Form]
    end

    subgraph "后端技术栈"
        B1[Next.js API Routes]
        B2[JWT认证]
        B3[bcryptjs加密]
        B4[数据库服务]
        B5[Redis缓存]
    end

    subgraph "区块链技术栈"
        BC1[Ethers.js]
        BC2[Web3Modal]
        BC3[Wagmi]
        BC4[Viem]
        BC5[TronWeb]
    end

    subgraph "开发工具栈"
        D1[ESLint]
        D2[Prettier]
        D3[Vitest]
        D4[Docker]
        D5[GitHub Actions]
    end

    subgraph "部署栈"
        DP1[Netlify]
        DP2[Vercel]
        DP3[Docker Compose]
        DP4[GitHub Pages]
    end

    F1 --> F2
    F2 --> F3
    F3 --> F4
    F4 --> F5
    F5 --> F6
    F6 --> F7

    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5

    BC1 --> BC2
    BC2 --> BC3
    BC3 --> BC4
    BC4 --> BC5

    F1 --> B1
    B1 --> BC1
    F1 --> D1
    D1 --> DP1
```

## 安全架构图

```mermaid
graph TB
    subgraph "认证与授权"
        A1[JWT Token认证]
        A2[API密钥验证]
        A3[中间件验证]
        A4[角色权限控制]
    end

    subgraph "数据安全"
        D1[密码加密 bcryptjs]
        D2[数据传输加密 HTTPS]
        D3[敏感信息脱敏]
        D4[输入验证 Zod]
    end

    subgraph "合规与风控"
        C1[KYC身份验证]
        C2[AML反洗钱检查]
        C3[风险评估]
        C4[交易监控]
    end

    subgraph "区块链安全"
        B1[私钥管理]
        B2[智能合约审计]
        B3[多重签名]
        B4[交易确认机制]
    end

    A1 --> A2
    A2 --> A3
    A3 --> A4

    D1 --> D2
    D2 --> D3
    D3 --> D4

    C1 --> C2
    C2 --> C3
    C3 --> C4

    B1 --> B2
    B2 --> B3
    B3 --> B4

    A1 --> D1
    C1 --> B1
```

---

*本架构图展示了TriBridge v3.0.0的完整技术架构，采用Next.js全栈架构，支持跨境支付、区块链集成和合规管理功能。*