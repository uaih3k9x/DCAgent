import { createSNMPClient } from './services/snmpService';

/**
 * SNMP 测试脚本
 * 使用方法: npm run test:snmp -- <IP地址> [community]
 * 示例: npm run test:snmp -- 192.168.1.100 public
 */

async function testSNMP() {
  const args = process.argv.slice(2);
  const host = args[0];
  const community = args[1] || 'public';

  if (!host) {
    console.error('使用方法: npm run test:snmp -- <IP地址> [community]');
    console.error('示例: npm run test:snmp -- 192.168.1.100 public');
    process.exit(1);
  }

  console.log(`正在测试 SNMP 连接到 ${host} (community: ${community})`);

  try {
    // 创建 SNMP 客户端
    const snmpClient = createSNMPClient({
      host,
      community,
      timeout: 5000,
    });

    console.log('\n🔍 测试基本连接...');

    // 测试基本连接
    const basicResult = await snmpClient.get('1.3.6.1.2.1.1.1.0'); // sysDescr
    console.log('✅ SNMP 连接成功！');
    console.log(`系统描述: ${basicResult[0]?.value || 'N/A'}`);

    console.log('\n📊 获取系统信息...');
    const systemInfo = await snmpClient.getSystemInfo();
    console.log('系统信息:');
    console.log(`  主机名: ${systemInfo.hostname}`);
    console.log(`  位置: ${systemInfo.location}`);
    console.log(`  联系人: ${systemInfo.contact}`);
    console.log(`  运行时间: ${systemInfo.uptime}`);

    console.log('\n🌐 获取网络接口信息...');
    const interfaces = await snmpClient.getNetworkInterfaces();
    console.log(`发现 ${interfaces.length} 个网络接口:`);
    interfaces.forEach((iface, index) => {
      console.log(`  ${index + 1}. ${iface.description}`);
      console.log(`     类型: ${iface.type}, 速度: ${iface.speed}, 状态: ${iface.status}`);
      if (iface.macAddress !== 'N/A') {
        console.log(`     MAC: ${iface.macAddress}`);
      }
    });

    console.log('\n🖥️  尝试获取 BMC 信息...');

    // 尝试 Dell BMC
    const bmcInfo = await snmpClient.getDellBMCInfo();
    if (bmcInfo && bmcInfo.model !== 'N/A') {
      console.log('Dell BMC 信息:');
      console.log(`  型号: ${bmcInfo.model}`);
      console.log(`  服务标签: ${bmcInfo.serviceTag}`);
      console.log(`  BIOS 版本: ${bmcInfo.biosVersion}`);
    } else {
      // 尝试 Lenovo BMC
      const lenovoBMC = await snmpClient.getLenovoBMCInfo();
      if (lenovoBMC && lenovoBMC.model !== 'N/A') {
        console.log('Lenovo BMC 信息:');
        console.log(`  型号: ${lenovoBMC.model}`);
        console.log(`  序列号: ${lenovoBMC.serialNumber}`);
        console.log(`  BIOS 版本: ${lenovoBMC.biosVersion}`);
        console.log(`  健康状态: ${lenovoBMC.healthStatus}`);
      } else {
        console.log('未检测到 Dell 或 Lenovo BMC，或无法访问');
      }
    }

    console.log('\n🌡️  获取温度传感器...');

    // 尝试 Lenovo 温度传感器
    const lenovoTemps = await snmpClient.getLenovoTemperatureSensors();
    if (lenovoTemps.length > 0 && lenovoTemps.length < 100) {
      console.log(`发现 ${lenovoTemps.length} 个温度传感器:`);
      lenovoTemps.slice(0, 10).forEach((temp) => {
        console.log(`  传感器 ${temp.index}: ${temp.reading}`);
      });
      if (lenovoTemps.length > 10) {
        console.log(`  ... 还有 ${lenovoTemps.length - 10} 个传感器`);
      }
    } else {
      // 尝试 Dell 温度传感器
      const temperatures = await snmpClient.getTemperatureSensors();
      if (temperatures.length > 0 && temperatures.length < 100) {
        console.log(`发现 ${temperatures.length} 个温度传感器:`);
        temperatures.slice(0, 10).forEach((temp) => {
          console.log(`  传感器 ${temp.index}: ${temp.reading}`);
        });
        if (temperatures.length > 10) {
          console.log(`  ... 还有 ${temperatures.length - 10} 个传感器`);
        }
      } else {
        console.log('未找到温度传感器或数据格式不正确');
      }
    }

    // 尝试获取联想风扇信息
    console.log('\n💨 获取风扇信息...');
    const fans = await snmpClient.getLenovoFans();
    if (fans.length > 0 && fans.length < 100) {
      console.log(`发现 ${fans.length} 个风扇:`);
      fans.forEach((fan) => {
        console.log(`  风扇 ${fan.index}: ${fan.speed}`);
      });
    } else {
      console.log('未找到风扇信息或无法访问');
    }

    console.log('\n✅ 测试完成！');

    // 关闭连接
    snmpClient.close();

  } catch (error) {
    console.error('\n❌ SNMP 连接失败:');
    console.error(error);

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.error('连接超时，请检查:');
        console.error('1. IP 地址是否正确');
        console.error('2. SNMP 服务是否启用');
        console.error('3. 防火墙设置');
        console.error('4. community 字符串是否正确');
      } else if (error.message.includes('noSuchName')) {
        console.error('OID 不存在，可能不是标准 SNMP 设备');
      }
    }

    process.exit(1);
  }
}

// 运行测试
testSNMP();