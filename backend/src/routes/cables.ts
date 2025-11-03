import { Router, Request, Response } from 'express';
import cableService from '../services/cableService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createCableSchema = z.object({
  label: z.string().optional(),
  type: z.enum(['CAT5E', 'CAT6', 'CAT6A', 'CAT7', 'FIBER_SM', 'FIBER_MM', 'POWER', 'OTHER']),
  length: z.number().positive().optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
  portAId: z.string().cuid(),
  portBId: z.string().cuid(),
});

const updateCableSchema = createCableSchema.partial().omit({ portAId: true, portBId: true });

// GET /api/cables
router.get('/', async (req: Request, res: Response) => {
  try {
    const cables = await cableService.getAllCables();
    res.json(cables);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cables' });
  }
});

// GET /api/cables/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const cable = await cableService.getCableById(req.params.id);
    if (!cable) {
      return res.status(404).json({ error: 'Cable not found' });
    }
    res.json(cable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cable' });
  }
});

// POST /api/cables
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createCableSchema.parse(req.body);
    const cable = await cableService.createCable(validatedData);
    res.status(201).json(cable);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create cable' });
  }
});

// PUT /api/cables/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = updateCableSchema.parse(req.body);
    const cable = await cableService.updateCable(req.params.id, validatedData);
    res.json(cable);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update cable' });
  }
});

// DELETE /api/cables/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await cableService.deleteCable(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete cable' });
  }
});

// GET /api/cables/port/:portId/connection
router.get('/port/:portId/connection', async (req: Request, res: Response) => {
  try {
    const connection = await cableService.getPortConnection(req.params.portId);
    if (!connection) {
      return res.status(404).json({ error: 'No connection found for this port' });
    }
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch port connection' });
  }
});

// GET /api/cables/panel/:panelId/connections
router.get('/panel/:panelId/connections', async (req: Request, res: Response) => {
  try {
    const connections = await cableService.getPanelConnections(req.params.panelId);
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch panel connections' });
  }
});

// GET /api/cables/panel/:panelId/topology
router.get('/panel/:panelId/topology', async (req: Request, res: Response) => {
  try {
    const maxDepth = req.query.depth ? parseInt(req.query.depth as string) : 3;
    const topology = await cableService.getNetworkTopology(req.params.panelId, maxDepth);
    res.json(topology);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch network topology' });
  }
});

export default router;
