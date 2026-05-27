"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Zod validation schemas
const TaskCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters long"),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).default('TODO'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    energyLevel: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    category: zod_1.z.string().min(1, "Category is required"),
    dueDate: zod_1.z.string()
        .min(1, 'Due date is required')
        .transform((str) => new Date(str))
        .refine((date) => !Number.isNaN(date.getTime()), 'Due date must be a valid date')
});
const TaskUpdateSchema = TaskCreateSchema.partial();
// GET all tasks (with filtering, searching, and sorting)
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        const { search, status, energyLevel, category, sortBy, sortOrder } = req.query;
        let tasks = await db_1.db.task.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc' // Default ordering
            }
        });
        // Apply client-side search filtering
        if (search) {
            const searchLower = String(search).toLowerCase();
            tasks = tasks.filter(task => task.title.toLowerCase().includes(searchLower) ||
                (task.description && task.description.toLowerCase().includes(searchLower)));
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
            tasks.sort((a, b) => {
                let valA = a[field];
                let valB = b[field];
                // Priority weight mapping
                if (field === 'priority') {
                    const priorityWeights = { LOW: 1, MEDIUM: 2, HIGH: 3 };
                    valA = priorityWeights[a.priority] || 0;
                    valB = priorityWeights[b.priority] || 0;
                }
                // Energy weight mapping
                if (field === 'energyLevel') {
                    const energyWeights = { LOW: 1, MEDIUM: 2, HIGH: 3 };
                    valA = energyWeights[a.energyLevel] || 0;
                    valB = energyWeights[b.energyLevel] || 0;
                }
                if (valA === valB)
                    return 0;
                if (valA === null || valA === undefined)
                    return 1;
                if (valB === null || valB === undefined)
                    return -1;
                if (valA instanceof Date && valB instanceof Date) {
                    return isAsc ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
                }
                if (isAsc) {
                    return valA > valB ? 1 : -1;
                }
                else {
                    return valA < valB ? 1 : -1;
                }
            });
        }
        res.json(tasks);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
});
// GET task by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const task = await db_1.db.task.findUnique({
            where: { id: req.params.id, userId }
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});
// POST create task
router.post('/', async (req, res) => {
    try {
        const userId = req.userId;
        const parseResult = TaskCreateSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            });
        }
        const newTask = await db_1.db.task.create({
            data: {
                ...parseResult.data,
                userId
            }
        });
        res.status(201).json(newTask);
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});
// PUT update task
router.patch('/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const parseResult = TaskUpdateSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            });
        }
        const updatedTask = await db_1.db.task.update({
            where: { id: req.params.id, userId },
            data: parseResult.data
        });
        res.json(updatedTask);
    }
    catch (error) {
        console.error('Error updating task:', error);
        if (error instanceof Error && error.message.toLowerCase().includes('not found')) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(500).json({ error: 'Failed to update task' });
    }
});
// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const deletedTask = await db_1.db.task.delete({
            where: { id: req.params.id, userId }
        });
        res.json({ message: 'Task deleted successfully', task: deletedTask });
    }
    catch (error) {
        console.error('Error deleting task:', error);
        if (error instanceof Error && error.message.toLowerCase().includes('not found')) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(500).json({ error: 'Failed to delete task' });
    }
});
exports.default = router;
