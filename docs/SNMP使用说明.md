# SNMP 客户端使用说明

## 概述

SNMP (Simple Network Management Protocol) 客户端用于从网络设备和服务器的 BMC (Baseboard Management Controller) 获取监控数据。

## 功能特性

- 标准 SNMP v2c 支持
- 系统信息采集（主机名、运行时间、位置等）
- 网络接口信息采集
- Dell iDRAC BMC 信息采集
- 温度传感器读取
- 支持自定义 OID 查询

## 快速开始

### 测试 SNMP 连接

```bash
cd backend
npm run test:snmp -- <IP地址> [community]
```

示例：
```bash
# 使用默认 community (public)
npm run test:snmp -- 192.168.1.100

# 指定 community
npm run test:snmp -- 192.168.1.100 mycommunity
```

### 在代码中使用

```typescript
import { createSNMPClient } from './services/snmpService';

// 创建 SNMP 客户端
const snmpClient = createSNMPClient({
  host: '192.168.1.100',
  community: 'public',
  version: 2, // SNMPv2c
  timeout: 5000,
  retries: 1,
});

// 获取系统信息
const systemInfo = await snmpClient.getSystemInfo();
console.log(systemInfo);

// 获取网络接口
const interfaces = await snmpClient.getNetworkInterfaces();
console.log(interfaces);

// 获取 Dell BMC 信息
const bmcInfo = await snmpClient.getDellBMCInfo();
console.log(bmcInfo);

// 获取温度传感器
const temperatures = await snmpClient.getTemperatureSensors();
console.log(temperatures);

// 自定义 OID 查询
const result = await snmpClient.get('1.3.6.1.2.1.1.1.0');
console.log(result);

// 遍历 OID 树
const walkResult = await snmpClient.walk('1.3.6.1.2.1.2.2.1');
console.log(walkResult);

// 关闭连接
snmpClient.close();
```

## 常用 OID 参考

### 系统信息
- `1.3.6.1.2.1.1.1.0` - 系统描述 (sysDescr)
- `1.3.6.1.2.1.1.5.0` - 系统名称 (sysName)
- `1.3.6.1.2.1.1.6.0` - 系统位置 (sysLocation)
- `1.3.6.1.2.1.1.3.0` - 系统运行时间 (sysUpTime)

### 网络接口
- `1.3.6.1.2.1.2.1.0` - 接口数量 (ifNumber)
- `1.3.6.1.2.1.2.2.1.2` - 接口描述 (ifDescr)
- `1.3.6.1.2.1.2.2.1.5` - 接口速度 (ifSpeed)
- `1.3.6.1.2.1.2.2.1.8` - 接口状态 (ifOperStatus)

### Dell iDRAC 特定 OID
- `1.3.6.1.4.1.674.10892.5.1.3.12.0` - 系统型号
- `1.3.6.1.4.1.674.10892.5.1.3.2.0` - 服务标签
- `1.3.6.1.4.1.674.10892.5.4.700.20.1.6` - 温度传感器读数

## 配置服务器 SNMP

### Linux (Ubuntu/Debian)

1. 安装 SNMP 服务
```bash
sudo apt-get update
sudo apt-get install snmpd
```

2. 配置 SNMP
```bash
sudo nano /etc/snmp/snmpd.conf
```

添加或修改以下内容：
```
# 监听所有网络接口
agentAddress udp:161

# 设置 community
rocommunity public default
rocommunity mycommunity default

# 系统信息
sysLocation    "Data Center 1, Rack A1"
sysContact     "admin@example.com"
```

3. 重启服务
```bash
sudo systemctl restart snmpd
sudo systemctl enable snmpd
```

### Dell iDRAC

1. 登录 iDRAC Web 界面
2. 导航到: iDRAC Settings → Network → SNMP
3. 启用 SNMP Agent
4. 设置 Community String (默认通常是 public)
5. 点击 Apply 保存设置

### HP iLO

1. 登录 iLO Web 界面
2. 导航到: Administration → Management → SNMP Settings
3. 启用 SNMP
4. 配置 SNMP Community String
5. 保存设置

## 防火墙配置

确保 SNMP 端口(UDP 161)开放：

```bash
# Ubuntu/Debian
sudo ufw allow 161/udp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=161/udp
sudo firewall-cmd --reload
```

## 故障排查

### 连接超时

1. 检查 IP 地址是否正确
2. 确认 SNMP 服务已启动
3. 检查防火墙规则
4. 验证 community 字符串

### OID 不存在错误

- 可能不是标准 SNMP 设备
- 尝试使用 snmpwalk 工具手动探测：
```bash
snmpwalk -v2c -c public 192.168.1.100
```

### 权限问题

确保 community 有读权限：
```bash
# 在 snmpd.conf 中
rocommunity public  # 只读
rwcommunity private # 读写
```

## 安全建议

1. **更改默认 Community**: 不要使用 "public"
2. **限制访问**: 只允许特定 IP 访问
3. **使用 SNMPv3**: 支持加密和认证（未来支持）
4. **只读权限**: 除非必要，使用 rocommunity

示例配置：
```
# 只允许从 192.168.1.0/24 访问
rocommunity mycommunity 192.168.1.0/24
```

## API 集成计划

未来将添加以下功能：

- [ ] SNMP 设备配置管理 API
- [ ] 定时采集设备监控数据
- [ ] 监控数据存储和历史记录
- [ ] 告警阈值设置
- [ ] 监控仪表板展示

## 参考资料

- [Net-SNMP 官方文档](http://www.net-snmp.org/)
- [SNMP OID 参考](http://www.oid-info.com/)
- [Dell OpenManage SNMP 参考](https://www.dell.com/support)
