import { PrismaClient, Workstation, WorkstationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateWorkstationInput {
  name: string;
  code?: string;
  roomId: string;
  cpu?: string;
  memory?: string;
  storage?: string;
  gpu?: string;
  os?: string;
  status?: WorkstationStatus;
  assignedTo?: string;
  ipAddress?: string;
  macAddress?: string;
  floorPlanPosition?: { x: number; y: number };
  floorPlanSize?: { width: number; depth: number };
  notes?: string;
}

export interface UpdateWorkstationInput {
  name?: string;
  code?: string;
  cpu?: string;
  memory?: string;
  storage?: string;
  gpu?: string;
  os?: string;
  status?: WorkstationStatus;
  assignedTo?: string;
  ipAddress?: string;
  macAddress?: string;
  floorPlanPosition?: { x: number; y: number };
  floorPlanSize?: { width: number; depth: number };
  notes?: string;
}

class WorkstationService {
  async getAllWorkstations(): Promise<Workstation[]> {
    return prisma.workstation.findMany({
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getWorkstationById(id: string): Promise<Workstation | null> {
    return prisma.workstation.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
      },
    });
  }

  async getWorkstationByCode(code: string): Promise<Workstation | null> {
    return prisma.workstation.findUnique({
      where: { code },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
      },
    });
  }

  async getWorkstationsByRoom(roomId: string): Promise<Workstation[]> {
    return prisma.workstation.findMany({
      where: { roomId },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createWorkstation(data: CreateWorkstationInput): Promise<Workstation> {
    return prisma.workstation.create({
      data: {
        ...data,
        floorPlanPosition: data.floorPlanPosition || undefined,
        floorPlanSize: data.floorPlanSize || undefined,
      },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
      },
    });
  }

  async updateWorkstation(id: string, data: UpdateWorkstationInput): Promise<Workstation> {
    return prisma.workstation.update({
      where: { id },
      data: {
        ...data,
        floorPlanPosition: data.floorPlanPosition || undefined,
        floorPlanSize: data.floorPlanSize || undefined,
      },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
      },
    });
  }

  async deleteWorkstation(id: string): Promise<Workstation> {
    return prisma.workstation.delete({
      where: { id },
    });
  }

  async searchWorkstations(query: string): Promise<Workstation[]> {
    return prisma.workstation.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { assignedTo: { contains: query, mode: 'insensitive' } },
          { ipAddress: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
      },
    });
  }

  async updateWorkstationStatus(id: string, status: WorkstationStatus): Promise<Workstation> {
    return prisma.workstation.update({
      where: { id },
      data: { status },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
      },
    });
  }
}

export default new WorkstationService();
