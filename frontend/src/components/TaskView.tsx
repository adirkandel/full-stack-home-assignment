import { CommentList } from './CommentList';

interface TaskViewProps {
  task: any;
  onClose: () => void;
}

export const TaskView = ({ task, onClose }: TaskViewProps) => {
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

          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            <CommentList taskId={task.id} />
          </div>
        </div>
      </div>
    </div>
  );
};