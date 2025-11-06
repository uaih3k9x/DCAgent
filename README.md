# DCAgent - 数据中心全生命周期管理系统

<div align="center">

**"見えない線を、見える化へ"**

*将看不见的线，变为可见*

</div>

数据中心线缆跟踪与资产管理系统


## 功能特性

### 核心功能

#### 📦 资产管理
- 分层管理：数据中心 → 机房 → 机柜 → 设备
- U位详细跟踪：精确记录每个设备在机柜中的位置
- 设备信息管理：型号、序列号、配置等完整信息
- 批量上架：支持 Excel/CSV 批量导入设备

#### 🔌 连接管理
- 面板管理：6种面板类型（网口、光纤、电源、串口、USB等）
- 端口管理：4种状态（可用、占用、预留、故障）
- 端口批量创建：快速创建标准面板端口
- 端口到端口连接跟踪

#### 📊 可视化
- 线缆拓扑图：基于 React Flow 的交互式拓扑图
- 快速查找线缆另一端
- 面板关联网络可视化
- 支持多种线缆类型（网线、光纤、电源线、DAC、AOC等）
- 节点详情查看与路径高亮

#### ⚡ 电源管理（计划中）
- 电源相位（Phase）跟踪
- 市电/UPS区分
- PDU端口映射
- 电源冗余配置管理

#### 🌐 网络管理（计划中）
- IP地址与端口映射
- VLAN配置记录
- 端口速率和状态
- 网络拓扑可视化

### 计划中的功能

- **SNMP/IPMI集成**: 设备监控数据采集
- **健康追踪**: 设备运行状态监控
- **资产盘点**: 完整的资产清单和统计
- **AI优化布局**: 智能优化机房布局建议
- **全局仪表板**: 一站式纵览整个数据中心

## 技术栈

### 后端
- Node.js + TypeScript
- Express.js
- Prisma ORM
- Neo4j (图数据库)
- SQLite/PostgreSQL

### 前端
- React + TypeScript
- Vite
- Ant Design
- React Flow (拓扑图可视化)

## 项目结构

```
DCAgent/
├── backend/          # 后端服务
├── frontend/         # 前端应用
├── docs/            # 文档
└── docker-compose.yml
```

## 快速开始

📚 **完整的安装和使用指南请查看 [GETTING_STARTED.md](GETTING_STARTED.md)**

### 使用 Docker Compose（最快）

```bash
# 启动所有服务
docker-compose up -d

# 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:3000
# Neo4j: http://localhost:7474
```

### 本地开发

```bash
# 1. 启动 Neo4j (使用 Docker)
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password neo4j:5-community

# 2. 启动后端
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev

# 3. 启动前端
cd frontend
npm install
cp .env.example .env
npm run dev
```

访问 http://localhost:5173 即可使用！

## 使用场景

DCAgent 适用于以下场景：

- 🏢 **企业数据中心**: 管理数百台服务器和成千上万条线缆
- 🏠 **SOHO/小型机房**: 简单的设备和线缆跟踪
- 🔧 **运维团队**: 快速定位故障、规划布线
- 📊 **资产管理**: 完整的设备清单和生命周期追踪
- 🎓 **教学演示**: 理解数据中心基础设施管理

## 项目愿景

DCAgent 的目标是成为一个**全功能的数据中心基础设施管理系统（DCIM）**，帮助从小型 SOHO 机房到大型企业数据中心的各类用户，实现：

1. **可视化管理**: 将复杂的线缆和设备关系可视化
2. **高效运维**: 快速定位问题，减少故障排查时间
3. **智能优化**: 基于AI的布局和资源优化建议
4. **统一平台**: 从物理层到逻辑层的统一管理

## 开发路线图

### ✅ Phase 1 - 基础功能 (已完成)
- 数据模型设计
- 设备管理 API
- 线缆跟踪 API
- 图数据库集成
- 基础前端界面

### ✅ Phase 2 - 基础设施管理 (已完成)
- [x] 数据中心/机房/机柜完整管理
- [x] 设备管理 (CRUD + 级联选择)
- [x] 面板管理 (6种类型)
- [x] 端口管理 (批量创建 + 状态管理)
- [x] API 版本化与统一模式

### ✅ Phase 3 - 可视化与批量操作 (已完成)
- [x] 网状拓扑图可视化 (React Flow)
- [x] 面板编辑增强 (旋转 + 端口组)
- [x] 批量上架助手 (Excel/CSV导入)
- [x] 交互式拓扑图操作
- [x] Beta Release V0.1

### 🚧 Phase 4 - 高级管理功能 (进行中)
- [ ] IP地址管理
- [ ] 电源管理（Phase、UPS）
- [ ] U位可视化
- [ ] 仪表板数据统计

### 📋 Phase 5 - 监控与智能化 (计划中)
- [ ] SNMP集成
- [ ] IPMI监控
- [ ] 实时健康监控
- [ ] 资产盘点功能
- [ ] 报表生成

### 🔮 Phase 6 - 智能化 (未来)
- [ ] AI布局优化
- [ ] 预测性维护
- [ ] 能耗优化建议
- [ ] 自动化运维建议

## 许可证

MIT
