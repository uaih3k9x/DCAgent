# DCAgent 开发待办清单

## 🚀 当前状态
不许使用Emoji

### ✅ 已完成 (Phase 1)

- [x] 项目基础结构搭建
- [x] 后端框架配置 (Express + TypeScript)
- [x] Prisma 数据模型设计
- [x] Neo4j 图数据库集成
- [x] 设备管理 API (CRUD)
- [x] 线缆跟踪 API
- [x] 图数据库查询服务
- [x] 前端框架配置 (React + Vite + Ant Design)
- [x] 基础页面和布局
- [x] Docker Compose 配置
- [x] 项目文档

## 📋 下一步要做的事情

### 🔴 优先级 1 - 立即要做

#### 1. 安装依赖并运行项目
```bash
# 安装 Neo4j
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password neo4j:5-community

# 后端
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev

# 前端
cd frontend
npm install
cp .env.example .env
npm run dev
```

#### 2. 验证基础功能
- [ ] 访问 http://localhost:5173 检查前端
- [ ] 访问 http://localhost:3000/health 检查后端
- [ ] 访问 http://localhost:7474 检查 Neo4j
- [ ] 使用 Prisma Studio 添加测试数据
- [ ] 测试设备列表页面

### 🟡 优先级 2 - 核心功能扩展

#### 3. IP地址管理功能
- [ ] 扩展 Device 模型添加 IP 字段
  ```prisma
  ipAddresses  String[]  // 设备的所有IP
  managementIp String?   // 管理IP
  ```
- [ ] 扩展 Port 模型添加网络字段
  ```prisma
  ipAddress String?
  vlan      String?
  speed     String?  // 1G, 10G, 25G等
  ```
- [ ] 创建 IP 管理 API
- [ ] 创建 IP 管理前端页面
- [ ] 添加 IP 地址与端口映射展示

#### 4. 电源管理功能
- [ ] 扩展 Device 模型添加电源字段
  ```prisma
  powerPhase  String?  // L1, L2, L3
  powerSource PowerSource?  // MAINS, UPS
  ```
- [ ] 创建 PowerSource 枚举
- [ ] 创建电源连接 API
- [ ] 创建电源管理前端页面
- [ ] PDU 端口映射功能

#### 5. 数据中心/机房/机柜管理
- [ ] 创建 DataCenter CRUD API
- [ ] 创建 Room CRUD API
- [ ] 创建 Cabinet CRUD API
- [ ] 创建面板 (Panel) CRUD API
- [ ] 创建端口 (Port) CRUD API
- [ ] 前端管理界面

#### 6. 设备管理完善
- [ ] 完善设备创建表单
- [ ] 完善设备编辑功能
- [ ] 添加设备删除确认
- [ ] 设备搜索和过滤
- [ ] 设备详情页面

#### 7. 线缆管理完善
- [ ] 线缆列表页面
- [ ] 创建线缆连接表单
- [ ] 编辑线缆信息
- [ ] 删除线缆连接
- [ ] 查看线缆两端端口

### 🟢 优先级 3 - 可视化功能

#### 8. 网状拓扑图可视化 (React Flow)
- [ ] 安装 React Flow 依赖
- [ ] 创建拓扑图组件
- [ ] 从 API 获取拓扑数据
- [ ] 将数据转换为 React Flow 格式
- [ ] 实现节点和边的自定义样式
- [ ] 添加交互功能：
  - [ ] 点击节点查看详情
  - [ ] 高亮选中路径
  - [ ] 搜索节点
  - [ ] 缩放和平移
  - [ ] 导出拓扑图

#### 9. U位可视化
- [ ] 创建 2D 机柜视图组件
- [ ] 显示机柜 U 位网格
- [ ] 显示设备在机柜中的位置
- [ ] 设备占用 U 位高亮
- [ ] 拖拽调整设备位置
- [ ] 显示设备信息卡片

#### 10. 仪表板数据统计
- [ ] 实现设备统计 API
- [ ] 实现线缆统计 API
- [ ] 实现端口占用率统计
- [ ] 更新仪表板数据展示
- [ ] 添加图表展示 (ECharts)

### 🔵 优先级 4 - 高级功能

#### 11. SNMP 集成
- [ ] 研究 SNMP 库 (net-snmp)
- [ ] 创建 SNMP 服务
- [ ] 设备 SNMP 配置管理
- [ ] 定时采集设备数据
- [ ] 存储监控数据
- [ ] 展示监控数据

#### 12. IPMI 集成
- [ ] 研究 IPMI 库
- [ ] 创建 IPMI 服务
- [ ] 设备 IPMI 配置管理
- [ ] 获取设备健康状态
- [ ] 电源管理功能
- [ ] 远程控制功能

#### 13. 资产盘点功能
- [ ] 二维码生成功能
- [ ] 二维码扫描功能
- [ ] 盘点清单管理
- [ ] 盘点报告生成
- [ ] 差异对比

#### 14. 报表功能
- [ ] 设备清单报表
- [ ] 线缆连接报表
- [ ] IP 地址分配报表
- [ ] 端口使用率报表
- [ ] 导出为 Excel/PDF

### 🟣 优先级 5 - 智能化

#### 15. AI 布局优化
- [ ] 收集布局数据
- [ ] 训练优化模型
- [ ] 布局建议 API
- [ ] 前端展示建议
- [ ] 应用优化方案

## 🎯 重启后立即执行的任务

1. **安装并运行 Neo4j**
   ```bash
   docker run -d --name neo4j -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/password neo4j:5-community
   ```

2. **安装后端依赖**
   ```bash
   cd backend
   npm install
   ```

3. **配置后端环境**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，确认 Neo4j 连接信息
   ```

4. **初始化数据库**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **启动后端**
   ```bash
   npm run dev
   ```

6. **在新终端安装前端依赖**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   ```

7. **启动前端**
   ```bash
   npm run dev
   ```

8. **验证服务**
   - 前端: http://localhost:5173
   - 后端: http://localhost:3000/health
   - Neo4j: http://localhost:7474

## 📝 技术债务

- [ ] 添加错误处理中间件
- [ ] 添加请求日志
- [ ] 添加数据验证
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 添加 API 文档 (Swagger)
- [ ] 性能优化
- [ ] 安全加固

## 🐛 已知问题

目前暂无

## 💡 想法和改进

- 考虑添加用户认证和权限管理
- 考虑添加操作审计日志
- 考虑添加数据备份功能
- 考虑添加多租户支持
- 考虑移动端适配

---

**更新日期**: 2025-11-03
**当前 Phase**: Phase 1 完成，准备进入 Phase 2
