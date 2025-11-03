# DCAgent 快速开始指南

## 前置要求

在开始之前，请确保你的系统已安装以下软件：

- **Node.js** 18+ ([下载](https://nodejs.org/))
- **npm** 或 **yarn** 或 **pnpm**
- **Neo4j** 5+ ([下载](https://neo4j.com/download/))
  - 或使用 Docker 运行 Neo4j

## 方式一：本地开发（推荐用于开发）

### 1. 安装 Neo4j

#### macOS (使用 Homebrew)
```bash
brew install neo4j
neo4j start
```

#### 使用 Docker
```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5-community
```

访问 http://localhost:7474 打开 Neo4j Browser，使用 `neo4j/password` 登录。

### 2. 安装后端依赖

```bash
cd backend
npm install

# 复制环境变量配置
cp .env.example .env

# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate
```

### 3. 启动后端服务

```bash
cd backend
npm run dev
```

后端服务将运行在 http://localhost:3000

访问 http://localhost:3000/health 检查服务状态。

### 4. 安装前端依赖

```bash
cd frontend
npm install

# 复制环境变量配置
cp .env.example .env
```

### 5. 启动前端服务

```bash
cd frontend
npm run dev
```

前端应用将运行在 http://localhost:5173

## 方式二：使用 Docker Compose（推荐用于快速体验）

### 1. 启动所有服务

```bash
# 在项目根目录执行
docker-compose up -d
```

这将启动：
- Neo4j (端口 7474, 7687)
- 后端服务 (端口 3000)
- 前端服务 (端口 5173)

### 2. 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:3000/api
- Neo4j Browser: http://localhost:7474

### 3. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f neo4j
```

### 4. 停止服务

```bash
docker-compose down
```

## 初始化数据

### 使用 Prisma Studio 管理数据

```bash
cd backend
npm run prisma:studio
```

这将打开 Prisma Studio 在 http://localhost:5555，你可以在这里：
- 添加数据中心 (DataCenter)
- 添加机房 (Room)
- 添加机柜 (Cabinet)
- 添加设备 (Device)
- 添加面板和端口 (Panel, Port)

### API 测试

使用 curl 或 Postman 测试 API：

```bash
# 健康检查
curl http://localhost:3000/health

# 获取所有设备
curl http://localhost:3000/api/devices

# 创建设备
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Server-01",
    "type": "SERVER",
    "model": "Dell PowerEdge R740",
    "cabinetId": "your-cabinet-id"
  }'
```

## 开发工作流

### 1. 修改数据模型

编辑 `backend/prisma/schema.prisma`，然后运行：

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### 2. 添加新的 API 端点

1. 在 `backend/src/services/` 创建服务
2. 在 `backend/src/routes/` 创建路由
3. 在 `backend/src/index.ts` 注册路由

### 3. 添加前端页面

1. 在 `frontend/src/pages/` 创建页面组件
2. 在 `frontend/src/App.tsx` 添加路由
3. 在 `frontend/src/components/Layout/AppSidebar.tsx` 添加菜单项

## 常见问题

### Neo4j 连接失败

检查 Neo4j 是否正在运行：
```bash
# 如果使用 Homebrew
neo4j status

# 如果使用 Docker
docker ps | grep neo4j
```

### Prisma 迁移失败

删除数据库并重新迁移：
```bash
cd backend
rm prisma/dev.db
npm run prisma:migrate
```

### 端口被占用

修改端口配置：
- 后端: 编辑 `backend/.env` 中的 `PORT`
- 前端: 编辑 `frontend/vite.config.ts` 中的 `server.port`

## 下一步

- 📖 查看 [后端 README](backend/README.md) 了解后端详情
- 🎨 查看 [前端 README](frontend/README.md) 了解前端详情
- 📝 查看 [dcagent.md](dcagent.md) 了解功能规划

## 需要帮助？

如有问题，请查看：
- 后端日志
- 前端浏览器控制台
- Neo4j Browser 查询结果

祝你使用愉快！ 🚀
