import { useState, useCallback } from 'react';
import { Layout, Typography, AutoComplete, Input, message } from 'antd';
import { DatabaseOutlined, SearchOutlined, BarcodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import searchService, { SearchResult } from '../../services/searchService';
import {
  formatSearchResultLabel,
  navigateToEntity,
  navigateToCableEndpoint,
  getSearchResultKey,
} from '../../utils/navigationHelper';

const { Header } = Layout;
const { Title } = Typography;

export default function AppHeader() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string; data: SearchResult }[]>([]);
  const [searching, setSearching] = useState(false);

  // 处理搜索
  const handleSearch = useCallback(async (value: string) => {
    setSearchQuery(value);

    if (!value || value.trim().length === 0) {
      setSearchOptions([]);
      return;
    }

    // 检查是否是纯数字（shortId）
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue.toString() === value.trim()) {
      // 尝试根据 shortId 查找
      setSearching(true);
      try {
        const result = await searchService.findByShortId(numericValue);
        if (result) {
          setSearchOptions([
            {
              value: getSearchResultKey(result),
              label: formatSearchResultLabel(result),
              data: result,
            },
          ]);
        } else {
          setSearchOptions([]);
        }
      } catch (error) {
        console.error('Error finding by shortId:', error);
        setSearchOptions([]);
      } finally {
        setSearching(false);
      }
    } else {
      // 全局文本搜索
      setSearching(true);
      try {
        const results = await searchService.globalSearch(value);
        setSearchOptions(
          results.map((result) => ({
            value: getSearchResultKey(result),
            label: formatSearchResultLabel(result),
            data: result,
          }))
        );
      } catch (error) {
        console.error('Error in global search:', error);
        message.error('搜索失败，请稍后重试');
        setSearchOptions([]);
      } finally {
        setSearching(false);
      }
    }
  }, []);

  // 处理选择搜索结果
  const handleSelect = useCallback(
    async (value: string) => {
      const selectedOption = searchOptions.find((opt) => opt.value === value);
      if (!selectedOption) return;

      const result = selectedOption.data;

      // 如果是线缆，需要先查询端点信息再跳转
      if (result.type === 'Cable') {
        try {
          const endpoints = await searchService.getCableEndpointsByShortId(result.shortId);
          if (endpoints) {
            navigateToCableEndpoint(endpoints, navigate);
            message.success(`跳转到线缆连接端口: ${endpoints.portA?.label || endpoints.portA?.number}`);
          } else {
            message.warning('未找到线缆连接信息');
          }
        } catch (error) {
          console.error('Error fetching cable endpoints:', error);
          message.error('获取线缆连接信息失败');
        }
      } else {
        // 其他实体直接跳转
        navigateToEntity(result, navigate);
        message.success(`跳转到 ${formatSearchResultLabel(result)}`);
      }

      // 清空搜索框
      setSearchQuery('');
      setSearchOptions([]);
    },
    [searchOptions, navigate]
  );

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#001529',
        padding: '0 24px',
      }}
    >
      <DatabaseOutlined style={{ fontSize: '24px', color: '#fff', marginRight: '12px' }} />
      <Title level={4} style={{ color: '#fff', margin: 0 }}>
        DCAgent
      </Title>
      <span style={{ color: '#8c8c8c', marginLeft: '12px', fontSize: '14px' }}>
        見えない線を、見える化へ
      </span>

      {/* 全局搜索框 */}
      <div style={{ marginLeft: 'auto', width: '400px' }}>
        <AutoComplete
          value={searchQuery}
          options={searchOptions}
          onSearch={handleSearch}
          onSelect={handleSelect}
          style={{ width: '100%' }}
          placeholder="搜索或扫描二维码..."
        >
          <Input
            prefix={<SearchOutlined />}
            suffix={<BarcodeOutlined style={{ color: '#8c8c8c' }} />}
            loading={searching}
            allowClear
          />
        </AutoComplete>
      </div>
    </Header>
  );
}

