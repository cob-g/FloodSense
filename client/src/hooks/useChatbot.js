/**
 * useChatbot Hook
 * Manages chatbot state: messages, loading, sending, and session management.
 * Conversation history is kept in React state (client-only, no server persistence).
 */

import { useState, useCallback, useRef } from 'react';
import chatService from '../services/chat.service';

const MAX_HISTORY = 20; // Max messages to send as context

// Monotonic ID counter for stable React keys (avoids array-index keys)
let nextMsgId = 1;
function createMessage(role, content, extra = {}) {
  return {
    id: nextMsgId++,
    role,
    content,
    timestamp: new Date().toISOString(),
    ...extra
  };
}

const WELCOME_MESSAGE = createMessage(
  'assistant',
  'Hi! I\'m the FloodSense AI Assistant. I can help you with:\n\n• **Flood safety** tips and guidance\n• **Historical flood spots** in your area\n• **Current flood reports** in your area\n• **Sensor water levels** from IoT sensors\n• How to **use the FloodSense app**\n\nHow can I help you today?'
);

export const useChatbot = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(false);
  // Keep a ref to messages so sendMessage doesn't depend on the messages state
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  /**
   * Send a message and receive AI response.
   * Uses messagesRef instead of messages in the dependency array to avoid
   * re-creating this callback on every message change (major perf win).
   */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = createMessage('user', text.trim());

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    abortRef.current = false;

    try {
      // Build history for context (exclude welcome message, limit to last N)
      const currentMessages = messagesRef.current;
      const history = [...currentMessages, userMessage]
        .filter(m => m.role === 'user' || (m.role === 'assistant' && m !== WELCOME_MESSAGE))
        .slice(-MAX_HISTORY)
        .map(({ role, content }) => ({ role, content }));

      const result = await chatService.sendMessage(text.trim(), history);

      if (abortRef.current) return; // User cleared chat while waiting

      const assistantMessage = createMessage('assistant', result.reply, {
        toolsUsed: result.toolsUsed || [],
        responseTime: result.responseTime
      });

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      if (abortRef.current) return;

      const errorMsg = err?.message || 'Failed to send message. Please try again.';

      // Handle rate limiting specially
      if (err?.retryAfter || errorMsg.includes('Too many')) {
        setError('You\'re sending messages too fast. Please wait a moment.');
      } else {
        setError(errorMsg);
      }

      // Add error as a system message
      setMessages(prev => [
        ...prev,
        createMessage('assistant',
          errorMsg.includes('Too many')
            ? '⚠️ You\'re sending messages too quickly. Please wait a moment before trying again.'
            : '⚠️ Sorry, I encountered an error. Please try again.',
          { isError: true }
        )
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]); // Only depends on isLoading, not messages

  /**
   * Clear conversation and reset to welcome message.
   */
  const clearChat = useCallback(() => {
    abortRef.current = true;
    setMessages([WELCOME_MESSAGE]);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    messageCount: messages.length
  };
};

export default useChatbot;
