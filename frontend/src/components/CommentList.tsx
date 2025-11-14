import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const CommentList = ({ taskId }: { taskId: string }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    const data = await api.get(`/comments?taskId=${taskId}`);
    setComments(data);
    setLoading(false);
  };

  if (loading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment: any) => (
        <div key={comment.id} className="border rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">
              {comment.user?.name || comment.user?.username || 'Unknown'}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: comment.content }}
            className="text-gray-700"
          />
        </div>
      ))}
    </div>
  );
};

