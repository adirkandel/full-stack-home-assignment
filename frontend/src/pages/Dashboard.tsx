import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskBoard } from '../components/TaskBoard';
import { TaskForm } from '../components/TaskForm';
import { TaskView } from '../components/TaskView';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import type { Task } from '../types';

export const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [filters] = useState({});
  const { tasks, loading, createTask, updateTask, deleteTask, refetch } = useTasks(filters);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleCreateTask = async (taskData: any) => {
    await createTask(taskData);
    setShowForm(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {user && (
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {user.name || user.username}!
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {showForm ? 'Cancel' : 'New Task'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <TaskForm onSubmit={handleCreateTask} />
          </div>
        )}

        <TaskBoard
          tasks={tasks}
          loading={loading}
          updateTask={updateTask}
          deleteTask={deleteTask}
          onViewTask={setViewingTask}
        />

        {viewingTask && (
          <TaskView 
            task={viewingTask} 
            onClose={() => setViewingTask(null)}
            onUpdate={refetch}
          />
        )}
      </div>
    </div>
  );
};