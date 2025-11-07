# DCAgent 开发待办清单

## 当前状态

### 已完成 (Phase 1)

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

### 已完成 (Phase 2 - 2025-11-04)

- [x] 修复前端图标导入问题
  - [x] AppSidebar.tsx - ServerOutlined -> DatabaseOutlined
  - [x] Dashboard.tsx - ServerOutlined -> CloudServerOutlined
- [x] API 版本化 (改为 /api/v1 格式)
- [x] API 设计模式统一
  - [x] 只使用 POST/GET 方法 (不使用 PUT/DELETE)
  - [x] 所有参数通过 body JSON 传递 (包括 ID)
  - [x] 统一路由模式: GET / (列表), POST /get (详情), POST /create, POST /update, POST /delete
- [x] 数据中心管理 (DataCenter)
  - [x] dataCenterService.ts - 服务层
  - [x] datacenters.ts - 路由层
  - [x] dataCenterService.ts (前端) - API 调用层
  - [x] DataCenterList.tsx - 前端页面
  - [x] 完整 CRUD + 搜索功能
- [x] 机房管理 (Room)
  - [x] roomService.ts - 服务层
  - [x] rooms.ts - 路由层
  - [x] roomService.ts (前端) - API 调用层
  - [x] RoomList.tsx - 前端页面
  - [x] 完整 CRUD + 搜索功能
  - [x] 按数据中心过滤
- [x] 机柜管理 (Cabinet)
  - [x] cabinetService.ts - 服务层
  - [x] cabinets.ts - 路由层
  - [x] cabinetService.ts (前端) - API 调用层
  - [x] CabinetList.tsx - 前端页面
  - [x] 完整 CRUD + 搜索功能
  - [x] 按机房过滤
  - [x] 级联选择器 (数据中心 -> 机房)
- [x] 设备管理 API 重构
  - [x] devices.ts - 更新为统一的 API 模式
  - [x] deviceService.ts (前端) - 更新 API 调用
- [x] 线缆管理 API 重构
  - [x] cables.ts - 更新为统一的 API 模式
  - [x] cableService.ts (前端) - 更新 API 调用
- [x] 面板管理 (Panel)
  - [x] panelService.ts - 服务层
  - [x] panels.ts - 路由层
  - [x] panelService.ts (前端) - API 调用层
  - [x] PanelList.tsx - 前端页面
  - [x] 完整 CRUD + 搜索功能
  - [x] 6种面板类型支持 (ETHERNET, FIBER, POWER, SERIAL, USB, OTHER)
  - [x] 按设备和类型过滤
- [x] 端口管理 (Port)
  - [x] portService.ts - 服务层
  - [x] ports.ts - 路由层
  - [x] portService.ts (前端) - API 调用层
  - [x] PortList.tsx - 前端页面
  - [x] 完整 CRUD + 搜索功能
  - [x] 4种端口状态支持 (AVAILABLE, OCCUPIED, RESERVED, FAULTY)
  - [x] 批量创建端口功能
  - [x] 表格内快速切换端口状态
  - [x] 按面板和状态过滤
- [x] 前端路由和导航更新
  - [x] App.tsx - 添加面板和端口路由
  - [x] AppSidebar.tsx - 添加"连接管理"菜单组

### 已完成 (Phase 3 - 2025-11-05/06)

- [x] 线缆拓扑可视化
  - [x] 实现 React Flow 拓扑图展示
  - [x] 端口连接关系可视化
  - [x] 交互式拓扑图操作
- [x] 面板编辑增强
  - [x] 支持面板旋转功能
  - [x] 端口组添加能力
  - [x] 修复已知 bug
- [x] 批量上架助手 (Bulk Deployment)
  - [x] BulkImportModal 通用组件
  - [x] Excel/CSV 文件解析和验证
  - [x] 批量创建设备 API (POST /api/v1/devices/bulk-create)
  - [x] 批量创建设备前端界面
  - [x] 数据验证和错误提示
  - [x] 模板下载功能
  - [x] 批量上架助手使用文档

## 下一步要做的事情

### 优先级 1 - 核心功能继续扩展

#### 1. 面板和端口管理 ✅ 已完成
- [x] 创建 Panel CRUD API
- [x] 创建 Port CRUD API
- [x] 面板类型管理 (ETHERNET, FIBER, POWER 等)
- [x] 端口状态管理 (AVAILABLE, OCCUPIED, RESERVED, FAULTY)
- [x] 前端管理界面
- [x] 批量创建端口功能

#### 2. 数据中心管理前端界面 ✅ 已完成
- [x] 数据中心列表页面
- [x] 创建/编辑数据中心表单
- [x] 机房列表页面
- [x] 创建/编辑机房表单
- [x] 机柜列表页面
- [x] 创建/编辑机柜表单
- [x] 级联选择和过滤功能 (数据中心 -> 机房 -> 机柜 -> 设备)

#### 3. 设备管理完善
- [ ] 完善设备创建表单 (关联到机柜)
- [ ] 完善设备编辑功能
- [ ] 添加设备删除确认
- [ ] 设备搜索和过滤
- [ ] 设备详情页面
- [ ] 显示设备所在位置 (数据中心 -> 机房 -> 机柜)

#### 4. 添加测试数据
- [ ] 使用 Prisma Studio 添加测试数据中心
- [ ] 添加测试机房
- [ ] 添加测试机柜
- [ ] 添加测试设备
- [ ] 测试所有 API 端点

### 优先级 2 - IP和电源管理

#### 5. IP地址管理功能
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

#### 6. 电源管理功能
- [ ] 扩展 Device 模型添加电源字段
  ```prisma
  powerPhase  String?  // L1, L2, L3
  powerSource PowerSource?  // MAINS, UPS
  ```
- [ ] 创建 PowerSource 枚举
- [ ] 创建电源连接 API
- [ ] 创建电源管理前端页面
- [ ] PDU 端口映射功能

#### 7. 线缆管理完善
- [ ] 线缆列表页面
- [ ] 创建线缆连接表单
- [ ] 编辑线缆信息
- [ ] 删除线缆连接
- [ ] 查看线缆两端端口

### 优先级 3 - 可视化功能

#### 8. 网状拓扑图可视化 (React Flow) ✅ 已完成
- [x] 安装 React Flow 依赖
- [x] 创建拓扑图组件
- [x] 从 API 获取拓扑数据
- [x] 将数据转换为 React Flow 格式
- [x] 实现节点和边的自定义样式
- [x] 添加交互功能：
  - [x] 点击节点查看详情
  - [x] 高亮选中路径
  - [x] 搜索节点
  - [x] 缩放和平移
  - [x] 导出拓扑图

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

### 优先级 4 - 高级功能

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

### 优先级 5 - 智能化

#### 15. AI 布局优化
- [ ] 收集布局数据
- [ ] 训练优化模型
- [ ] 布局建议 API
- [ ] 前端展示建议
- [ ] 应用优化方案

## 重启后立即执行的任务

1. **启动数据库**
   ```bash
   docker ps  # 检查 Neo4j 和 PostgreSQL 是否运行
   ```

2. **启动后端**
   ```bash
   cd backend
   npm run dev
   ```

3. **启动前端**
   ```bash
   cd frontend
   npm run dev
   ```

4. **验证服务**
   - 前端: http://localhost:5174
   - 后端: http://localhost:3000/health
   - API 文档: http://localhost:3000/api/v1
   - Neo4j: http://localhost:7474

## API 端点清单

### v1 API (当前 - 统一模式)

**API 设计原则:**
- 只使用 GET 和 POST 方法
- 所有参数通过 body JSON 传递 (包括 ID)
- 统一路由模式

**数据中心 (DataCenter)**
- GET /api/v1/datacenters - 列表
- GET /api/v1/datacenters?search=query - 搜索
- POST /api/v1/datacenters/get - 获取详情 (body: {id})
- POST /api/v1/datacenters/create - 创建 (body: {name, location})
- POST /api/v1/datacenters/update - 更新 (body: {id, name?, location?})
- POST /api/v1/datacenters/delete - 删除 (body: {id})

**机房 (Room)**
- GET /api/v1/rooms - 列表
- GET /api/v1/rooms?dataCenterId=xxx - 按数据中心过滤
- GET /api/v1/rooms?search=query - 搜索
- POST /api/v1/rooms/get - 获取详情 (body: {id})
- POST /api/v1/rooms/create - 创建 (body: {name, floor?, dataCenterId})
- POST /api/v1/rooms/update - 更新 (body: {id, name?, floor?})
- POST /api/v1/rooms/delete - 删除 (body: {id})

**机柜 (Cabinet)**
- GET /api/v1/cabinets - 列表
- GET /api/v1/cabinets?roomId=xxx - 按机房过滤
- GET /api/v1/cabinets?search=query - 搜索
- POST /api/v1/cabinets/get - 获取详情 (body: {id})
- POST /api/v1/cabinets/create - 创建 (body: {name, position?, height?, roomId})
- POST /api/v1/cabinets/update - 更新 (body: {id, name?, position?, height?})
- POST /api/v1/cabinets/delete - 删除 (body: {id})

**设备 (Device)**
- GET /api/v1/devices - 列表
- GET /api/v1/devices?cabinetId=xxx - 按机柜过滤
- GET /api/v1/devices?search=query - 搜索
- POST /api/v1/devices/get - 获取详情 (body: {id})
- POST /api/v1/devices/create - 创建 (body: {name, type, model?, serialNo?, uPosition?, uHeight?, cabinetId})
- POST /api/v1/devices/update - 更新 (body: {id, ...})
- POST /api/v1/devices/delete - 删除 (body: {id})
- POST /api/v1/devices/bulk-create - 批量创建 (body: {devices: [...]})

**面板 (Panel)**
- GET /api/v1/panels - 列表
- GET /api/v1/panels?deviceId=xxx - 按设备过滤
- GET /api/v1/panels?type=xxx - 按类型过滤
- GET /api/v1/panels?search=query - 搜索
- POST /api/v1/panels/get - 获取详情 (body: {id})
- POST /api/v1/panels/create - 创建 (body: {name, type, deviceId})
- POST /api/v1/panels/update - 更新 (body: {id, name?, type?})
- POST /api/v1/panels/delete - 删除 (body: {id})

**端口 (Port)**
- GET /api/v1/ports - 列表
- GET /api/v1/ports?panelId=xxx - 按面板过滤
- GET /api/v1/ports?status=xxx - 按状态过滤
- GET /api/v1/ports?search=query - 搜索
- POST /api/v1/ports/get - 获取详情 (body: {id})
- POST /api/v1/ports/create - 创建 (body: {number, label?, status?, panelId})
- POST /api/v1/ports/create-bulk - 批量创建 (body: {panelId, count, prefix?})
- POST /api/v1/ports/update - 更新 (body: {id, number?, label?, status?})
- POST /api/v1/ports/update-status - 更新状态 (body: {id, status})
- POST /api/v1/ports/delete - 删除 (body: {id})
- POST /api/v1/ports/available - 获取可用端口 (body: {panelId})

**线缆 (Cable)**
- GET /api/v1/cables - 列表
- POST /api/v1/cables/get - 获取详情 (body: {id})
- POST /api/v1/cables/create - 创建 (body: {label?, type, length?, color?, notes?, portAId, portBId})
- POST /api/v1/cables/update - 更新 (body: {id, ...})
- POST /api/v1/cables/delete - 删除 (body: {id})
- POST /api/v1/cables/port-connection - 获取端口连接 (body: {portId})
- POST /api/v1/cables/panel-connections - 获取面板连接 (body: {panelId})
- POST /api/v1/cables/network-topology - 获取网络拓扑 (body: {panelId, depth?})

## 技术债务

- [ ] 添加错误处理中间件
- [ ] 添加请求日志
- [ ] 添加数据验证
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 添加 API 文档 (Swagger)
- [ ] 性能优化
- [ ] 安全加固

## 已知问题

- ✅ 前端图标问题已修复 (ServerOutlined 不存在)
- 后端启动时需要确保端口 3000 未被占用

## 当前服务状态

### 运行中的服务
- ✅ PostgreSQL 数据库 (端口 5432)
- ✅ Neo4j 图数据库 (端口 7474, 7687)
- ✅ 后端服务 (http://localhost:3000)
- ✅ 前端服务 (http://localhost:5173)

### 可用的功能
- ✅ 数据中心 CRUD
- ✅ 机房 CRUD (支持按数据中心过滤)
- ✅ 机柜 CRUD (支持按机房过滤)
- ✅ 设备 CRUD (支持按机柜过滤 + 批量导入)
- ✅ 面板 CRUD (支持按设备和类型过滤 + 面板旋转 + 端口组)
- ✅ 端口 CRUD (支持批量创建、状态管理、按面板和状态过滤)
- ✅ 线缆拓扑可视化 (React Flow + 交互操作)

## 想法和改进

- 考虑添加用户认证和权限管理
- 考虑添加操作审计日志
- 考虑添加数据备份功能
- 考虑添加多租户支持
- 考虑移动端适配

---

**更新日期**: 2025-11-06
**当前 Phase**: Phase 3 完成 - 可视化与批量操作

**最近更新** (2025-11-05/06):
- ✅ 完成线缆拓扑可视化 (React Flow + 交互操作)
- ✅ 面板编辑增强 (旋转 + 端口组)
- ✅ 批量上架助手功能完成
  - BulkImportModal 通用组件
  - Excel/CSV 解析和验证
  - 批量创建设备 API
  - 完整使用文档
- ✅ Beta Release V0.1 发布

**下一阶段重点 (Phase 4)**:
1. 完善机柜 U 位可视化
2. 实现仪表板数据统计
3. IP地址管理功能
4. 电源管理功能
5. 用户认证和权限管理



后续建议
1. 创建全局 shortID 分配服务
创建一个后端服务来统一分配 shortID：
// backend/src/services/globalShortIdService.ts
class GlobalShortIdService {
  async allocateShortId(entityType: EntityType, entityId: string): Promise<number> {
    // 1. 获取下一个 shortId
    const sequence = await prisma.globalShortIdSequence.findFirst();
    const nextShortId = sequence.currentValue;

    // 2. 更新序列
    await prisma.globalShortIdSequence.update({
      where: { id: sequence.id },
      data: { currentValue: nextShortId + 1 }
    });

    // 3. 记录分配
    await prisma.globalShortIdAllocation.create({
      data: {
        shortId: nextShortId,
        entityType,
        entityId
      }
    });

    // 4. 更新实体表
    await this.updateEntityShortId(entityType, entityId, nextShortId);

    return nextShortId;
  }
}
2. 修改创建实体的逻辑
在创建 Room、Cabinet、Panel 时自动分配 shortID：
// 创建机房时
const room = await prisma.room.create({ data: { name, ... } });
const shortId = await globalShortIdService.allocateShortId('Room', room.id);
好啦！摸摸你，现在你可以：
运行 npx prisma migrate dev 生成迁移
执行我写的 SQL 脚本清理数据
检查结果是否正确
如果遇到问题随时告诉我呀~