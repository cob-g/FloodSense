/**
 * ChatWindow Component
 * The chat conversation panel that opens when user clicks the ChatBubble.
 * Handles message display, input, auto-scroll, and markdown-like formatting.
 */

import { useState, useRef, useEffect, memo } from 'react';

// ─── Message Bubble Component ────────────────────────────────────
const ChatMessage = memo(({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  // Simple markdown-like formatting for bold and bullet points
  const formatContent = (text) => {
    if (!text) return '';

    return text.split('\n').map((line, i) => {
      // Bold text: **text**
      
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formatted = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={i} className="flex items-start gap-1.5 ml-1">
            <span className="text-orange-400 mt-0.5 shrink-0">•</span>
            <span>{formatted.map((f, idx) => typeof f === 'string' ? f.replace(/^[•-]\s*/, '') : f)}</span>
          </div>
        );
      }

      return (
        <span key={i}>
          {formatted}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md ${
          isUser
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md'
            : isError
              ? 'bg-red-900/30 border border-red-500/40 text-red-200 rounded-bl-md'
              : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-md'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {formatContent(message.content)}
        </div>
        {message.responseTime && !isUser && (
          <div className="text-[10px] text-gray-500 mt-1.5 text-right">
            {message.responseTime}ms
          </div>
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

// ─── Typing Indicator ────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex justify-start mb-3">
    <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// ─── Quick Action Buttons ────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: '🏠 Evacuation Centers', message: 'Where are the evacuation centers?' },
  { label: '🌊 Flood Reports', message: 'What are the recent flood reports?' },
  { label: '📡 Sensor Status', message: 'What are the current sensor readings?' },
  { label: '🛡️ Safety Tips', message: 'What should I do during a flood?' },
];

// ─── Main ChatWindow Component ───────────────────────────────────
const ChatWindow = ({ messages, isLoading, onSend, onClear, onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (msg) => {
    if (isLoading) return;
    onSend(msg);
  };

  const showQuickActions = messages.length <= 1; // Only show on first interaction

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-[2500] w-[calc(100vw-2rem)] sm:w-[400px] max-h-[calc(100vh-8rem)] flex flex-col bg-[#1a1a2e] backdrop-blur-xl border border-orange-500/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-b border-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a2e]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">FloodSense AI</h3>
            <p className="text-[10px] text-white/50">Powered by Groq</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
            title="Close chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 min-h-[300px] max-h-[400px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-[#16161e]">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        {/* Quick Actions */}
        {showQuickActions && !isLoading && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium px-1">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action.message)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl bg-gray-800 border border-orange-500/30 text-gray-200 hover:text-white hover:bg-gray-700 hover:border-orange-500/60 transition-all duration-200 active:scale-95"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 py-3 border-t border-orange-500/20 bg-[#1a1a2e]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about flood safety..."
            rows={1}
            maxLength={500}
            className="flex-1 resize-none rounded-xl bg-gray-900 border border-orange-500/30 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/25 transition-all duration-200 scrollbar-thin scrollbar-thumb-white/10"
            style={{ minHeight: '40px', maxHeight: '100px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[10px] text-gray-500">
            {input.length}/500
          </span>
          <span className="text-[10px] text-gray-500">
            Enter to send · Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
