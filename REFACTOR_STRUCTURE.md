# TriBridge 项目重构结构指南

## 重构目标

1. **提高代码可维护性** - 通过模块化和组件化设计
2. **减少代码重复** - 提取通用组件和工具函数
3. **改善类型安全** - 完善 TypeScript 类型定义
4. **优化性能** - 实现代码分割和懒加载
5. **统一开发规范** - 建立一致的编码标准

## 新目录结构

```
src/
├── app/                    # Next.js 13+ App Router (未来迁移目标)
├── components/             # 组件库
│   ├── common/            # 通用组件
│   │   ├── StatusBadges.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ConfirmDialog.tsx
│   ├── forms/             # 表单组件
│   │   ├── FormField.tsx
│   │   ├── ValidationMessage.tsx
│   │   └── FormProvider.tsx
│   ├── layout/            # 布局组件
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── business/          # 业务特定组件
│   │   ├── compliance/    # 合规相关
│   │   ├── transaction/   # 交易相关
│   │   ├── wallet/        # 钱包相关
│   │   ├── russia/        # 俄罗斯业务
│   │   └── analytics/     # 分析相关
│   └── ui/                # 基础UI组件 (ShadCN)
├── hooks/                 # 自定义Hooks
│   ├── useAsyncData.ts
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── usePagination.ts
├── lib/                   # 工具库
│   ├── constants.ts       # 常量定义
│   ├── types.ts          # 类型定义
│   ├── utils.ts          # 通用工具函数
│   ├── toast-utils.ts    # Toast 工具
│   ├── validation.ts     # 验证工具
│   └── api.ts           # API 客户端
├── services/             # 业务服务层
│   ├── api/              # API 服务
│   ├── blockchain/       # 区块链服务
│   ├── compliance/       # 合规服务
│   └── storage/         # 存储服务
├── stores/               # 状态管理
│   ├── useUserStore.ts
│   ├── useWalletStore.ts
│   └── useSettingsStore.ts
├── contexts/             # React Context
│   ├── TranslationContext.tsx
│   ├── ThemeContext.tsx
│   └── AuthContext.tsx
├── pages/                # 页面组件
└── styles/               # 样式文件
```

## 重构完成的内容

### ✅ 已完成

1. **通用工具库**
   - `src/lib/constants.ts` - 统一常量管理
   - `src/lib/types.ts` - TypeScript 类型定义
   - `src/lib/utils.ts` - 通用工具函数
   - `src/lib/toast-utils.ts` - Toast 通知工具

2. **通用组件**
   - `src/components/common/StatusBadges.tsx` - 状态徽章组件库

3. **自定义Hooks**
   - `src/hooks/useAsyncData.ts` - 异步数据获取Hook

4. **业务组件重构示例**
   - `src/components/compliance/ComplianceStats.tsx` - 合规统计组件
   - `src/components/compliance/ComplianceCheckForm.tsx` - 合规检查表单

### 🔄 进行中

1. **组件优化** - 将大型组件拆分为小型组件
2. **类型安全改进** - 完善TypeScript类型定义

### 📋 待进行

1. **性能优化** - 代码分割和懒加载
2. **测试完善** - 添加单元测试和集成测试
3. **文档更新** - 更新组件文档和使用指南

## 重构原则

### 1. 单一职责原则
每个组件只负责一个特定的功能，避免过度复杂的组件。

**重构前：**
```tsx
// ComplianceModule.tsx (27.5KB)
const ComplianceModule = () => {
  // 统计逻辑
  // 表单逻辑  
  // 列表逻辑
  // 详情逻辑
  // ...
}
```

**重构后：**
```tsx
// ComplianceStats.tsx
const ComplianceStats = ({ stats }) => { ... }

// ComplianceCheckForm.tsx  
const ComplianceCheckForm = ({ onSubmit }) => { ... }

// ComplianceList.tsx
const ComplianceList = ({ checks }) => { ... }

// ComplianceModule.tsx (组合组件)
const ComplianceModule = () => (
  <div>
    <ComplianceStats stats={stats} />
    <ComplianceCheckForm onSubmit={handleSubmit} />
    <ComplianceList checks={checks} />
  </div>
)
```

### 2. DRY原则 (Don't Repeat Yourself)
提取重复的代码到工具函数或组件中。

**重构前：**
```tsx
// 多个组件中重复的Badge逻辑
const getStatusBadge = (status) => {
  switch (status) {
    case 'completed': return <Badge variant="default">已完成</Badge>
    // ...
  }
}
```

**重构后：**
```tsx
// 统一的Badge组件
import { TransactionStatusBadge } from '@/components/common/StatusBadges'
<TransactionStatusBadge status="completed" />
```

### 3. 类型安全
使用TypeScript严格类型检查，避免运行时错误。

**重构前：**
```tsx
const handleSubmit = (data: any) => { ... }
```

**重构后：**
```tsx
const handleSubmit = (data: ComplianceCheckFormData) => { ... }
```

### 4. 性能优化
使用React.memo、useMemo、useCallback等优化组件性能。

```tsx
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data)
  }, [data])
  
  const handleClick = useCallback(() => {
    // ...
  }, [])
  
  return <div>{processedData}</div>
})
```

## 迁移指南

### 使用新的工具函数

**替换前：**
```tsx
const formatCurrency = (amount, currency) => {
  const symbols = { USD: '$', CNY: '¥' }
  return `${symbols[currency]}${amount.toLocaleString()}`
}
```

**替换后：**
```tsx
import { formatCurrency } from '@/lib/utils'
const formattedAmount = formatCurrency(1000, 'USD')
```

### 使用统一的Badge组件

**替换前：**
```tsx
const getStatusBadge = (status) => {
  // 重复的状态映射逻辑
}
```

**替换后：**
```tsx
import { TransactionStatusBadge } from '@/components/common/StatusBadges'
<TransactionStatusBadge status={transaction.status} />
```

### 使用异步数据Hook

**替换前：**
```tsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await api.getData()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

**替换后：**
```tsx
import { useAsyncData } from '@/hooks/useAsyncData'
const { data, loading, error, refetch } = useAsyncData(() => api.getData())
```

## 代码质量标准

1. **命名规范**
   - 组件使用 PascalCase
   - 函数和变量使用 camelCase
   - 常量使用 UPPER_SNAKE_CASE
   - 类型使用 PascalCase

2. **文件组织**
   - 每个文件只导出一个主要组件/函数
   - 相关的类型定义放在同一文件或专门的types文件中
   - 使用绝对路径导入（@/）

3. **注释规范**
   - 复杂逻辑添加解释性注释
   - 公共函数添加JSDoc注释
   - 组件添加功能描述注释

4. **错误处理**
   - 使用统一的错误处理机制
   - 提供用户友好的错误信息
   - 记录详细的错误日志

## 性能优化建议

1. **代码分割**
   ```tsx
   const LazyComponent = React.lazy(() => import('./HeavyComponent'))
   ```

2. **缓存优化**
   ```tsx
   const { data } = useAsyncData(fetchData, { cacheTime: 300000 })
   ```

3. **虚拟化长列表**
   ```tsx
   import { FixedSizeList } from 'react-window'
   ```

4. **图片优化**
   ```tsx
   <Image src="/image.jpg" loading="lazy" />
   ```

## 测试策略

1. **单元测试** - 测试独立的函数和组件
2. **集成测试** - 测试组件间的交互
3. **E2E测试** - 测试完整的用户流程
4. **性能测试** - 监控组件渲染性能

## 部署和监控

1. **构建优化** - 启用代码分割和Tree Shaking
2. **性能监控** - 使用Web Vitals监控性能指标
3. **错误监控** - 集成错误追踪服务
4. **日志管理** - 统一的日志记录和分析