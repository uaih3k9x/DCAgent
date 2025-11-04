/**
 * 端口号自然排序比较函数
 * 支持：
 * - 纯数字：1, 2, 10, 47, 48
 * - 带前缀：Port-1, Port-2, Port-10
 * - 网络设备格式：GigabitEthernet0/0/1, Gi0/0/2
 */
export function comparePortNumbers(a: string, b: string): number {
  // 提取所有数字段
  const extractNumbers = (str: string): number[] => {
    const matches = str.match(/\d+/g);
    return matches ? matches.map(Number) : [];
  };

  const numsA = extractNumbers(a);
  const numsB = extractNumbers(b);

  // 逐段比较数字
  const maxLen = Math.max(numsA.length, numsB.length);
  for (let i = 0; i < maxLen; i++) {
    const numA = numsA[i] || 0;
    const numB = numsB[i] || 0;
    if (numA !== numB) {
      return numA - numB;
    }
  }

  // 如果数字部分相同，按字符串比较
  return a.localeCompare(b);
}

/**
 * 排序端口数组
 */
export function sortPorts<T extends { number: string }>(ports: T[]): T[] {
  return [...ports].sort((a, b) => comparePortNumbers(a.number, b.number));
}
