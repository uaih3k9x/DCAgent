import { Router, Request, Response } from 'express';
import workstationService from '../services/workstationService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createWorkstationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  roomId: z.string().uuid('Invalid room ID'),
  cpu: z.string().optional(),
  memory: z.string().optional(),
  storage: z.string().optional(),
  gpu: z.string().optional(),
  os: z.string().optional(),
  status: z.enum(['ONLINE', 'OFFLINE', 'IN_USE', 'IDLE', 'MAINTENANCE', 'FAULTY']).optional(),
  assignedTo: z.string().optional(),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  floorPlanPosition: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  floorPlanSize: z.object({
    width: z.number(),
    depth: z.number(),
  }).optional(),
  notes: z.string().optional(),
});

const updateWorkstationSchema = z.object({
  id: z.string().uuid('Invalid ID'),
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  cpu: z.string().optional(),
  memory: z.string().optional(),
  storage: z.string().optional(),
  gpu: z.string().optional(),
  os: z.string().optional(),
  status: z.enum(['ONLINE', 'OFFLINE', 'IN_USE', 'IDLE', 'MAINTENANCE', 'FAULTY']).optional(),
  assignedTo: z.string().optional(),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  floorPlanPosition: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  floorPlanSize: z.object({
    width: z.number(),
    depth: z.number(),
  }).optional(),
  notes: z.string().optional(),
});

const idSchema = z.object({
  id: z.string().uuid('Invalid ID'),
});

const codeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

const statusSchema = z.object({
  id: z.string().uuid('Invalid ID'),
  status: z.enum(['ONLINE', 'OFFLINE', 'IN_USE', 'IDLE', 'MAINTENANCE', 'FAULTY']),
});

// GET /api/v1/workstations - 获取列表
router.get('/', async (req: Request, res: Response) => {
  try {
    const { roomId, search } = req.query;

    if (search) {
      const workstations = await workstationService.searchWorkstations(search as string);
      return res.json(workstations);
    }

    if (roomId) {
      const workstations = await workstationService.getWorkstationsByRoom(roomId as string);
      return res.json(workstations);
    }

    const workstations = await workstationService.getAllWorkstations();
    res.json(workstations);
  } catch (error) {
    console.error('Error fetching workstations:', error);
    res.status(500).json({ error: 'Failed to fetch workstations' });
  }
});

// POST /api/v1/workstations/get - 获取详情
router.post('/get', async (req: Request, res: Response) => {
  try {
    const { id } = idSchema.parse(req.body);
    const workstation = await workstationService.getWorkstationById(id);
    if (!workstation) {
      return res.status(404).json({ error: 'Workstation not found' });
    }
    res.json(workstation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error fetching workstation:', error);
    res.status(500).json({ error: 'Failed to fetch workstation' });
  }
});

// POST /api/v1/workstations/by-code - 根据code获取详情
router.post('/by-code', async (req: Request, res: Response) => {
  try {
    const { code } = codeSchema.parse(req.body);
    const workstation = await workstationService.getWorkstationByCode(code);
    if (!workstation) {
      return res.status(404).json({ error: 'Workstation not found' });
    }
    res.json(workstation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error fetching workstation by code:', error);
    res.status(500).json({ error: 'Failed to fetch workstation by code' });
  }
});

// POST /api/v1/workstations/create - 创建
router.post('/create', async (req: Request, res: Response) => {
  try {
    const validatedData = createWorkstationSchema.parse(req.body);
    const workstation = await workstationService.createWorkstation(validatedData);
    res.status(201).json(workstation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating workstation:', error);
    res.status(500).json({ error: 'Failed to create workstation' });
  }
});

// POST /api/v1/workstations/update - 更新
router.post('/update', async (req: Request, res: Response) => {
  try {
    const { id, ...updateData } = updateWorkstationSchema.parse(req.body);
    const workstation = await workstationService.updateWorkstation(id, updateData);
    res.json(workstation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating workstation:', error);
    res.status(500).json({ error: 'Failed to update workstation' });
  }
});

// POST /api/v1/workstations/update-status - 更新状态
router.post('/update-status', async (req: Request, res: Response) => {
  try {
    const { id, status } = statusSchema.parse(req.body);
    const workstation = await workstationService.updateWorkstationStatus(id, status);
    res.json(workstation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating workstation status:', error);
    res.status(500).json({ error: 'Failed to update workstation status' });
  }
});

// POST /api/v1/workstations/delete - 删除
router.post('/delete', async (req: Request, res: Response) => {
  try {
    const { id } = idSchema.parse(req.body);
    await workstationService.deleteWorkstation(id);
    res.json({ success: true, message: 'Workstation deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error deleting workstation:', error);
    res.status(500).json({ error: 'Failed to delete workstation' });
  }
});

export default router;
