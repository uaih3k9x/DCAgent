import { PortType } from '@/constants/portSizes';
import { getPortIcon } from '@/constants/portIcons';

interface PortIconProps {
  portType: PortType;
  size?: number; // 图标大小（像素）
  className?: string;
}

/**
 * 端口图标组件
 * 用于显示各种端口类型的SVG图标
 */
export function PortIcon({ portType, size = 24, className }: PortIconProps) {
  const svgContent = getPortIcon(portType);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
