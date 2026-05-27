const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
let accessToken = '';

export const setApiAccessToken = (token: string | null) => {
  accessToken = token || '';
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};

const getErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const data = await response.json();
    if (data?.error && typeof data.error === 'string') {
      return data.error;
    }
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }
  } catch {
    // Non-JSON error response
  }
  return `${fallback} (HTTP ${response.status})`;
};

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskEnergy = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  energyLevel: TaskEnergy;
  category: string;
  dueDate: string; // ISO String
  completedAt: string | null; // ISO String
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface EnergyBreakdownItem {
  total: number;
  completed: number;
  active: number;
}

export interface EnergyBreakdown {
  LOW: EnergyBreakdownItem;
  MEDIUM: EnergyBreakdownItem;
  HIGH: EnergyBreakdownItem;
}

export interface HeatmapItem {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface CategoryData {
  name: string;
  total: number;
  completed: number;
  active: number;
}

export interface DashboardStats {
  productivityScore: number;
  todayPoints: number;
  completionRate: number;
  totalTasksCount: number;
  completedTasksCount: number;
  activeTasksCount: number;
  completedTodayCount: number;
  heatmapData: HeatmapItem[];
  energyBreakdown: EnergyBreakdown;
  categoryData: CategoryData[];
}

export interface FetchTasksParams {
  search?: string;
  status?: string[];
  energyLevel?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const api = {
  getTasks: async (params?: FetchTasksParams): Promise<Task[]> => {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.append('search', params.search);
      if (params.status && params.status.length > 0) {
        query.append('status', params.status.join(','));
      }
      if (params.energyLevel) query.append('energyLevel', params.energyLevel);
      if (params.category) query.append('category', params.category);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    }

    const response = await fetch(`${API_BASE_URL}/tasks?${query.toString()}`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to fetch tasks'));
    }
    return response.json();
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to fetch task'));
    }
    return response.json();
  },

  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to create task'));
    }
    return response.json();
  },

  updateTask: async (id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to update task'));
    }
    return response.json();
  },

  deleteTask: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to delete task'));
    }
  },

  getStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to fetch stats'));
    }
    return response.json();
  },
};
