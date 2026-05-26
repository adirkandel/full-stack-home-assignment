import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from '../types';

export const useTasks = (filters?: TaskFilters) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams(filters || {}).toString();
    const data = await api.get<Task[]>(`/tasks?${queryParams}`);
    setTasks(data);
    setLoading(false);
  };

  const createTask = async (taskData: CreateTaskInput) => {
    const newTask = await api.post<Task>('/tasks', taskData);
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, taskData: UpdateTaskInput) => {
    const updatedTask = await api.put<Task>(`/tasks/${id}`, taskData);
    setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
    return updatedTask;
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
};

