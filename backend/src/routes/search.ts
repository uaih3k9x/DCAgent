import { Router, Request, Response } from 'express';
import searchService from '../services/searchService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const globalSearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
});

const shortIdSchema = z.object({
  shortId: z.number().int().positive('Invalid shortId'),
});

// POST /api/v1/search/global - 全局搜索
router.post('/global', async (req: Request, res: Response) => {
  try {
    const { query } = globalSearchSchema.parse(req.body);
    const results = await searchService.globalSearch(query);
    res.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error in global search:', error);
    res.status(500).json({ error: 'Failed to perform global search' });
  }
});

// POST /api/v1/search/by-shortid - 根据shortId查找
router.post('/by-shortid', async (req: Request, res: Response) => {
  try {
    const { shortId } = shortIdSchema.parse(req.body);
    const result = await searchService.findByShortId(shortId);

    if (!result) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error finding by shortId:', error);
    res.status(500).json({ error: 'Failed to find entity by shortId' });
  }
});

export default router;
