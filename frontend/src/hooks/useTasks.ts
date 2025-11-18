import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useTasks = (filters?: any) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams(filters || {}).toString();
    const data = await api.get<any[]>(`/tasks?${queryParams}`);
    setTasks(data);
    setLoading(false);
  };

  const createTask = async (taskData: any) => {
    const newTask = await api.post('/tasks', taskData);
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, taskData: any) => {
    const updatedTask = await api.put(`/tasks/${id}`, taskData);
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

