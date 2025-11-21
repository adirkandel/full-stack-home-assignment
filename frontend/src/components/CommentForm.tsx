import { useState } from 'react';
import { api } from '../services/api';

export const CommentForm = ({ taskId, onCommentAdded }: { 
  taskId: string; 
  onCommentAdded: () => void;
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/comments', { taskId, content });
      setContent('');
      onCommentAdded(); // Notify parent to refresh comments
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-2 border rounded"
        required
      />
      <button 
        type="submit" 
        disabled={loading}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? 'Submitting...' : 'Add Comment'}
      </button>
    </form>
  );
};