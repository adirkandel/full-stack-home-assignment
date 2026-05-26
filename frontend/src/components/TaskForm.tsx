import { useState, type FormEvent } from 'react';
import { TASK_PRIORITIES, TASK_PRIORITY, TASK_STATUSES, TASK_STATUS } from '../types';
import type { TaskEditableFields, TaskPriority, TaskStatus } from '../types';

interface TaskFormProps {
  onSubmit: (taskData: TaskEditableFields) => Promise<void> | void;
}

export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [formData, setFormData] = useState<TaskEditableFields>({
    title: '',
    description: '',
    status: TASK_STATUS.Todo,
    priority: TASK_PRIORITY.Medium,
  });

  const handleFieldChange = <Field extends keyof TaskEditableFields>(
    field: Field,
    value: TaskEditableFields[Field],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={(e) => handleFieldChange('status', e.target.value as TaskStatus)}
          className="w-full border rounded px-3 py-2"
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={(e) => handleFieldChange('priority', e.target.value as TaskPriority)}
          className="w-full border rounded px-3 py-2"
        >
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Create Task
      </button>
    </form>
  );
};
