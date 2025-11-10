import { useState, useCallback, useRef, useEffect } from 'react';
import { Layout, Typography, AutoComplete, Input, message } from 'antd';
import { DatabaseOutlined, SearchOutlined, BarcodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import searchService, { SearchResult } from '../../services/searchService';
import {
  formatSearchResultLabel,
  navigateToEntity,
  navigateToCableEndpoint,
  getSearchResultKey,
} from '../../utils/navigationHelper';
import { ShortIdFormatter } from '../../utils/shortIdFormatter';

const { Header } = Layout;
const { Title } = Typography;

export default function AppHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string; data: SearchResult }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<any>(null);
  const [lastSearchWasShortId, setLastSearchWasShortId] = useState(false);

  // 全局 Tab 键监听，聚焦到搜索框
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 按下 Tab 键且不在输入框、文本域等元素中
      if (e.key === 'Tab') {
        const activeElement = document.activeElement;
        const isInInput = activeElement?.tagName === 'INPUT' ||
                         activeElement?.tagName === 'TEXTAREA' ||
                         activeElement?.getAttribute('contenteditable') === 'true';

        // 如果当前不在输入框中，阻止默认行为并聚焦到搜索框
        if (!isInInput) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // 处理搜索
  const handleSearch = useCallback(async (value: string) => {
    setSearchQuery(value);

    if (!value || value.trim().length === 0) {
      setSearchOptions([]);
      setLastSearchWasShortId(false);
      return;
    }

    const trimmedValue = value.trim();

    // 尝试解析为 shortId（支持 E-00003 或 3 格式）
    let isShortIdFormat = false;
    try {
      const numericValue = ShortIdFormatter.toNumericFormat(trimmedValue);
      isShortIdFormat = true;

      // 如果成功解析为数字，尝试根据 shortId 查找
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
          setLastSearchWasShortId(true);
          return;
        } else {
          // shortId 格式正确，但未找到结果 - 只标记，不清空
          setSearchOptions([]);
          setLastSearchWasShortId(true);
          return;
        }
      } catch (error) {
        console.error('Error finding by shortId:', error);
        // 查询出错 - 只标记，不清空
        setSearchOptions([]);
        setLastSearchWasShortId(true);
        return;
      } finally {
        setSearching(false);
      }
    } catch {
      // 不是有效的 shortId 格式，继续进行文本搜索
      setLastSearchWasShortId(false);
    }

    // 全局文本搜索
    setSearching(true);
    try {
      const results = await searchService.globalSearch(trimmedValue);
      setSearchOptions(
        results.map((result) => ({
          value: getSearchResultKey(result),
          label: formatSearchResultLabel(result),
          data: result,
        }))
      );
    } catch (error) {
      console.error('Error in global search:', error);
      message.error(t('searchFailed'));
      setSearchOptions([]);
    } finally {
      setSearching(false);
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
            // 根据搜索结果的端点类型，决定聚焦哪一端
            const scannedEndType = result.metadata?.endType as 'A' | 'B' | undefined;
            navigateToCableEndpoint(endpoints, navigate, scannedEndType);

            const targetPort = scannedEndType === 'A' ? endpoints.portA : endpoints.portB;
            message.success(`跳转到线缆端点${scannedEndType || 'A'}: ${targetPort?.label || targetPort?.number}`);
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

  // 处理回车键 - 自动选择第一个候选项
  const handlePressEnter = useCallback(() => {
    if (searchOptions.length > 0) {
      handleSelect(searchOptions[0].value);
    } else if (lastSearchWasShortId && searchQuery.trim()) {
      // shortId 格式但未找到 - 显示警告并清空
      message.warning(`shortID ${searchQuery.trim()} 尚未分配给任何实体`, 3);
      setSearchQuery('');
      setSearchOptions([]);
      setLastSearchWasShortId(false);
    }
  }, [searchOptions, handleSelect, lastSearchWasShortId, searchQuery]);


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
          placeholder={t('searchPlaceholder')}
        >
          <Input
            ref={searchInputRef}
            prefix={<SearchOutlined />}
            suffix={<BarcodeOutlined style={{ color: '#8c8c8c' }} />}
            loading={searching}
            allowClear
            onPressEnter={handlePressEnter}
          />
        </AutoComplete>
      </div>

      {/* 语言切换器 */}
      <div style={{ marginLeft: '16px' }}>
        <LanguageSwitcher />
      </div>
    </Header>
  );
}

