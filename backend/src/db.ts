import { PrismaClient, Task } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const JSON_DB_PATH = path.join(__dirname, '../database.json');
const isDbConfigured = !!process.env.DATABASE_URL;

let prismaClient: PrismaClient | null = null;
if (isDbConfigured) {
  try {
    prismaClient = new PrismaClient();
  } catch (err) {
    console.error('Failed to initialize Prisma client, falling back to JSON DB:', err);
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface JsonDbData {
  tasks: any[];
}

function loadJsonDb(): JsonDbData {
  if (!fs.existsSync(JSON_DB_PATH)) {
    const dbData = { tasks: [] };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
    return dbData;
  }
  try {
    const fileContent = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading JSON DB file, returning empty store:', error);
    return { tasks: [] };
  }
}

function saveJsonDb(data: JsonDbData) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to JSON DB file:', error);
  }
}

export const db = {
  task: {
    findMany: async (args?: { where?: any; orderBy?: any }) => {
      if (prismaClient) {
        return prismaClient.task.findMany(args);
      }

      const dbData = loadJsonDb();
      let filteredTasks = [...dbData.tasks];

      if (args && args.where) {
        const where = args.where;
        filteredTasks = filteredTasks.filter(task => {
          for (const key in where) {
            if (where[key] !== undefined) {
              if (key === 'status' && where.status) {
                if (where.status.in && Array.isArray(where.status.in)) {
                  if (!where.status.in.includes(task.status)) return false;
                } else if (task.status !== where.status) {
                  return false;
                }
              } else if (key === 'energyLevel' && where.energyLevel) {
                if (task.energyLevel !== where.energyLevel) return false;
              } else if (task[key] !== where[key]) {
                return false;
              }
            }
          }
          return true;
        });
      }

      if (args && args.orderBy) {
        const orderBy = args.orderBy;
        filteredTasks.sort((a, b) => {
          for (const field in orderBy) {
            const direction = orderBy[field];
            const valA = a[field];
            const valB = b[field];
            if (valA === valB) continue;

            if (field === 'dueDate' || field === 'createdAt' || field === 'completedAt') {
              const timeA = valA ? new Date(valA).getTime() : 0;
              const timeB = valB ? new Date(valB).getTime() : 0;
              return direction === 'asc' ? timeA - timeB : timeB - timeA;
            }

            if (direction === 'asc') {
              return valA > valB ? 1 : -1;
            }
            return valA < valB ? 1 : -1;
          }
          return 0;
        });
      }

      return filteredTasks.map(t => ({
        ...t,
        dueDate: new Date(t.dueDate),
        completedAt: t.completedAt ? new Date(t.completedAt) : null,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      })) as Task[];
    },

    findUnique: async (args: { where: { id: string; userId?: string } }) => {
      if (prismaClient) {
        return prismaClient.task.findUnique({ where: { id: args.where.id } });
      }
      const dbData = loadJsonDb();
      const task = dbData.tasks.find(
        t => t.id === args.where.id && (!args.where.userId || t.userId === args.where.userId)
      );
      if (!task) return null;
      return {
        ...task,
        dueDate: new Date(task.dueDate),
        completedAt: task.completedAt ? new Date(task.completedAt) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      } as Task;
    },

    create: async (args: { data: any }) => {
      if (prismaClient) {
        return prismaClient.task.create(args);
      }
      const dbData = loadJsonDb();
      const newTask = {
        id: generateUUID(),
        userId: args.data.userId,
        title: args.data.title,
        description: args.data.description || null,
        status: args.data.status || 'TODO',
        priority: args.data.priority || 'MEDIUM',
        energyLevel: args.data.energyLevel || 'MEDIUM',
        category: args.data.category,
        dueDate: new Date(args.data.dueDate).toISOString(),
        completedAt: args.data.status === 'COMPLETED' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dbData.tasks.push(newTask);
      saveJsonDb(dbData);

      return {
        ...newTask,
        dueDate: new Date(newTask.dueDate),
        completedAt: newTask.completedAt ? new Date(newTask.completedAt) : null,
        createdAt: new Date(newTask.createdAt),
        updatedAt: new Date(newTask.updatedAt)
      } as Task;
    },

    update: async (args: { where: { id: string; userId?: string }; data: any }) => {
      if (prismaClient) {
        const existing = await prismaClient.task.findUnique({ where: { id: args.where.id } });
        if (!existing || (args.where.userId && existing.userId !== args.where.userId)) {
          throw new Error(`Record to update not found: ${args.where.id}`);
        }
        return prismaClient.task.update({ where: { id: args.where.id }, data: args.data });
      }

      const dbData = loadJsonDb();
      const taskIndex = dbData.tasks.findIndex(
        t => t.id === args.where.id && (!args.where.userId || t.userId === args.where.userId)
      );
      if (taskIndex === -1) {
        throw new Error(`Record to update not found: ${args.where.id}`);
      }

      const existingTask = dbData.tasks[taskIndex];
      const updatedFields = args.data;

      let completedAt = existingTask.completedAt;
      if (updatedFields.status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
        completedAt = new Date().toISOString();
      } else if (updatedFields.status && updatedFields.status !== 'COMPLETED') {
        completedAt = null;
      }

      const updatedTask = {
        ...existingTask,
        ...updatedFields,
        completedAt,
        updatedAt: new Date().toISOString()
      };

      dbData.tasks[taskIndex] = updatedTask;
      saveJsonDb(dbData);

      return {
        ...updatedTask,
        dueDate: new Date(updatedTask.dueDate),
        completedAt: updatedTask.completedAt ? new Date(updatedTask.completedAt) : null,
        createdAt: new Date(updatedTask.createdAt),
        updatedAt: new Date(updatedTask.updatedAt)
      } as Task;
    },

    delete: async (args: { where: { id: string; userId?: string } }) => {
      if (prismaClient) {
        const existing = await prismaClient.task.findUnique({ where: { id: args.where.id } });
        if (!existing || (args.where.userId && existing.userId !== args.where.userId)) {
          throw new Error(`Record to delete not found: ${args.where.id}`);
        }
        return prismaClient.task.delete({ where: { id: args.where.id } });
      }

      const dbData = loadJsonDb();
      const taskIndex = dbData.tasks.findIndex(
        t => t.id === args.where.id && (!args.where.userId || t.userId === args.where.userId)
      );
      if (taskIndex === -1) {
        throw new Error(`Record to delete not found: ${args.where.id}`);
      }
      const deletedTask = dbData.tasks.splice(taskIndex, 1)[0];
      saveJsonDb(dbData);
      return {
        ...deletedTask,
        dueDate: new Date(deletedTask.dueDate),
        completedAt: deletedTask.completedAt ? new Date(deletedTask.completedAt) : null,
        createdAt: new Date(deletedTask.createdAt),
        updatedAt: new Date(deletedTask.updatedAt)
      } as Task;
    }
  }
};

console.log(`[Database] Initialized in ${isDbConfigured ? 'Prisma/Supabase PostgreSQL' : 'Fallback JSON (empty)'} mode.`);
