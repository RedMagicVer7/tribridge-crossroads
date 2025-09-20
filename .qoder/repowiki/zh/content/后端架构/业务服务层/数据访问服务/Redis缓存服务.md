# Redis缓存服务

<cite>
**Referenced Files in This Document**  
- [redis.ts](file://backend/src/services/redis.ts)
- [index-simple.ts](file://backend/src/index-simple.ts)
</cite>

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构概述](#架构概述)
5. [详细组件分析](#详细组件分析)
6. [依赖分析](#依赖分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)

## 简介
`RedisService` 类是本系统中的核心缓存与分布式协调组件，提供高性能的Redis操作封装。该服务不仅实现了基础的键值存储功能，还集成了分布式锁、复杂对象序列化、多种数据结构操作等高级特性，为跨链支付平台提供可靠的缓存和状态管理能力。

## 项目结构

```mermaid
graph TD
A[backend] --> B[src]
B --> C[services]
C --> D[redis.ts]
B --> E[index-simple.ts]
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts)
- [index-simple.ts](file://backend/src/index-simple.ts)

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts)
- [index-simple.ts](file://backend/src/index-simple.ts)

## 核心组件

`RedisService` 类作为系统的核心缓存服务，封装了Redis客户端的所有操作，提供了类型安全、错误处理和日志记录的完整实现。该服务通过单例模式导出为 `redis` 实例，便于在整个应用中统一使用。

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L12-L333)

## 架构概述

```mermaid
graph TD
A[RedisService] --> B[连接管理]
A --> C[字符串操作]
A --> D[哈希操作]
A --> E[列表操作]
A --> F[集合操作]
A --> G[有序集合操作]
A --> H[JSON序列化]
A --> I[分布式锁]
A --> J[健康检查]
B --> K[连接初始化]
B --> L[重连策略]
B --> M[事件监听]
H --> N[setJSON]
H --> O[getJSON]
I --> P[acquireLock]
I --> Q[releaseLock]
J --> R[ping]
J --> S[getConnectionStatus]
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L12-L333)

## 详细组件分析

### Redis客户端初始化

`RedisService` 的构造函数负责初始化Redis客户端，从环境变量或配置参数中读取连接信息，并构建连接URL。支持密码认证的连接字符串格式，确保连接安全性。

```mermaid
sequenceDiagram
participant RS as RedisService
participant RC as RedisClient
participant L as Logger
RS->>RS : 读取配置(环境变量/参数)
RS->>RS : 构建Redis连接URL
RS->>RC : createClient(url, socket配置)
RC->>RS : 返回客户端实例
RS->>RC : 绑定connect事件
RS->>L : 记录"连接已建立"
RS->>RC : 绑定ready事件
RS->>L : 记录"客户端准备就绪"
RS->>RC : 绑定error事件
RS->>L : 记录连接错误
RS->>RC : 绑定end事件
RS->>L : 记录连接断开
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L17-L64)

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L17-L64)

### 基础字符串操作

`set`、`get`、`del` 方法提供了基础的字符串操作功能，包含完善的异常捕获和日志记录机制。支持可选的TTL参数，通过 `setEx` 方法实现自动过期。

```mermaid
flowchart TD
Start([set方法调用]) --> Validate["验证参数"]
Validate --> CheckTTL{"TTL存在?"}
CheckTTL --> |是| SetEx["调用client.setEx()"]
CheckTTL --> |否| Set["调用client.set()"]
SetEx --> Success["返回Promise"]
Set --> Success
SetEx --> Error["捕获异常"]
Set --> Error
Error --> Log["记录错误日志"]
Log --> Throw["重新抛出异常"]
StartGet([get方法调用]) --> Execute["执行client.get()"]
Execute --> Result{"返回值存在?"}
Result --> |是| Return["返回值"]
Result --> |否| ReturnNull["返回null"]
Execute --> ErrorGet["捕获异常"]
ErrorGet --> LogGet["记录错误日志"]
LogGet --> ThrowGet["重新抛出异常"]
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L106-L126)

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L106-L135)

### 复杂数据结构操作

`RedisService` 提供了对Redis五种主要数据结构的完整支持：

#### 哈希操作
```mermaid
classDiagram
class RedisService {
+hSet(key : string, field : string, value : string) : Promise<number>
+hGet(key : string, field : string) : Promise<string | undefined>
+hGetAll(key : string) : Promise<Record<string, string>>
+hDel(key : string, field : string) : Promise<number>
}
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L156-L163)

#### 列表操作
```mermaid
classDiagram
class RedisService {
+lPush(key : string, value : string) : Promise<number>
+rPop(key : string) : Promise<string | null>
+lLen(key : string) : Promise<number>
}
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L193-L200)

#### 集合操作
```mermaid
classDiagram
class RedisService {
+sAdd(key : string, member : string) : Promise<number>
+sMembers(key : string) : Promise<string[]>
+sRem(key : string, member : string) : Promise<number>
}
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L221-L228)

#### 有序集合操作
```mermaid
classDiagram
class RedisService {
+zAdd(key : string, score : number, member : string) : Promise<number>
+zRange(key : string, start : number, stop : number) : Promise<string[]>
+zRem(key : string, member : string) : Promise<number>
}
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L249-L256)

### JSON序列化支持

`setJSON` 和 `getJSON` 方法提供了对复杂对象的序列化支持，自动处理JSON转换和解析容错。

```mermaid
sequenceDiagram
participant App as 应用程序
participant RS as RedisService
participant Client as Redis客户端
App->>RS : setJSON(key, object, ttl)
RS->>RS : JSON.stringify(object)
RS->>RS : 调用set方法
RS->>Client : 存储JSON字符串
Client-->>RS : 操作结果
RS-->>App : 返回Promise
App->>RS : getJSON(key)
RS->>Client : get(key)
Client-->>RS : JSON字符串
RS->>RS : 检查值是否存在
RS->>RS : JSON.parse(字符串)
RS-->>App : 返回解析后的对象
RS->>RS : 解析失败时记录错误
RS-->>App : 返回null
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L277-L293)

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L277-L293)

### 分布式锁实现

`acquireLock` 和 `releaseLock` 方法基于Redis的SET命令实现了分布式锁，保证了锁的原子性和自动过期。

```mermaid
sequenceDiagram
participant App as 应用程序
participant RS as RedisService
participant Client as Redis客户端
App->>RS : acquireLock("payment : 123", 30)
RS->>RS : 构建锁键"lock : payment : 123"
RS->>Client : set(锁键, "locked", {EX : 30, NX : true})
Client-->>RS : 返回结果
RS->>RS : 检查结果是否为"OK"
RS-->>App : 返回true/false
App->>RS : releaseLock("payment : 123")
RS->>RS : 构建锁键"lock : payment : 123"
RS->>Client : del(锁键)
Client-->>RS : 返回删除数量
RS->>RS : 检查数量是否大于0
RS-->>App : 返回true/false
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L296-L319)

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L296-L319)

### 健康检查机制

`ping` 和 `getConnectionStatus` 方法提供了系统监控所需的健康检查功能。

```mermaid
classDiagram
class RedisService {
+ping() : Promise<boolean>
+getConnectionStatus() : ConnectionStatus
}
class ConnectionStatus {
+isConnected : boolean
+isReady : boolean
+config : RedisConfig
}
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts#L95-L103)
- [redis.ts](file://backend/src/services/redis.ts#L322-L332)

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts#L95-L103)
- [redis.ts](file://backend/src/services/redis.ts#L322-L332)

## 依赖分析

```mermaid
graph LR
A[RedisService] --> B[redis npm包]
A --> C[logger工具]
A --> D[环境变量]
E[index-simple.ts] --> A[RedisService]
E --> F[redis实例]
```

**Diagram sources**  
- [redis.ts](file://backend/src/services/redis.ts)
- [index-simple.ts](file://backend/src/index-simple.ts)

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts)
- [index-simple.ts](file://backend/src/index-simple.ts)

## 性能考虑

`RedisService` 在设计上充分考虑了性能因素：
- 使用连接池复用连接，减少连接开销
- 异步非阻塞I/O操作，避免阻塞主线程
- 批量操作支持，减少网络往返
- 合理的重连策略，避免频繁重连造成资源浪费
- 错误处理机制，防止异常导致服务崩溃

## 故障排除指南

常见问题及解决方案：

1. **连接失败**：检查环境变量 `REDIS_HOST`、`REDIS_PORT`、`REDIS_PASSWORD` 是否正确配置
2. **认证失败**：确认密码正确且Redis服务器允许远程连接
3. **性能下降**：检查网络延迟，考虑使用连接池优化
4. **内存溢出**：设置合理的TTL，定期清理过期数据
5. **序列化错误**：确保存储的对象可以被JSON.stringify序列化

**Section sources**
- [redis.ts](file://backend/src/services/redis.ts)
- [index-simple.ts](file://backend/src/index-simple.ts)

## 结论

`RedisService` 类为系统提供了稳定、高效的缓存和分布式协调能力。通过封装Redis客户端的复杂性，提供了简洁易用的API接口。其完善的错误处理、日志记录和监控功能，确保了服务的可靠性和可维护性。在实际应用中，可广泛用于会话缓存、限流控制、交易状态暂存等场景，显著提升系统性能和用户体验。