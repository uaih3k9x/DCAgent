#!/bin/bash

# shortID池管理系统测试脚本

API_BASE="http://localhost:3000/api/v1"

echo "========================================="
echo "测试 shortID 池管理系统"
echo "========================================="
echo ""

# 1. 测试统计接口
echo "1. 获取池统计信息..."
curl -s -X GET "$API_BASE/shortid-pool/stats" | jq
echo ""

# 2. 创建打印任务
echo "2. 创建打印任务（生成10个线缆shortID）..."
TASK_RESPONSE=$(curl -s -X POST "$API_BASE/shortid-pool/print-task/create" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "2025年第一批线缆标签",
    "entityType": "CABLE",
    "count": 10,
    "createdBy": "9x",
    "notes": "第一批测试"
  }')

echo "$TASK_RESPONSE" | jq

# 提取任务ID
TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.printTask.id')
echo "任务ID: $TASK_ID"
echo ""

# 3. 查询打印任务列表
echo "3. 查询打印任务列表..."
curl -s -X POST "$API_BASE/shortid-pool/print-tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "pageSize": 10
  }' | jq
echo ""

# 4. 查询池记录
echo "4. 查询池记录（线缆类型）..."
curl -s -X POST "$API_BASE/shortid-pool/records" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "pageSize": 10,
    "entityType": "CABLE",
    "status": "PRINTED"
  }' | jq
echo ""

# 5. 导出打印任务CSV
if [ ! -z "$TASK_ID" ] && [ "$TASK_ID" != "null" ]; then
  echo "5. 导出打印任务CSV..."
  curl -s -X GET "$API_BASE/shortid-pool/print-task/$TASK_ID/export" \
    -o "shortids_export_test.csv"
  echo "CSV已导出到: shortids_export_test.csv"
  echo "前5行内容:"
  head -5 shortids_export_test.csv
  echo ""

  # 6. 标记任务完成
  echo "6. 标记打印任务为完成..."
  curl -s -X POST "$API_BASE/shortid-pool/print-task/$TASK_ID/complete" \
    -H "Content-Type: application/json" \
    -d '{}' | jq
  echo ""
fi

# 7. 检查shortID是否存在
echo "7. 检查shortID是否存在（查询1001）..."
curl -s -X POST "$API_BASE/shortid-pool/check" \
  -H "Content-Type: application/json" \
  -d '{
    "shortId": 1001,
    "entityType": "CABLE"
  }' | jq
echo ""

# 8. 直接生成shortID（不创建打印任务）
echo "8. 直接生成5个端口shortID..."
curl -s -X POST "$API_BASE/shortid-pool/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "PORT",
    "count": 5,
    "batchNo": "测试批次001"
  }' | jq
echo ""

# 9. 报废一个shortID
echo "9. 报废一个shortID..."
curl -s -X POST "$API_BASE/shortid-pool/cancel" \
  -H "Content-Type: application/json" \
  -d '{
    "shortId": 1001,
    "entityType": "CABLE",
    "reason": "标签损坏"
  }' | jq
echo ""

# 10. 最终统计
echo "10. 最终统计信息..."
curl -s -X GET "$API_BASE/shortid-pool/stats" | jq
echo ""

echo "========================================="
echo "测试完成！"
echo "========================================="
