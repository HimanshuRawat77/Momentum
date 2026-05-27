import { Router, Request, Response } from 'express';
import { db } from '../db';
import { z } from 'zod';
import { AuthenticatedRequest } from '../auth';

const router = Router();

// Zod validation schemas
const TaskCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  category: z.string().min(1, "Category is required"),
  dueDate: z.string()
    .min(1, 'Due date is required')
    .transform((str) => new Date(str))
    .refine((date) => !Number.isNaN(date.getTime()), 'Due date must be a valid date')
});

const TaskUpdateSchema = TaskCreateSchema.partial();

// GET all tasks (with filtering, searching, and sorting)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { search, status, energyLevel, category, sortBy, sortOrder } = req.query;

    let tasks = await db.task.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc' // Default ordering
      }
    });

    // Apply client-side search filtering
    if (search) {
      const searchLower = String(search).toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) || 
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filtering
    if (status) {
      const statuses = String(status).split(',');
      tasks = tasks.filter(task => statuses.includes(task.status));
    }

    // Apply energyLevel filtering
    if (energyLevel) {
      tasks = tasks.filter(task => task.energyLevel === energyLevel);
    }

    // Apply category filtering
    if (category) {
      tasks = tasks.filter(task => task.category === category);
    }

    // Apply sorting
    if (sortBy) {
      const field = String(sortBy);
      const isAsc = sortOrder === 'asc';

      tasks.sort((a: any, b: any) => {
        let valA = a[field];
        let valB = b[field];

        // Priority weight mapping
        if (field === 'priority') {
          const priorityWeights = { LOW: 1, MEDIUM: 2, HIGH: 3 };
          valA = priorityWeights[a.priority as keyof typeof priorityWeights] || 0;
          valB = priorityWeights[b.priority as keyof typeof priorityWeights] || 0;
        }

        // Energy weight mapping
        if (field === 'energyLevel') {
          const energyWeights = { LOW: 1, MEDIUM: 2, HIGH: 3 };
          valA = energyWeights[a.energyLevel as keyof typeof energyWeights] || 0;
          valB = energyWeights[b.energyLevel as keyof typeof energyWeights] || 0;
        }

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (valA instanceof Date && valB instanceof Date) {
          return isAsc ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
        }

        if (isAsc) {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    }

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// GET task by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const task = await db.task.findUnique({
      where: { id: req.params.id, userId }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST create task
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const parseResult = TaskCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parseResult.error.flatten().fieldErrors 
      });
    }

    const newTask = await db.task.create({
      data: {
        ...parseResult.data,
        userId
      }
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const parseResult = TaskUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parseResult.error.flatten().fieldErrors 
      });
    }

    const updatedTask = await db.task.update({
      where: { id: req.params.id, userId },
      data: parseResult.data
    });
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error instanceof Error && error.message.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const deletedTask = await db.task.delete({
      where: { id: req.params.id, userId }
    });
    res.json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    if (error instanceof Error && error.message.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
