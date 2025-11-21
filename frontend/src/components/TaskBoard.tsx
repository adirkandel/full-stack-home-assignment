import type { Task } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  loading: boolean;
  updateTask: (id: string, data: any) => Promise<any>;
  deleteTask: (id: string) => Promise<void>;
  onViewTask: (task: Task) => void;
}

export const TaskBoard = ({ tasks, loading, updateTask, deleteTask, onViewTask }: TaskBoardProps) => {
  const statuses = [
    { value: 'TODO', label: 'To Do', color: 'bg-blue-50 border-blue-200' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
    { value: 'DONE', label: 'Done', color: 'bg-green-50 border-green-200' }
  ];

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
  };

  const getTasksByStatus = (status: string): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statuses.map(({ value, label, color }) => (
        <div key={value} className="flex flex-col">
          <div className={`${color} border-2 rounded-t-lg p-4`}>
            <h3 className="font-bold text-lg">{label}</h3>
            <span className="text-sm text-gray-600">
              {getTasksByStatus(value).length} tasks
            </span>
          </div>
          
          <div className="bg-gray-50 border-x-2 border-b-2 border-gray-200 rounded-b-lg p-4 min-h-[400px] space-y-3">
            {getTasksByStatus(value).map((task) => (
              <div
                key={task.id}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold mb-2">{task.title}</h4>
                
                {task.description && (
                  <p 
                    className="text-sm text-gray-600 mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: task.description }}
                  />
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {task.priority}
                  </span>
                  {task.assignments && task.assignments.length > 0 && (
                    <span className="text-xs text-gray-500">
                      👥 {task.assignments.length}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mb-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="flex-1 text-xs border rounded px-2 py-1"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewTask(task)}
                    className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};