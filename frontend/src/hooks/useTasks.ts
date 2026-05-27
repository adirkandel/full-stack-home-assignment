import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from '../types';

export const useTasks = (filters?: TaskFilters) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (filters?.search) {
        queryParams.set('search', filters.search);
      }

      if (filters?.status) {
        queryParams.set('status', filters.status);
      }

      if (filters?.priority) {
        queryParams.set('priority', filters.priority);
      }

      const queryString = queryParams.toString();
      const data = await api.get<Task[]>(`/tasks${queryString ? `?${queryString}` : ''}`);
      setTasks(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskInput) => {
    const newTask = await api.post<Task>('/tasks', taskData);
    setTasks((currentTasks) => [newTask, ...currentTasks]);
    return newTask;
  };

  const updateTask = async (id: string, taskData: UpdateTaskInput) => {
    const updatedTask = await api.patch<Task>(`/tasks/${id}`, taskData);
    setTasks((currentTasks) => currentTasks.map((task) => (task.id === id ? updatedTask : task)));
    return updatedTask;
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
};
