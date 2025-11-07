import globalShortIdService from './src/services/globalShortIdService';
import searchService from './src/services/searchService';

async function test() {
  console.log('=== 测试 shortId=4 查询 ===\n');

  // 1. 测试 GlobalShortIdService
  console.log('1. GlobalShortIdService.getEntityByShortId(4):');
  const allocation = await globalShortIdService.getEntityByShortId(4);
  console.log(JSON.stringify(allocation, null, 2));

  // 2. 测试 SearchService
  console.log('\n2. SearchService.findByShortId(4):');
  try {
    const result = await searchService.findByShortId(4);
    console.log(JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('Error:', err.message);
  }

  process.exit(0);
}

test();
