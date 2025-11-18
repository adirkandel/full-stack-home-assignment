import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskList } from '../components/TaskList';
import { TaskForm } from '../components/TaskForm';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [filters] = useState({});
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks(filters);

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
      <div className="max-w-6xl mx-auto">
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <TaskList             
            tasks={tasks}
            loading={loading}
            deleteTask={deleteTask}
            updateTask={updateTask} />
        </div>
      </div>
    </div>
  );
};

