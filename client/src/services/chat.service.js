/**
 * Chat Service - Client-side API calls for the chatbot.
 * Uses the existing api.js axios instance for consistent auth/CORS handling.
 */

import api from './api';

export const chatService = {
  /**
   * Send a message to the AI chatbot.
   * @param {string} message - The user's message
   * @param {Array} history - Previous messages [{role, content}]
   * @returns {Promise<{reply: string, toolsUsed: string[], isAuthenticated: boolean, responseTime: number}>}
   */
  sendMessage: async (message, history = []) => {
    const response = await api.post('/chat', { message, history });
    return response.data;
  },

  /**
   * Check if chatbot service is available.
   * @returns {Promise<{available: boolean, model: string, rateLimit: object}>}
   */
  getStatus: async () => {
    const response = await api.get('/chat/status');
    return response.data;
  }
};

export default chatService;
