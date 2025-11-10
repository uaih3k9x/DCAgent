/**
 * ShortID 格式化工具
 *
 * 格式定义：
 * - 显示格式：E-XXXXX（例如 E-00001, E-12345, E-123456）
 * - E 代表 Entity
 * - 数字部分最少5位，不足补0；超过5位则正常显示
 * - 数据库存储：纯数字（例如 1, 12345, 123456）
 */

export class ShortIdFormatter {
  private static readonly PREFIX = 'E-';
  private static readonly MIN_PADDING_LENGTH = 5;

  /**
   * 将数字shortID转换为显示格式
   * @param numericId 数字shortID（例如 1, 123456）
   * @returns 显示格式shortID（例如 "E-00001", "E-123456"）
   */
  static toDisplayFormat(numericId: number): string {
    const numStr = String(numericId);
    // 如果数字长度小于最小长度，则补0；否则直接使用
    const paddedNumber = numStr.length < this.MIN_PADDING_LENGTH
      ? numStr.padStart(this.MIN_PADDING_LENGTH, '0')
      : numStr;
    return `${this.PREFIX}${paddedNumber}`;
  }

  /**
   * 将显示格式shortID转换为数字
   * @param displayId 显示格式shortID（例如 "E-00001" 或 "00001"）
   * @returns 数字shortID（例如 1）
   */
  static toNumericFormat(displayId: string): number {
    // 移除前缀（如果存在）
    const numericPart = displayId.replace(this.PREFIX, '').trim();
    const parsed = parseInt(numericPart, 10);

    if (isNaN(parsed)) {
      throw new Error(`无效的shortID格式: ${displayId}`);
    }

    return parsed;
  }

  /**
   * 验证显示格式shortID是否有效
   * @param displayId 显示格式shortID
   * @returns 是否有效
   */
  static isValidDisplayFormat(displayId: string): boolean {
    const regex = new RegExp(`^${this.PREFIX}\\d+$`);
    return regex.test(displayId);
  }

  /**
   * 批量转换为显示格式
   * @param numericIds 数字shortID数组
   * @returns 显示格式shortID数组
   */
  static batchToDisplayFormat(numericIds: number[]): string[] {
    return numericIds.map(id => this.toDisplayFormat(id));
  }

  /**
   * 批量转换为数字格式
   * @param displayIds 显示格式shortID数组
   * @returns 数字shortID数组
   */
  static batchToNumericFormat(displayIds: string[]): number[] {
    return displayIds.map(id => this.toNumericFormat(id));
  }
}

// 便捷导出（绑定正确的 this 上下文）
export const formatShortId = (numericId: number): string =>
  ShortIdFormatter.toDisplayFormat(numericId);
export const parseShortId = (displayId: string): number =>
  ShortIdFormatter.toNumericFormat(displayId);
