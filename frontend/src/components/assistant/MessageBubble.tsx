import type { AssistantChat, AssistantMessage } from '../../types';
import { DraftCard } from './DraftCard';

interface MessageBubbleProps {
  message: AssistantMessage;
  onExecuted: (chat: AssistantChat) => Promise<void>;
  onDiscarded: (chat: AssistantChat) => Promise<void>;
}

export const MessageBubble = ({ message, onExecuted, onDiscarded }: MessageBubbleProps) => {
  const isUser = message.role === 'USER';

  return (
    <article
      aria-label={isUser ? 'User message' : 'Assistant message'}
      className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[86%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-lg px-4 py-3 text-sm shadow-sm ${
            isUser
              ? 'bg-cyan-700 text-white'
              : 'border border-gray-200 bg-white text-gray-800'
          }`}
        >
          {message.content}
        </div>
        {message.draft && (
          <DraftCard draftRecord={message.draft} onExecuted={onExecuted} onDiscarded={onDiscarded} />
        )}
      </div>
    </article>
  );
};
