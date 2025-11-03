# DCAgent Frontend

数据中心线缆管理系统 - 前端应用

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design
- React Router
- React Flow (拓扑图可视化)
- Axios
- Zustand (状态管理)

## 项目结构

```
frontend/
├── src/
│   ├── components/      # React 组件
│   │   └── Layout/      # 布局组件
│   ├── pages/           # 页面
│   │   ├── Dashboard.tsx
│   │   ├── DeviceList.tsx
│   │   └── CableTopology.tsx
│   ├── services/        # API 服务
│   │   ├── api.ts
│   │   ├── deviceService.ts
│   │   └── cableService.ts
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 主应用组件
│   ├── main.tsx         # 入口文件
│   └── index.css        # 全局样式
├── public/              # 静态资源
└── index.html           # HTML 模板
```

## 功能特性

### 已实现
- 📊 仪表板概览
- 🖥️ 设备列表展示
- 🎨 响应式布局
- 🌐 API 集成

### 开发中
- 📡 线缆拓扑图可视化
- ➕ 设备/线缆 CRUD 操作
- 🔍 搜索和过滤功能

### 计划中
- 🗺️ 机柜 2D/3D 可视化
- 📈 实时监控仪表板
- 📱 移动端适配
- 🎯 IP 地址管理界面
- ⚡ 电源管理界面

## 安装

```bash
# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env
```

## 开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

开发服务器将运行在 http://localhost:5173

## 环境变量

```env
VITE_API_URL=http://localhost:3000/api
```

## 页面路由

- `/` - 仪表板
- `/devices` - 设备管理
- `/topology` - 线缆拓扑图

## API 集成

所有 API 调用通过 `services/` 目录中的服务模块进行：

```typescript
import { deviceService } from '@/services/deviceService';

// 获取所有设备
const devices = await deviceService.getAll();

// 创建设备
const device = await deviceService.create(data);
```

## 组件开发

使用 Ant Design 组件库构建 UI：

```tsx
import { Button, Table, Card } from 'antd';

function MyComponent() {
  return (
    <Card title="标题">
      <Table dataSource={data} columns={columns} />
    </Card>
  );
}
```

## 类型安全

项目使用 TypeScript 确保类型安全，所有数据模型定义在 `src/types/index.ts`：

```typescript
import { Device, Cable } from '@/types';
```

## License

MIT
