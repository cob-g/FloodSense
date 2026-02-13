/**
 * useChatbot Hook
 * Manages chatbot state: messages, loading, sending, and session management.
 * Conversation history is kept in React state (client-only, no server persistence).
 */

import { useState, useCallback, useRef } from 'react';
import chatService from '../services/chat.service';

const MAX_HISTORY = 20; // Max messages to send as context

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'Hi! I\'m the FloodSense AI Assistant. I can help you with:\n\n• **Flood safety** tips and guidance\n• **Evacuation centers** and emergency facilities\n• **Current flood reports** in your area\n• **Sensor water levels** from IoT sensors\n• How to **use the FloodSense app**\n\nHow can I help you today?',
  timestamp: new Date().toISOString()
};

export const useChatbot = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(false);

  /**
   * Send a message and receive AI response.
   */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    abortRef.current = false;

    try {
      // Build history for context (exclude welcome message, limit to last N)
      const history = [...messages, userMessage]
        .filter(m => m.role === 'user' || (m.role === 'assistant' && m !== WELCOME_MESSAGE))
        .slice(-MAX_HISTORY)
        .map(({ role, content }) => ({ role, content }));

      const result = await chatService.sendMessage(text.trim(), history);

      if (abortRef.current) return; // User cleared chat while waiting

      const assistantMessage = {
        role: 'assistant',
        content: result.reply,
        timestamp: new Date().toISOString(),
        toolsUsed: result.toolsUsed || [],
        responseTime: result.responseTime
      };

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
        {
          role: 'assistant',
          content: errorMsg.includes('Too many')
            ? '⚠️ You\'re sending messages too quickly. Please wait a moment before trying again.'
            : '⚠️ Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

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
