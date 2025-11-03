# DCAgent Backend

数据中心线缆管理系统 - 后端服务

## 技术栈

- Node.js + TypeScript
- Express.js
- Prisma ORM (SQLite/PostgreSQL)
- Neo4j 图数据库
- Zod (数据验证)

## 项目结构

```
backend/
├── src/
│   ├── graph/          # Neo4j 图数据库操作
│   │   ├── neo4j.ts
│   │   └── cableGraph.ts
│   ├── routes/         # API 路由
│   │   ├── devices.ts
│   │   └── cables.ts
│   ├── services/       # 业务逻辑层
│   │   ├── deviceService.ts
│   │   └── cableService.ts
│   ├── utils/          # 工具函数
│   │   └── prisma.ts
│   └── index.ts        # 入口文件
├── prisma/
│   └── schema.prisma   # 数据库 Schema
└── package.json
```

## 数据模型

### 关系数据库 (Prisma + SQLite)
- **DataCenter** - 数据中心
- **Room** - 机房
- **Cabinet** - 机柜
- **Device** - 设备
- **Panel** - 面板
- **Port** - 端口
- **Cable** - 线缆（基础信息）

### 图数据库 (Neo4j)
- **Port** 节点 - 端口
- **Panel** 节点 - 面板
- **Cable** 节点 - 线缆
- **CONNECTED_BY** 关系 - 连接关系
- **HAS_PORT** 关系 - 面板拥有端口

## 安装

```bash
# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 编辑 .env 文件，配置数据库连接
# 特别是 Neo4j 的连接信息

# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate
```

## 开发

```bash
# 启动开发服务器（支持热重载）
npm run dev

# 构建
npm run build

# 运行生产版本
npm start

# 打开 Prisma Studio（数据库可视化工具）
npm run prisma:studio
```

## 环境变量

```env
# 关系数据库
DATABASE_URL="file:./dev.db"

# Neo4j 图数据库
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="password"

# 服务器配置
PORT=3000
NODE_ENV=development
```

## API 端点

### 设备管理
- `GET /api/devices` - 获取所有设备
- `GET /api/devices/:id` - 获取设备详情
- `POST /api/devices` - 创建设备
- `PUT /api/devices/:id` - 更新设备
- `DELETE /api/devices/:id` - 删除设备

### 线缆管理
- `GET /api/cables` - 获取所有线缆
- `GET /api/cables/:id` - 获取线缆详情
- `POST /api/cables` - 创建线缆连接
- `PUT /api/cables/:id` - 更新线缆信息
- `DELETE /api/cables/:id` - 删除线缆连接
- `GET /api/cables/port/:portId/connection` - 查询端口连接
- `GET /api/cables/panel/:panelId/connections` - 查询面板所有连接
- `GET /api/cables/panel/:panelId/topology` - 查询网状拓扑

## 核心功能

### 1. 线缆跟踪
- 记录线缆两端的端口连接
- 快速查询端口的另一端
- 查询面板的所有关联面板
- 生成网状拓扑图数据

### 2. 设备管理
- 分层管理：数据中心 → 机房 → 机柜 → 设备
- 设备面板和端口管理
- 端口状态跟踪（可用/占用/预留/故障）

### 3. 图数据库查询
- 利用 Neo4j 进行高效的关系查询
- 支持多层级拓扑遍历
- 快速查找连接路径

## Neo4j 安装

### macOS (使用 Homebrew)
```bash
brew install neo4j
neo4j start
```

### Docker
```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

访问 http://localhost:7474 打开 Neo4j Browser

## 开发注意事项

1. **数据一致性**: 关系数据库和图数据库需要保持同步
2. **端口状态**: 创建线缆时自动更新端口状态为 OCCUPIED
3. **级联删除**: 删除上层对象时会级联删除下层对象
4. **事务处理**: 线缆创建涉及多个操作，需要注意错误处理

## License

MIT
