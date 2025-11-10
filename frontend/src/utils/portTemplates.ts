/**
 * 端口组模板配置
 */

// 标准 1U 尺寸（单位：mm）
export const STANDARD_1U = {
  width: 482.6,   // 标准机架宽度 19 英寸
  height: 44.45,  // 1U 高度
};

// 端口尺寸配置
export const PORT_SIZES = {
  RJ45: { width: 14, height: 16 },        // RJ45 网口
  SFP: { width: 13.5, height: 13.5 },     // SFP 光口
  SFP_PLUS: { width: 13.5, height: 13.5 },// SFP+ 光口
  QSFP: { width: 18, height: 18 },        // QSFP 光口
  QSFP28: { width: 18, height: 18 },      // QSFP28 光口
};

// 端口编号模式
export enum PortNumberingPattern {
  SIMPLE = 'SIMPLE',                      // 1, 2, 3...
  WITH_PREFIX = 'WITH_PREFIX',            // Port-1, Port-2...
  CISCO_ETHERNET = 'CISCO_ETHERNET',      // GigabitEthernet0/0/1
  CISCO_SHORT = 'CISCO_SHORT',            // Gi0/0/1
  HUAWEI = 'HUAWEI',                      // GE1/0/1
  HP = 'HP',                              // 1/1/1
  CUSTOM = 'CUSTOM',                      // 自定义前缀，支持 Var 变量
}

// 端口组模板接口
export interface PortGroupTemplate {
  id: string;
  name: string;
  description: string;
  portCount: number;
  portType: keyof typeof PORT_SIZES;
  layout: {
    rows: number;
    columns: number;
    startX: number;      // 起始 X 坐标
    startY: number;      // 起始 Y 坐标
    horizontalGap: number; // 水平间距
    verticalGap: number;   // 垂直间距
  };
  numberingPattern: PortNumberingPattern;
  defaultPrefix?: string;
  panelSize: {
    width: number;
    height: number;
  };
}

// 预定义的端口组模板
export const PORT_GROUP_TEMPLATES: PortGroupTemplate[] = [
  // 8 口千兆交换机
  {
    id: '8port-rj45',
    name: '8口千兆交换机',
    description: '8个RJ45端口，单行排列',
    portCount: 8,
    portType: 'RJ45',
    layout: {
      rows: 1,
      columns: 8,
      startX: 50,
      startY: 14,
      horizontalGap: 18,
      verticalGap: 0,
    },
    numberingPattern: PortNumberingPattern.SIMPLE,
    panelSize: STANDARD_1U,
  },

  // 24 口千兆交换机
  {
    id: '24port-rj45',
    name: '24口千兆交换机',
    description: '24个RJ45端口，双行排列',
    portCount: 24,
    portType: 'RJ45',
    layout: {
      rows: 2,
      columns: 12,
      startX: 30,
      startY: 8,
      horizontalGap: 18,
      verticalGap: 20,
    },
    numberingPattern: PortNumberingPattern.SIMPLE,
    panelSize: STANDARD_1U,
  },

  // 48 口千兆交换机
  {
    id: '48port-rj45',
    name: '48口千兆交换机',
    description: '48个RJ45端口，双行排列',
    portCount: 48,
    portType: 'RJ45',
    layout: {
      rows: 2,
      columns: 24,
      startX: 20,
      startY: 8,
      horizontalGap: 18,
      verticalGap: 20,
    },
    numberingPattern: PortNumberingPattern.SIMPLE,
    panelSize: STANDARD_1U,
  },

  // 12 口 SFP 光口
  {
    id: '12port-sfp',
    name: '12口SFP光口',
    description: '12个SFP光口，单行排列',
    portCount: 12,
    portType: 'SFP',
    layout: {
      rows: 1,
      columns: 12,
      startX: 60,
      startY: 15,
      horizontalGap: 16,
      verticalGap: 0,
    },
    numberingPattern: PortNumberingPattern.SIMPLE,
    panelSize: STANDARD_1U,
  },

  // 24 口 SFP+ 光口
  {
    id: '24port-sfp-plus',
    name: '24口SFP+光口',
    description: '24个SFP+万兆光口，双行排列',
    portCount: 24,
    portType: 'SFP_PLUS',
    layout: {
      rows: 2,
      columns: 12,
      startX: 60,
      startY: 8,
      horizontalGap: 16,
      verticalGap: 20,
    },
    numberingPattern: PortNumberingPattern.SIMPLE,
    panelSize: STANDARD_1U,
  },

  // 32 口 QSFP28
  {
    id: '32port-qsfp28',
    name: '32口QSFP28',
    description: '32个QSFP28 100G光口，双行排列',
    portCount: 32,
    portType: 'QSFP28',
    layout: {
      rows: 2,
      columns: 16,
      startX: 25,
      startY: 8,
      horizontalGap: 20,
      verticalGap: 20,
    },
    numberingPattern: PortNumberingPattern.SIMPLE,
    panelSize: STANDARD_1U,
  },

  // Cisco 样式 - 48口 + 4光口
  {
    id: 'cisco-48-4sfp',
    name: 'Cisco 48+4 交换机',
    description: '48个电口 + 4个SFP上行口',
    portCount: 48,
    portType: 'RJ45',
    layout: {
      rows: 2,
      columns: 24,
      startX: 20,
      startY: 8,
      horizontalGap: 16,
      verticalGap: 20,
    },
    numberingPattern: PortNumberingPattern.CISCO_ETHERNET,
    defaultPrefix: 'GigabitEthernet',
    panelSize: STANDARD_1U,
  },

  // 华为样式 - 24口
  {
    id: 'huawei-24port',
    name: '华为 24口交换机',
    description: '24个千兆电口',
    portCount: 24,
    portType: 'RJ45',
    layout: {
      rows: 2,
      columns: 12,
      startX: 30,
      startY: 8,
      horizontalGap: 18,
      verticalGap: 20,
    },
    numberingPattern: PortNumberingPattern.HUAWEI,
    panelSize: STANDARD_1U,
  },

  // 服务器网卡 - 4口
  {
    id: 'server-4port',
    name: '服务器4口网卡',
    description: '4个千兆/万兆网口',
    portCount: 4,
    portType: 'RJ45',
    layout: {
      rows: 1,
      columns: 4,
      startX: 100,
      startY: 14,
      horizontalGap: 20,
      verticalGap: 0,
    },
    numberingPattern: PortNumberingPattern.SIMPLE,
    panelSize: {
      width: 200,
      height: 44.45,
    },
  },
];

/**
 * 生成端口编号
 */
export function generatePortNumber(
  index: number,
  pattern: PortNumberingPattern,
  options?: {
    prefix?: string;
    customPrefix?: string;
    slot?: number;
    module?: number;
    card?: number;
  }
): string {
  const portNum = index + 1;

  switch (pattern) {
    case PortNumberingPattern.SIMPLE:
      return String(portNum);

    case PortNumberingPattern.WITH_PREFIX:
      return `${options?.prefix || 'Port'}-${portNum}`;

    case PortNumberingPattern.CISCO_ETHERNET:
      return `GigabitEthernet${options?.card || 0}/${options?.module || 0}/${portNum}`;

    case PortNumberingPattern.CISCO_SHORT:
      return `Gi${options?.card || 0}/${options?.module || 0}/${portNum}`;

    case PortNumberingPattern.HUAWEI:
      return `GE${options?.slot || 1}/${options?.module || 0}/${portNum}`;

    case PortNumberingPattern.HP:
      return `${options?.slot || 1}/${options?.module || 1}/${portNum}`;

    case PortNumberingPattern.CUSTOM:
      // 支持自定义前缀，使用 Var 作为序号占位符
      if (options?.customPrefix) {
        return options.customPrefix.replace(/Var/g, String(portNum));
      }
      return String(portNum);

    default:
      return String(portNum);
  }
}

/**
 * 根据模板生成端口配置
 */
export function generatePortsFromTemplate(
  template: PortGroupTemplate,
  options?: {
    prefix?: string;
    customPrefix?: string;
    slot?: number;
    module?: number;
    card?: number;
    startNumber?: number;
  }
): Array<{
  number: string;
  label: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}> {
  const ports = [];
  const portSize = PORT_SIZES[template.portType];
  const startNum = options?.startNumber || 0;

  for (let i = 0; i < template.portCount; i++) {
    const row = Math.floor((i + startNum) / template.layout.columns);
    const col = (i + startNum) % template.layout.columns;

    const positionX =
      template.layout.startX + col * (portSize.width + template.layout.horizontalGap);
    const positionY =
      template.layout.startY + row * (portSize.height + template.layout.verticalGap);

    // 如果提供了自定义前缀，使用 CUSTOM 模式，否则使用模板的编号模式
    const numberingPattern = options?.customPrefix
      ? PortNumberingPattern.CUSTOM
      : template.numberingPattern;

    const portNumber = generatePortNumber(i + startNum, numberingPattern, {
      prefix: options?.prefix || template.defaultPrefix,
      customPrefix: options?.customPrefix,
      slot: options?.slot,
      module: options?.module,
      card: options?.card,
    });

    ports.push({
      number: portNumber,
      label: portNumber,
      positionX,
      positionY,
      width: portSize.width,
      height: portSize.height,
    });
  }

  return ports;
}
