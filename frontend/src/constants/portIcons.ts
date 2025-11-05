/**
 * 端口类型的SVG图标
 * 每种端口类型都有对应的SVG图标，用于可视化显示
 */

import { PortType } from './portSizes';

export const PORT_ICONS: Record<PortType, string> = {
  // RJ45 以太网口 - 矩形带8个针脚线条
  [PortType.RJ45]: `
    <svg viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="1" y="1" width="14" height="12" rx="1" fill="#1890ff" stroke="#0050b3" stroke-width="0.5"/>
      <!-- 8个针脚 -->
      <line x1="2.5" y1="3" x2="2.5" y2="7" stroke="#fff" stroke-width="0.5"/>
      <line x1="4" y1="3" x2="4" y2="7" stroke="#fff" stroke-width="0.5"/>
      <line x1="5.5" y1="3" x2="5.5" y2="7" stroke="#fff" stroke-width="0.5"/>
      <line x1="7" y1="3" x2="7" y2="7" stroke="#fff" stroke-width="0.5"/>
      <line x1="9" y1="3" x2="9" y2="7" stroke="#fff" stroke-width="0.5"/>
      <line x1="10.5" y1="3" x2="10.5" y2="7" stroke="#fff" stroke-width="0.5"/>
      <line x1="12" y1="3" x2="12" y2="7" stroke="#fff" stroke-width="0.5"/>
      <line x1="13.5" y1="3" x2="13.5" y2="7" stroke="#fff" stroke-width="0.5"/>
      <!-- 底部卡槽 -->
      <rect x="6" y="10" width="4" height="2" fill="#003a8c"/>
    </svg>
  `,

  // SFP 光模块 - 较小的矩形带光纤符号
  [PortType.SFP]: `
    <svg viewBox="0 0 13.5 8.5" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="12.5" height="7.5" rx="0.5" fill="#52c41a" stroke="#389e0d" stroke-width="0.4"/>
      <!-- LC接口图案 -->
      <rect x="2" y="2" width="2" height="4.5" rx="0.3" fill="#237804"/>
      <rect x="5" y="2" width="2" height="4.5" rx="0.3" fill="#237804"/>
      <!-- 光纤指示 -->
      <circle cx="9.5" cy="3" r="0.8" fill="#fff" opacity="0.8"/>
      <circle cx="9.5" cy="5.5" r="0.8" fill="#fff" opacity="0.8"/>
    </svg>
  `,

  // SFP+ 光模块 - 与SFP类似但有"+"标记
  [PortType.SFP_PLUS]: `
    <svg viewBox="0 0 13.5 8.5" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="12.5" height="7.5" rx="0.5" fill="#13c2c2" stroke="#08979c" stroke-width="0.4"/>
      <!-- LC接口图案 -->
      <rect x="2" y="2" width="2" height="4.5" rx="0.3" fill="#006d75"/>
      <rect x="5" y="2" width="2" height="4.5" rx="0.3" fill="#006d75"/>
      <!-- "+" 标记 -->
      <line x1="9" y1="4.25" x2="11" y2="4.25" stroke="#fff" stroke-width="0.8"/>
      <line x1="10" y1="3.25" x2="10" y2="5.25" stroke="#fff" stroke-width="0.8"/>
    </svg>
  `,

  // QSFP 四通道光模块 - 更宽的矩形，4个通道
  [PortType.QSFP]: `
    <svg viewBox="0 0 18.5 8.5" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="17.5" height="7.5" rx="0.5" fill="#722ed1" stroke="#531dab" stroke-width="0.4"/>
      <!-- 4个通道 -->
      <rect x="2" y="2" width="1.5" height="4.5" rx="0.2" fill="#391085"/>
      <rect x="5.5" y="2" width="1.5" height="4.5" rx="0.2" fill="#391085"/>
      <rect x="9" y="2" width="1.5" height="4.5" rx="0.2" fill="#391085"/>
      <rect x="12.5" y="2" width="1.5" height="4.5" rx="0.2" fill="#391085"/>
      <!-- "Q" 标记 -->
      <text x="15.5" y="6" font-size="3" fill="#fff" font-family="Arial" font-weight="bold">Q</text>
    </svg>
  `,

  // QSFP28 - QSFP的增强版，标记28
  [PortType.QSFP28]: `
    <svg viewBox="0 0 18.5 8.5" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="17.5" height="7.5" rx="0.5" fill="#722ed1" stroke="#531dab" stroke-width="0.4"/>
      <!-- 4个通道 -->
      <rect x="2" y="2" width="1.5" height="4.5" rx="0.2" fill="#391085"/>
      <rect x="5.5" y="2" width="1.5" height="4.5" rx="0.2" fill="#391085"/>
      <rect x="9" y="2" width="1.5" height="4.5" rx="0.2" fill="#391085"/>
      <rect x="12.5" y="2" width="1.5" height="4.5" rx="0.2" fill="#391085"/>
      <!-- "28" 标记 -->
      <text x="14.5" y="6" font-size="2.5" fill="#fff" font-family="Arial" font-weight="bold">28</text>
    </svg>
  `,

  // QSFP-DD - 双密度QSFP，更高
  [PortType.QSFP_DD]: `
    <svg viewBox="0 0 18.5 9.5" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="17.5" height="8.5" rx="0.5" fill="#eb2f96" stroke="#c41d7f" stroke-width="0.4"/>
      <!-- 8个通道 (双排) -->
      <rect x="2" y="1.5" width="1.2" height="3" rx="0.2" fill="#780650"/>
      <rect x="5" y="1.5" width="1.2" height="3" rx="0.2" fill="#780650"/>
      <rect x="8" y="1.5" width="1.2" height="3" rx="0.2" fill="#780650"/>
      <rect x="11" y="1.5" width="1.2" height="3" rx="0.2" fill="#780650"/>
      <rect x="2" y="5.5" width="1.2" height="3" rx="0.2" fill="#780650"/>
      <rect x="5" y="5.5" width="1.2" height="3" rx="0.2" fill="#780650"/>
      <rect x="8" y="5.5" width="1.2" height="3" rx="0.2" fill="#780650"/>
      <rect x="11" y="5.5" width="1.2" height="3" rx="0.2" fill="#780650"/>
      <!-- "DD" 标记 -->
      <text x="14" y="6" font-size="2.5" fill="#fff" font-family="Arial" font-weight="bold">DD</text>
    </svg>
  `,

  // LC 双工光纤接口
  [PortType.LC]: `
    <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="11" height="11" rx="1" fill="#faad14" stroke="#d48806" stroke-width="0.4"/>
      <!-- 双工接口 -->
      <rect x="2" y="3" width="3.5" height="6" rx="0.5" fill="#ad6800"/>
      <rect x="6.5" y="3" width="3.5" height="6" rx="0.5" fill="#ad6800"/>
      <!-- 光纤指示点 -->
      <circle cx="3.75" cy="5" r="0.6" fill="#52c41a"/>
      <circle cx="8.25" cy="5" r="0.6" fill="#52c41a"/>
      <circle cx="3.75" cy="7.5" r="0.6" fill="#1890ff"/>
      <circle cx="8.25" cy="7.5" r="0.6" fill="#1890ff"/>
    </svg>
  `,

  // SC 光纤接口
  [PortType.SC]: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="15" height="15" rx="1" fill="#fa8c16" stroke="#d46b08" stroke-width="0.4"/>
      <!-- SC 卡槽 -->
      <rect x="2" y="3" width="5.5" height="10" rx="0.5" fill="#ad4e00"/>
      <rect x="8.5" y="3" width="5.5" height="10" rx="0.5" fill="#ad4e00"/>
      <!-- 按压卡扣 -->
      <rect x="3.5" y="5" width="2.5" height="1.5" rx="0.3" fill="#874d00"/>
      <rect x="10" y="5" width="2.5" height="1.5" rx="0.3" fill="#874d00"/>
      <!-- 光纤孔 -->
      <circle cx="4.75" cy="10" r="1" fill="#52c41a"/>
      <circle cx="11.25" cy="10" r="1" fill="#52c41a"/>
    </svg>
  `,

  // USB-A 接口
  [PortType.USB_A]: `
    <svg viewBox="0 0 14 7" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="13" height="6" rx="0.5" fill="#1890ff" stroke="#0050b3" stroke-width="0.4"/>
      <!-- USB 图标 -->
      <circle cx="7" cy="3.5" r="0.8" fill="#fff"/>
      <line x1="7" y1="3.5" x2="7" y2="1.5" stroke="#fff" stroke-width="0.6"/>
      <line x1="7" y1="1.5" x2="5.5" y2="2" stroke="#fff" stroke-width="0.5"/>
      <line x1="7" y1="1.5" x2="8.5" y2="2" stroke="#fff" stroke-width="0.5"/>
      <circle cx="5.5" cy="2" r="0.4" fill="#fff"/>
      <!-- 4个针脚 -->
      <rect x="3" y="4.5" width="0.8" height="1.5" fill="#003a8c"/>
      <rect x="5.5" y="4.5" width="0.8" height="1.5" fill="#003a8c"/>
      <rect x="8" y="4.5" width="0.8" height="1.5" fill="#003a8c"/>
      <rect x="10.5" y="4.5" width="0.8" height="1.5" fill="#003a8c"/>
    </svg>
  `,

  // USB-C 接口 - 对称设计
  [PortType.USB_C]: `
    <svg viewBox="0 0 9 3.5" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 - 椭圆形 -->
      <ellipse cx="4.5" cy="1.75" rx="4" ry="1.5" fill="#1890ff" stroke="#0050b3" stroke-width="0.3"/>
      <!-- 中央针脚区域 -->
      <rect x="2.5" y="1" width="4" height="1.5" rx="0.3" fill="#003a8c"/>
      <!-- USB-C 标识小点 -->
      <circle cx="2" cy="1.75" r="0.3" fill="#fff"/>
      <circle cx="7" cy="1.75" r="0.3" fill="#fff"/>
    </svg>
  `,

  // 串口 (DB9)
  [PortType.SERIAL]: `
    <svg viewBox="0 0 31 13" xmlns="http://www.w3.org/2000/svg">
      <!-- D型外框 -->
      <path d="M 2 1 L 29 1 L 30.5 6.5 L 29 12 L 2 12 L 0.5 6.5 Z" fill="#8c8c8c" stroke="#595959" stroke-width="0.5"/>
      <!-- 9个针脚 (5上4下) -->
      <circle cx="5" cy="4" r="0.8" fill="#262626"/>
      <circle cx="9" cy="4" r="0.8" fill="#262626"/>
      <circle cx="13" cy="4" r="0.8" fill="#262626"/>
      <circle cx="17" cy="4" r="0.8" fill="#262626"/>
      <circle cx="21" cy="4" r="0.8" fill="#262626"/>
      <circle cx="7" cy="9" r="0.8" fill="#262626"/>
      <circle cx="11" cy="9" r="0.8" fill="#262626"/>
      <circle cx="15" cy="9" r="0.8" fill="#262626"/>
      <circle cx="19" cy="9" r="0.8" fill="#262626"/>
      <!-- 螺丝孔 -->
      <circle cx="26" cy="6.5" r="1.2" fill="#434343" stroke="#262626" stroke-width="0.3"/>
    </svg>
  `,

  // 电源接口 C13
  [PortType.POWER_C13]: `
    <svg viewBox="0 0 20 15" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="19" height="14" rx="1" fill="#f5222d" stroke="#cf1322" stroke-width="0.5"/>
      <!-- 3个针脚孔 -->
      <rect x="4" y="4" width="2.5" height="7" rx="0.5" fill="#820014"/>
      <rect x="8.75" y="4" width="2.5" height="7" rx="0.5" fill="#820014"/>
      <rect x="13.5" y="4" width="2.5" height="7" rx="0.5" fill="#820014"/>
      <!-- "C13" 标记 -->
      <text x="2" y="13.5" font-size="2" fill="#fff" font-family="Arial" font-weight="bold">C13</text>
      <!-- 接地符号 -->
      <circle cx="17" cy="3" r="0.8" fill="#ffa39e"/>
      <line x1="17" y1="3.8" x2="17" y2="5" stroke="#ffa39e" stroke-width="0.5"/>
      <line x1="16" y1="5" x2="18" y2="5" stroke="#ffa39e" stroke-width="0.5"/>
      <line x1="16.3" y1="5.5" x2="17.7" y2="5.5" stroke="#ffa39e" stroke-width="0.4"/>
    </svg>
  `,

  // 电源接口 C19 - 更大功率
  [PortType.POWER_C19]: `
    <svg viewBox="0 0 25 18" xmlns="http://www.w3.org/2000/svg">
      <!-- 外框 -->
      <rect x="0.5" y="0.5" width="24" height="17" rx="1" fill="#cf1322" stroke="#a8071a" stroke-width="0.5"/>
      <!-- 3个更粗的针脚孔 -->
      <rect x="4" y="4" width="4" height="10" rx="0.5" fill="#5c0011"/>
      <rect x="10.5" y="4" width="4" height="10" rx="0.5" fill="#5c0011"/>
      <rect x="17" y="4" width="4" height="10" rx="0.5" fill="#5c0011"/>
      <!-- "C19" 标记 -->
      <text x="2" y="16.5" font-size="2.5" fill="#fff" font-family="Arial" font-weight="bold">C19</text>
      <!-- 接地符号 -->
      <circle cx="21.5" cy="3.5" r="1" fill="#ff7875"/>
      <line x1="21.5" y1="4.5" x2="21.5" y2="6" stroke="#ff7875" stroke-width="0.6"/>
      <line x1="20.2" y1="6" x2="22.8" y2="6" stroke="#ff7875" stroke-width="0.6"/>
      <line x1="20.5" y1="6.7" x2="22.5" y2="6.7" stroke="#ff7875" stroke-width="0.5"/>
    </svg>
  `,
};

/**
 * 获取端口类型的SVG图标
 */
export function getPortIcon(portType: PortType): string {
  return PORT_ICONS[portType] || PORT_ICONS[PortType.RJ45];
}
