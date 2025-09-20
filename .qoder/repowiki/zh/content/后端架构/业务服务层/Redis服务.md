# Redis服务

<cite>
**Referenced Files in This Document**   
- [redis.ts](file://backend/src/services/redis.ts)
- [logger.ts](file://backend/src/utils/logger.ts)
</cite>

## 目录
1. [简介](#简介)
2. [核心组件](#核心组件)
3. [配置管理](#配置管理)
4. [连接管理](#连接管理)
5. [数据操作](#数据操作)
6. [高级功能](#高级功能)
7. [使用示例](#使用示例)
8. [性能监控与故障排查](#性能监控与故障排查)

## 简介

RedisService 是系统中的核心缓存与分布式协调组件，提供高性能的内存数据存储和分布式锁机制。该服务封装了 Redis 客户端的所有操作，为应用程序提供统一的缓存接口。RedisService 支持多种数据结构操作，包括字符串、哈希、列表、集合和有序集合，并提供了 JSON 序列化支持和分布式锁功能，确保在分布式环境下的数据一致性和并发安全。

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L1-L336)

## 核心组件

RedisService 的核心由 `RedisConfig` 接口和 `RedisService` 类组成。`RedisConfig` 定义了 Redis 连接所需的所有参数，而 `RedisService` 类实现了连接管理、数据操作和分布式协调功能。服务通过环境变量提供默认配置，同时支持运行时传入自定义配置，确保了部署的灵活性和安全性。

```mermaid
classDiagram
class RedisConfig {
+host : string
+port : number
+password? : string
+db? : number
+retryDelayOnFailover? : number
+maxRetriesPerRequest? : number
}
class RedisService {
-client : RedisClientType
-config : RedisConfig
-isConnected : boolean
+constructor(config? : Partial~RedisConfig~)
+connect() : Promise~void~
+disconnect() : Promise~void~
+ping() : Promise~boolean~
+set(key : string, value : string, ttl? : number) : Promise~void~
+get(key : string) : Promise~string | null~
+hSet(key : string, field : string, value : string) : Promise~number~
+hGetAll(key : string) : Promise~Record~string, string~~
+setJSON(key : string, value : any, ttl? : number) : Promise~void~
+getJSON~T~(key : string) : Promise~T | null~
+acquireLock(key : string, ttl : number) : Promise~boolean~
+releaseLock(key : string) : Promise~boolean~
+getConnectionStatus() : object
}
RedisService --> RedisConfig : "使用"
```

**Diagram sources**
- [redis.ts](file://backend/src/services/redis.ts#L3-L10)
- [redis.ts](file://backend/src/services/redis.ts#L12-L333)

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L3-L333)

## 配置管理

### RedisConfig 接口定义

`RedisConfig` 接口定义了 Redis 连接的所有配置参数，包括主机地址、端口、密码、数据库编号以及重连策略。这些配置参数既可以通过构造函数传入，也可以通过环境变量进行设置，提供了灵活的配置方式。

```typescript
export interface RedisConfig {
  host: string
  port: number
  password?: string
  db?: number
  retryDelayOnFailover?: number
  maxRetriesPerRequest?: number
}
```

### 环境变量映射关系

RedisService 通过环境变量提供默认配置，确保在不同部署环境中的一致性。以下是配置参数与环境变量的映射关系：

| 配置参数 | 环境变量 | 默认值 | 说明 |
|---------|---------|-------|------|
| host | REDIS_HOST | localhost | Redis 服务器主机地址 |
| port | REDIS_PORT | 6379 | Redis 服务器端口 |
| password | REDIS_PASSWORD | 无 | Redis 认证密码 |
| db | REDIS_DB | 0 | Redis 数据库编号 |
| retryDelayOnFailover | 无 | 100 | 故障转移时的重试延迟（毫秒） |
| maxRetriesPerRequest | 无 | 3 | 每个请求的最大重试次数 |

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L19-L22)
- [redis.ts](file://backend/src/services/redis.ts#L3-L10)

## 连接管理

### 构造函数与客户端初始化

`RedisService` 的构造函数接收可选的配置对象，优先使用传入的配置，然后回退到环境变量，最后使用默认值。构造函数根据配置创建 Redis 客户端，并设置重连策略。当重试次数达到3次时，将停止重连并记录错误日志。

```mermaid
flowchart TD
Start([RedisService 构造函数]) --> Config["合并配置: <br/>传入配置 → 环境变量 → 默认值"]
Config --> URL["构建 Redis 连接 URL"]
URL --> Client["创建 Redis 客户端实例"]
Client --> Strategy["设置重连策略"]
Strategy --> Events["注册连接事件监听器"]
Events --> End([初始化完成])
subgraph "重连策略"
Strategy --> Check["重试次数 ≥ 3?"]
Check --> |是| Stop["停止重连<br/>记录错误"]
Check --> |否| Delay["延迟 Math.min(retries * 100, 3000) 毫秒"]
end
```

**Diagram sources**
- [redis.ts](file://backend/src/services/redis.ts#L67-L78)

### 连接方法

`connect` 方法负责建立与 Redis 服务器的连接。在连接前会检查当前连接状态，避免重复连接。连接成功后会更新 `isConnected` 状态并记录日志。

```mermaid
sequenceDiagram
participant App as 应用程序
participant RedisService as RedisService
participant RedisClient as Redis客户端
App->>RedisService : connect()
RedisService->>RedisService : 检查 isConnected 状态
alt 未连接
RedisService->>RedisClient : connect()
RedisClient-->>RedisService : 连接成功
RedisService->>RedisService : 设置 isConnected = true
RedisService->>App : Promise resolved
else 已连接
RedisService->>App : 快速返回
end
```

**Diagram sources**
- [redis.ts](file://backend/src/services/redis.ts#L67-L78)

### 断开连接与测试

`disconnect` 方法用于安全地断开与 Redis 服务器的连接，清理资源并更新连接状态。`ping` 方法用于测试连接的可用性，通过发送 PING 命令并验证返回结果来确认连接状态。

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L81-L103)

## 数据操作

### 核心数据操作方法

RedisService 提供了对 Redis 各种数据结构的封装操作，包括字符串、哈希、列表、集合和有序集合。

#### 字符串操作
- `set(key, value, ttl?)`: 设置字符串值，可选 TTL（生存时间）
- `get(key)`: 获取字符串值
- `del(key)`: 删除键
- `exists(key)`: 检查键是否存在
- `expire(key, seconds)`: 设置键的过期时间

#### 哈希操作
- `hSet(key, field, value)`: 在哈希中设置字段值
- `hGet(key, field)`: 获取哈希中字段的值
- `hGetAll(key)`: 获取哈希中所有字段和值
- `hDel(key, field)`: 删除哈希中的字段

```mermaid
flowchart TD
Start([hGetAll 方法]) --> Check["检查键是否存在"]
Check --> |存在| Fetch["调用 client.hGetAll(key)"]
Fetch --> Parse["解析返回结果为 Record<string, string>"]
Parse --> Return["返回哈希对象"]
Check --> |不存在| ReturnNull["返回空对象"]
Return --> End([方法结束])
ReturnNull --> End
style Fetch fill:#f9f,stroke:#333,stroke-width:2px
```

**Diagram sources**
- [redis.ts](file://backend/src/services/redis.ts#L156-L163)
- [redis.ts](file://backend/src/services/redis.ts#L174-L181)

## 高级功能

### JSON 序列化支持

`setJSON` 和 `getJSON` 方法提供了对复杂对象的序列化存储支持。`setJSON` 将任意 JavaScript 对象转换为 JSON 字符串后存储，而 `getJSON` 则从 Redis 中读取 JSON 字符串并解析为原始对象类型。

```mermaid
sequenceDiagram
participant App as 应用程序
participant RedisService as RedisService
participant Redis as Redis服务器
App->>RedisService : setJSON("user : 1", userObj, 3600)
RedisService->>RedisService : JSON.stringify(userObj)
RedisService->>Redis : SETEX "user : 1" 3600 jsonString
Redis-->>RedisService : OK
RedisService-->>App : Promise resolved
App->>RedisService : getJSON~User~("user : 1")
RedisService->>Redis : GET "user : 1"
Redis-->>RedisService : jsonString
RedisService->>RedisService : JSON.parse(jsonString)
RedisService-->>App : User对象
```

**Diagram sources**
- [redis.ts](file://backend/src/services/redis.ts#L277-L293)

### 分布式锁实现

`acquireLock` 和 `releaseLock` 方法实现了基于 Redis 的分布式锁，用于防止多个实例同时执行关键操作。锁的实现使用了 Redis 的 `SET` 命令的 NX（不存在时设置）和 EX（过期时间）选项，确保了锁的原子性和自动释放。

```mermaid
sequenceDiagram
participant App1 as 应用实例1
participant App2 as 应用实例2
participant RedisService as RedisService
participant Redis as Redis服务器
App1->>RedisService : acquireLock("payment : 123")
RedisService->>Redis : SET "lock : payment : 123" "locked" NX EX 30
Redis-->>RedisService : OK
RedisService-->>App1 : true
App2->>RedisService : acquireLock("payment : 123")
RedisService->>Redis : SET "lock : payment : 123" "locked" NX EX 30
Redis-->>RedisService : null
RedisService-->>App2 : false
App1->>RedisService : releaseLock("payment : 123")
RedisService->>Redis : DEL "lock : payment : 123"
Redis-->>RedisService : 1
RedisService-->>App1 : true
```

**Diagram sources**
- [redis.ts](file://backend/src/services/redis.ts#L296-L319)

## 使用示例

### 会话缓存

```typescript
// 存储用户会话
await redis.setJSON(`session:${sessionId}`, sessionData, 3600)

// 获取用户会话
const session = await redis.getJSON<Session>(`session:${sessionId}`)
```

### 实时数据存储

```typescript
// 存储实时交易数据
await redis.hSet('trading:stats', 'volume', totalVolume.toString())
await redis.hSet('trading:stats', 'count', transactionCount.toString())

// 获取所有交易统计
const stats = await redis.hGetAll('trading:stats')
```

### 分布式锁控制

```typescript
// 防止并发支付处理
const lockAcquired = await redis.acquireLock(`payment:${orderId}`, 60)
if (lockAcquired) {
  try {
    // 执行支付处理逻辑
    await processPayment(orderId)
  } finally {
    // 确保释放锁
    await redis.releaseLock(`payment:${orderId}`)
  }
} else {
  // 锁已被其他实例持有，稍后重试
  throw new Error('Payment processing is already in progress')
}
```

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L277-L319)

## 性能监控与故障排查

### 连接状态监控

`getConnectionStatus` 方法提供了当前连接状态的完整信息，包括连接状态、准备状态和配置详情，便于监控和诊断。

```typescript
const status = redis.getConnectionStatus()
console.log('Redis连接状态:', status)
// 输出: { isConnected: true, isReady: true, config: { host: 'localhost', port: 6379, db: 0 } }
```

### 日志记录

RedisService 集成了 winston 日志系统，记录所有关键操作和错误信息。日志级别根据环境变量配置，生产环境使用更严格的日志格式。

```mermaid
flowchart TD
A[Redis操作] --> B{操作成功?}
B --> |是| C["info级别日志: <br/>'Redis连接成功'"]
B --> |否| D["error级别日志: <br/>'Redis操作失败: ...'"]
C --> E[继续执行]
D --> F[抛出异常]
style C fill:#d9ead3,stroke:#333
style D fill:#f4cccc,stroke:#333
```

**Diagram sources**
- [logger.ts](file://backend/src/utils/logger.ts#L86-L92)
- [redis.ts](file://backend/src/services/redis.ts#L67-L78)