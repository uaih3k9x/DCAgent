import { createSNMPClient } from './services/snmpService';

/**
 * SNMP Walk 探测脚本
 * 用于探测设备的完整 OID 树
 * 使用方法: npm run snmp:walk -- <IP地址> [community] [起始OID]
 */

async function snmpWalk() {
  const args = process.argv.slice(2);
  const host = args[0];
  const community = args[1] || 'public';
  const startOid = args[2] || '1.3.6.1.4.1.2.3.51'; // 联想 OID 默认起始点

  if (!host) {
    console.error('使用方法: npm run snmp:walk -- <IP地址> [community] [起始OID]');
    console.error('示例: npm run snmp:walk -- 192.168.1.100 public 1.3.6.1.4.1.2.3.51');
    console.error('');
    console.error('常用起始 OID:');
    console.error('  1.3.6.1.4.1.2.3.51    - Lenovo/IBM 企业 MIB');
    console.error('  1.3.6.1.4.1.674       - Dell 企业 MIB');
    console.error('  1.3.6.1.4.1.232       - HP 企业 MIB');
    console.error('  1.3.6.1.2.1           - 标准 MIB-2');
    process.exit(1);
  }

  console.log(`正在遍历 ${host} 的 OID 树...`);
  console.log(`起始 OID: ${startOid}`);
  console.log(`Community: ${community}`);
  console.log('');

  try {
    const snmpClient = createSNMPClient({
      host,
      community,
      timeout: 10000, // 增加超时时间
    });

    console.log('开始 SNMP WALK...');
    console.log('');

    const results = await snmpClient.walk(startOid);

    console.log(`\n找到 ${results.length} 个 OID:\n`);

    // 按 OID 分组显示
    const grouped: { [key: string]: any[] } = {};

    results.forEach((result) => {
      // 提取 OID 的前缀（去掉最后的索引）
      const parts = result.oid.split('.');
      const prefix = parts.slice(0, -1).join('.');

      if (!grouped[prefix]) {
        grouped[prefix] = [];
      }
      grouped[prefix].push(result);
    });

    // 显示分组结果
    Object.keys(grouped).sort().forEach((prefix) => {
      const items = grouped[prefix];
      console.log(`\n=== OID 前缀: ${prefix} (${items.length} 项) ===`);

      items.slice(0, 5).forEach((item) => {
        let displayValue = item.value;

        // 如果是字符串，截断过长的值
        if (typeof displayValue === 'string' && displayValue.length > 50) {
          displayValue = displayValue.substring(0, 50) + '...';
        }

        console.log(`  ${item.oid}`);
        console.log(`    类型: ${item.type}, 值: ${displayValue}`);
      });

      if (items.length > 5) {
        console.log(`  ... 还有 ${items.length - 5} 项`);
      }
    });

    // 保存完整结果到文件
    const fs = require('fs');
    const outputFile = `snmp-walk-${host.replace(/\./g, '-')}-${Date.now()}.json`;
    fs.writeFileSync(
      outputFile,
      JSON.stringify(results, null, 2),
      'utf8'
    );
    console.log(`\n\n✅ 完整结果已保存到: ${outputFile}`);

    // 显示一些有用的统计信息
    console.log('\n=== 统计信息 ===');
    console.log(`总 OID 数: ${results.length}`);
    console.log(`OID 前缀数: ${Object.keys(grouped).length}`);

    // 查找可能的温度、风扇、电源等关键词
    console.log('\n=== 可能的传感器 OID ===');
    const keywords = ['temp', 'fan', 'volt', 'power', 'sensor', 'health', 'status', 'cpu', 'memory'];

    keywords.forEach((keyword) => {
      const matches = results.filter((r) =>
        r.oid.toLowerCase().includes(keyword) ||
        (typeof r.value === 'string' && r.value.toLowerCase().includes(keyword))
      );

      if (matches.length > 0) {
        console.log(`\n${keyword.toUpperCase()}: 找到 ${matches.length} 个相关 OID`);
        matches.slice(0, 3).forEach((m) => {
          console.log(`  ${m.oid} = ${m.value}`);
        });
        if (matches.length > 3) {
          console.log(`  ... 还有 ${matches.length - 3} 个`);
        }
      }
    });

    snmpClient.close();
    console.log('\n✅ Walk 完成！');

  } catch (error) {
    console.error('\n❌ SNMP Walk 失败:');
    console.error(error);
    process.exit(1);
  }
}

snmpWalk();
