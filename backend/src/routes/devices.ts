import { Router, Request, Response } from 'express';
import deviceService from '../services/deviceService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createDeviceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['SERVER', 'SWITCH', 'ROUTER', 'FIREWALL', 'STORAGE', 'PDU', 'OTHER']),
  model: z.string().optional(),
  serialNo: z.string().optional(),
  uPosition: z.number().int().positive().optional(),
  uHeight: z.number().int().positive().optional(),
  cabinetId: z.string().cuid(),
});

const updateDeviceSchema = createDeviceSchema.partial().omit({ cabinetId: true });

// GET /api/devices
router.get('/', async (req: Request, res: Response) => {
  try {
    const { cabinetId, search } = req.query;

    if (search) {
      const devices = await deviceService.searchDevices(search as string);
      return res.json(devices);
    }

    if (cabinetId) {
      const devices = await deviceService.getDevicesByCabinet(cabinetId as string);
      return res.json(devices);
    }

    const devices = await deviceService.getAllDevices();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// GET /api/devices/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const device = await deviceService.getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// POST /api/devices
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createDeviceSchema.parse(req.body);
    const device = await deviceService.createDevice(validatedData);
    res.status(201).json(device);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// PUT /api/devices/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = updateDeviceSchema.parse(req.body);
    const device = await deviceService.updateDevice(req.params.id, validatedData);
    res.json(device);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// DELETE /api/devices/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deviceService.deleteDevice(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export default router;
