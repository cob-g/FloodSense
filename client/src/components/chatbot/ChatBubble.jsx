/**
 * ChatBubble Component
 * Floating action button that toggles the chat window.
 * Positioned at bottom-right, above the fold. Renders the ChatWindow when open.
 */

import { useState, useCallback } from 'react';
import ChatWindow from './ChatWindow';
import { useChatbot } from '../../hooks/useChatbot';

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearChat } = useChatbot();

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onClear={clearChat}
          onClose={handleClose}
        />
      )}

      {/* Floating Bubble Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-4 sm:right-6 z-[2500] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 group ${
          isOpen
            ? 'bg-white/10 backdrop-blur-xl border border-white/20 rotate-0'
            : 'bg-gradient-to-br from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 hover:scale-110 shadow-accent-500/30 hover:shadow-accent-500/50'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open FloodSense AI chat'}
        title={isOpen ? 'Close chat' : 'Ask FloodSense AI'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {/* Pulse ring effect */}
            <span className="absolute inset-0 rounded-full bg-accent-500 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          </>
        )}
      </button>

      {/* Tooltip on hover (only when closed) */}
      {!isOpen && (
        <div className="fixed bottom-[5.5rem] right-4 sm:right-6 z-[2499] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-space-900/95 backdrop-blur-sm border border-white/10 text-white/80 text-xs px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            FloodSense AI Assistant
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBubble;
