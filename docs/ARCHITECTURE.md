# DCAgent 架构设计

## 目录
- [整体架构](#整体架构)
- [技术栈](#技术栈)
- [分层架构](#分层架构)
- [双数据库策略](#双数据库策略)
- [项目结构](#项目结构)
- [核心设计原则](#核心设计原则)

## 整体架构

DCAgent 采用经典的**前后端分离架构**，配合**双数据库策略**（关系数据库 + 图数据库）来处理不同类型的数据查询需求。

```
┌─────────────────────────────────────────────────────────────┐
│                        前端应用                              │
│         React + TypeScript + Ant Design                     │
│              运行在 http://localhost:5173                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        后端服务                              │
│           Express.js + TypeScript + Prisma                  │
│              运行在 http://localhost:3000                    │
└─────────────────────────────────────────────────────────────┘
                    │                   │
         ┌──────────┘                   └──────────┐
         ↓                                          ↓
┌──────────────────┐                      ┌──────────────────┐
│  PostgreSQL      │                      │     Neo4j        │
│  关系数据库       │                      │   图数据库        │
│  (业务数据)       │                      │  (拓扑关系)       │
└──────────────────┘                      └──────────────────┘
```

## 技术栈

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时环境 |
| TypeScript | 5.x | 类型安全 |
| Express.js | 4.x | Web 框架 |
| Prisma | 5.x | ORM（对象关系映射） |
| PostgreSQL | 14+ | 关系数据库 |
| Neo4j | 5.x | 图数据库 |
| Zod | 3.x | 运行时数据验证 |
| Nodemon | 3.x | 开发热重载 |

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2 | UI 框架 |
| TypeScript | 5.3 | 类型系统 |
| Vite | 5.0 | 构建工具 |
| React Router | 6.21 | 路由管理 |
| Ant Design | 5.12 | UI 组件库 |
| React Flow | 11.10 | 拓扑图可视化 |
| i18next | 23.x | 国际化（中/英/日） |
| Axios | 1.6 | HTTP 客户端 |
| xlsx | 0.18 | Excel 导入导出 |

## 分层架构

### 后端分层

后端采用经典的三层架构，职责清晰分离：

```
┌─────────────────────────────────────────────────────────────┐
│                        路由层 (Routes)                       │
│  - 接收 HTTP 请求                                            │
│  - Zod 数据验证                                              │
│  - 调用服务层                                                │
│  - 返回 HTTP 响应                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       服务层 (Services)                      │
│  - 业务逻辑处理                                              │
│  - 数据转换和组装                                            │
│  - 事务管理                                                  │
│  - 调用数据层                                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    数据层 (Prisma/Neo4j)                     │
│  - Prisma Client: 关系数据库操作                             │
│  - Neo4j Driver: 图数据库操作                                │
│  - 数据持久化                                                │
└─────────────────────────────────────────────────────────────┘
```

**目录结构：**
```
backend/src/
├── routes/         # 路由层（13个路由模块）
├── services/       # 服务层（14个服务模块）
├── graph/          # Neo4j 图数据库操作
├── middleware/     # 中间件（日志、错误处理）
├── utils/          # 工具函数
├── constants/      # 常量定义
└── index.ts        # 应用入口
```

### 前端分层

前端采用基于组件的分层架构：

```
┌─────────────────────────────────────────────────────────────┐
│                      页面层 (Pages)                          │
│  - 完整的业务页面                                            │
│  - 路由对应                                                  │
│  - 组装多个组件                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      组件层 (Components)                     │
│  - 可复用的 UI 组件                                          │
│  - 布局组件                                                  │
│  - 业务组件                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      服务层 (Services)                       │
│  - API 调用封装                                              │
│  - 数据转换                                                  │
│  - 错误处理                                                  │
└─────────────────────────────────────────────────────────────┘
```

**目录结构：**
```
frontend/src/
├── pages/          # 页面组件（15个页面）
├── components/     # 公共组件（17个组件）
├── services/       # API 服务层（14个服务）
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数
├── constants/      # 常量定义
├── locales/        # 国际化资源
└── App.tsx         # 路由配置
```

## 双数据库策略

DCAgent 采用双数据库策略，充分发挥不同数据库的优势：

### PostgreSQL - 关系数据库

**用途：**
- 存储结构化业务数据
- ACID 事务保证
- 复杂查询和聚合
- 数据完整性约束

**存储的数据：**
- 数据中心、机房、机柜、设备
- 面板、端口、线缆基础信息
- ShortID 分配记录
- 光模块库存和历史
- 面板模板配置

### Neo4j - 图数据库

**用途：**
- 存储网络拓扑关系
- 多跳路径查询
- 关系遍历
- 网络可视化数据

**存储的数据：**
- Panel 节点
- Port 节点
- Cable 节点
- CONNECTED_BY 关系（端口-线缆-端口）
- HAS_PORT 关系（面板-端口）

### 数据同步策略

**核心原则：** PostgreSQL 为主，Neo4j 为辅

**同步时机：**
1. 创建线缆连接时：同时写入 PostgreSQL 和 Neo4j
2. 删除线缆连接时：同时删除两边的数据
3. 更新端口状态时：只更新 PostgreSQL（Neo4j 存关系，不存状态）

**实现方式：**
- 在服务层（`cableService.ts`）统一处理同步逻辑
- 使用事务保证数据一致性
- 同步失败时回滚 PostgreSQL 操作

**示例代码：**
```typescript
// 创建线缆连接时同步到 Neo4j
async createCable(data) {
  // 1. 在 PostgreSQL 创建记录
  const cable = await prisma.cable.create({ ... });

  try {
    // 2. 同步到 Neo4j
    await cableGraph.createConnection(
      cable.portAId,
      cable.portBId,
      cable.id
    );
  } catch (error) {
    // 3. 同步失败则回滚
    await prisma.cable.delete({ where: { id: cable.id } });
    throw error;
  }

  return cable;
}
```

## 项目结构

### 根目录

```
DCAgent/
├── backend/              # 后端服务
├── frontend/             # 前端应用
├── docs/                 # 文档目录（本文档所在）
├── docker-compose.yml    # Docker Compose 配置
├── README.md             # 项目总览
├── GETTING_STARTED.md    # 快速开始指南
└── CLAUDE.md             # 开发规范
```

### 后端结构

```
backend/
├── src/
│   ├── config/           # 配置文件
│   ├── constants/        # 常量定义
│   ├── graph/            # Neo4j 图数据库
│   │   ├── neo4j.ts      # 连接配置
│   │   └── cableGraph.ts # 线缆拓扑服务
│   ├── middleware/       # 中间件
│   │   └── logger.ts     # 请求/错误日志
│   ├── routes/           # 路由层（13个路由）
│   ├── services/         # 服务层（14个服务）
│   ├── scripts/          # 数据迁移脚本
│   ├── utils/            # 工具函数
│   └── index.ts          # 应用入口
├── prisma/
│   ├── schema.prisma     # 数据库 Schema
│   └── migrations/       # 迁移文件
├── package.json
└── tsconfig.json
```

### 前端结构

```
frontend/
├── src/
│   ├── components/       # 公共组件
│   │   ├── Layout/       # 布局组件
│   │   ├── *Modal.tsx    # 弹窗组件
│   │   ├── *Visualizer.tsx # 可视化组件
│   │   └── *Editor.tsx   # 编辑器组件
│   ├── pages/            # 页面组件（15个）
│   ├── services/         # API 服务层（14个）
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── constants/        # 常量定义
│   ├── locales/          # 国际化资源
│   │   ├── zh-CN/        # 中文
│   │   ├── en-US/        # 英文
│   │   └── ja-JP/        # 日文
│   ├── App.tsx           # 根组件（路由配置）
│   ├── main.tsx          # 应用入口
│   └── i18n.ts           # 国际化配置
├── public/               # 静态资源
├── package.json
└── vite.config.ts
```

## 核心设计原则

### 1. API 设计规范

**统一使用 POST + body 传参：**
```typescript
// 不拼接 URL，所有参数放在 body 中
POST /api/v1/cabinets/get
{
  "id": "cabinet-uuid"
}

// 而不是 GET /api/v1/cabinets/:id
```

**原因：**
- 参数复杂时更灵活
- 避免 URL 编码问题
- 统一的请求格式
- 便于日志记录

### 2. ShortID 分配原则

**只给需要快速访问的实体分配 ShortID：**
- Room（机房）- 需要
- Cabinet（机柜）- 需要
- Panel（面板）- 需要
- CableEndpoint（线缆端点）- 需要

**不分配 ShortID 的实体：**
- DataCenter（入口选择页面，不需要）
- Device（可通过 Cabinet 找到）
- Port（太小贴不了标签）

### 3. 类型安全

**双重类型保障：**
1. **编译时**：TypeScript 类型检查
2. **运行时**：Zod Schema 验证

**示例：**
```typescript
// 1. TypeScript 类型定义
interface CreateCableRequest {
  type: CableType;
  portAId: string;
  portBId: string;
}

// 2. Zod 运行时验证
const createCableSchema = z.object({
  type: z.enum(['CAT5E', 'CAT6', 'FIBER_SM', ...]),
  portAId: z.string().uuid(),
  portBId: z.string().uuid(),
});
```

### 4. 错误处理

**统一的错误处理中间件：**
- 请求日志：记录所有请求的详细信息
- 错误日志：捕获所有错误并记录堆栈
- 自动隐藏敏感字段（password、token、secret）

### 5. 国际化

**支持三种语言：**
- 中文（zh-CN）
- 英文（en-US）
- 日文（ja-JP）

**命名空间划分：**
- common：通用文本
- menu：菜单
- dashboard、dataCenter、room 等：按模块划分

### 6. 热重载开发

**后端：** 使用 nodemon 自动重启
**前端：** 使用 Vite HMR（热模块替换）

**注意：** 修改后端代码后自动生效，无需手动重启

## 下一步

- [数据库设计详解](DATABASE.md)
- [API 完整文档](API.md)
- [ShortID 系统详解](SHORTID.md)
- [线缆管理系统](CABLE_MANAGEMENT.md)
- [前端架构详解](FRONTEND.md)
