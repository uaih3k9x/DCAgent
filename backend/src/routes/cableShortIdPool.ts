import { Router, Request, Response } from 'express';
import { cableShortIdPoolService } from '../services/cableShortIdPoolService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const generateShortIdsSchema = z.object({
  count: z.number().int().positive().max(10000, 'Count must not exceed 10000'),
  notes: z.string().optional(),
});

const checkShortIdSchema = z.object({
  shortId: z.number().int().positive('Invalid shortId'),
});

const cancelShortIdSchema = z.object({
  shortId: z.number().int().positive('Invalid shortId'),
  reason: z.string().optional(),
});

const getAvailableSchema = z.object({
  limit: z.number().int().positive().optional(),
});

const getPoolRecordsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(50),
});

// POST /api/v1/cable-shortid-pool/generate - 批量生成shortID
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { count, notes } = generateShortIdsSchema.parse(req.body);
    const generatedIds = await cableShortIdPoolService.generateShortIds(count, notes);
    res.status(201).json({
      success: true,
      message: `成功生成 ${generatedIds.length} 个shortID`,
      shortIds: generatedIds,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error generating shortIds:', error);
    res.status(500).json({ error: 'Failed to generate shortIds' });
  }
});

// POST /api/v1/cable-shortid-pool/check - 检查shortID是否已存在
router.post('/check', async (req: Request, res: Response) => {
  try {
    const { shortId } = checkShortIdSchema.parse(req.body);
    const result = await cableShortIdPoolService.checkShortIdExists(shortId);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error checking shortId:', error);
    res.status(500).json({ error: 'Failed to check shortId' });
  }
});

// POST /api/v1/cable-shortid-pool/available - 获取可用shortID列表
router.post('/available', async (req: Request, res: Response) => {
  try {
    const { limit } = getAvailableSchema.parse(req.body);
    const shortIds = await cableShortIdPoolService.getAvailableShortIds(limit);
    res.json({
      success: true,
      count: shortIds.length,
      shortIds,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error fetching available shortIds:', error);
    res.status(500).json({ error: 'Failed to fetch available shortIds' });
  }
});

// POST /api/v1/cable-shortid-pool/cancel - 作废shortID
router.post('/cancel', async (req: Request, res: Response) => {
  try {
    const { shortId, reason } = cancelShortIdSchema.parse(req.body);
    await cableShortIdPoolService.cancelShortId(shortId, reason);
    res.json({
      success: true,
      message: `shortID ${shortId} 已作废`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error cancelling shortId:', error);
    res.status(500).json({ error: 'Failed to cancel shortId' });
  }
});

// GET /api/v1/cable-shortid-pool/stats - 获取池统计信息
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await cableShortIdPoolService.getPoolStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    res.status(500).json({ error: 'Failed to fetch pool stats' });
  }
});

// POST /api/v1/cable-shortid-pool/records - 获取池记录（分页）
router.post('/records', async (req: Request, res: Response) => {
  try {
    const { page, pageSize } = getPoolRecordsSchema.parse(req.body);
    const result = await cableShortIdPoolService.getPoolRecords(page, pageSize);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error fetching pool records:', error);
    res.status(500).json({ error: 'Failed to fetch pool records' });
  }
});

export default router;
