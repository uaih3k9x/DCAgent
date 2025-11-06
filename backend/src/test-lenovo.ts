import { createSNMPClient, COMMON_OIDS } from './services/snmpService';

/**
 * 联想服务器 SNMP 测试脚本
 * 使用方法: npm run test:lenovo -- <IP地址> [community]
 */

async function testLenovo() {
  const args = process.argv.slice(2);
  const host = args[0];
  const community = args[1] || 'public';

  if (!host) {
    console.error('使用方法: npm run test:lenovo -- <IP地址> [community]');
    console.error('示例: npm run test:lenovo -- 192.168.1.100 public');
    process.exit(1);
  }

  console.log(`正在测试联想服务器 ${host} (community: ${community})`);

  try {
    const snmpClient = createSNMPClient({
      host,
      community,
      timeout: 10000,
    });

    console.log('\n✅ SNMP 连接成功！');

    // 获取温度传感器
    console.log('\n🌡️  获取温度传感器...');
    const temps = await snmpClient.getLenovoTemperatureSensors();

    if (temps.length > 0) {
      console.log(`发现 ${temps.length} 个温度传感器:`);
      temps.forEach((temp) => {
        console.log(`  ${temp.index}. ${temp.reading}`);
      });
    } else {
      console.log('未找到温度传感器');
    }

    // 获取风扇信息
    console.log('\n💨 获取风扇信息...');
    const fans = await snmpClient.getLenovoFans();

    if (fans.length > 0) {
      console.log(`发现 ${fans.length} 个风扇:`);
      fans.forEach((fan) => {
        console.log(`  ${fan.index}. ${fan.speed}`);
      });
    } else {
      console.log('未找到风扇信息');
    }

    // 尝试获取所有传感器信息
    console.log('\n📊 获取所有传感器信息...');
    const allSensors = await snmpClient.walk(COMMON_OIDS.lenovo.sensorValue);

    if (allSensors.length > 0) {
      console.log(`\n找到 ${allSensors.length} 个传感器读数:\n`);

      // 按类型分组
      const byType: {[key: string]: any[]} = {
        temperature: [],
        fan: [],
        voltage: [],
        power: [],
        other: [],
      };

      allSensors.forEach((sensor) => {
        const value = String(sensor.value);

        if (value.includes('degrees C') || value.includes('Temp')) {
          byType.temperature.push(sensor);
        } else if (value.includes('FAN') || value.includes('Speed') || value.includes('RPM')) {
          byType.fan.push(sensor);
        } else if (value.includes('Volt') || value.includes('V ')) {
          byType.voltage.push(sensor);
        } else if (value.includes('Watt') || value.includes('Power')) {
          byType.power.push(sensor);
        } else {
          byType.other.push(sensor);
        }
      });

      // 显示温度
      if (byType.temperature.length > 0) {
        console.log(`📈 温度传感器 (${byType.temperature.length}):`);
        byType.temperature.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s.value}`);
        });
        console.log('');
      }

      // 显示风扇
      if (byType.fan.length > 0) {
        console.log(`🌀 风扇 (${byType.fan.length}):`);
        byType.fan.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s.value}`);
        });
        console.log('');
      }

      // 显示电压
      if (byType.voltage.length > 0) {
        console.log(`⚡ 电压 (${byType.voltage.length}):`);
        byType.voltage.slice(0, 10).forEach((s, i) => {
          console.log(`  ${i + 1}. ${s.value}`);
        });
        if (byType.voltage.length > 10) {
          console.log(`  ... 还有 ${byType.voltage.length - 10} 个`);
        }
        console.log('');
      }

      // 显示功率
      if (byType.power.length > 0) {
        console.log(`🔋 功率 (${byType.power.length}):`);
        byType.power.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s.value}`);
        });
        console.log('');
      }
    }

    console.log('\n✅ 测试完成！');
    snmpClient.close();

  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error(error);
    process.exit(1);
  }
}

testLenovo();
