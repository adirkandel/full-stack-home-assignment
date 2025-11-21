import { useState } from 'react';
import { CommentList } from './CommentList';
import { UserAutocomplete } from './UserAutocomplete';
import { api } from '../services/api';
import type { User, Task, TaskAssignment } from '../types';

interface TaskViewProps {
  task: Task;
  onClose: () => void;
  onUpdate?: () => void;
}

export const TaskView = ({ task, onClose, onUpdate }: TaskViewProps) => {
  const [assignments, setAssignments] = useState<TaskAssignment[]>(task.assignments || []);

  const handleAssignUser = async (user: User) => {
    try {
      await api.post(`/tasks/${task.id}/assign`, { userId: user.id });
      setAssignments([...assignments, { id: '', taskId: task.id, userId: user.id, user }]);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to assign user:', error);
    }
  };

  const handleUnassignUser = async (userId: string) => {
    try {
      await api.delete(`/tasks/${task.id}/assign/${userId}`);
      setAssignments(assignments.filter((a) => a.userId !== userId));
      onUpdate?.();
    } catch (error) {
      console.error('Failed to unassign user:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{task.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: task.description || '' }}></p>
          </div>

          <div className="flex gap-2 mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
              {task.status}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded">
              {task.priority}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Assigned Users</h3>
            <div className="space-y-2 mb-3">
              {assignments.map((assignment) => (
                <div key={assignment.userId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>{assignment.user?.name || assignment.user?.username}</span>
                  <button
                    onClick={() => handleUnassignUser(assignment.userId)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <UserAutocomplete onSelect={handleAssignUser} placeholder="Assign user..." />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            <CommentList taskId={task.id} />
          </div>
        </div>
      </div>
    </div>
  );
};