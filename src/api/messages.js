import api from './client.js';

export const messagesApi = {
  // Conversations
  getConversations: ()                      => api.get('/messages/conversations'),
  startConversation: (data)                 => api.post('/messages/conversations', data),

  // Messages
  getMessages: (conversationId, params)     => api.get(`/messages/${conversationId}`, { params }),
  sendMessage: (conversationId, body)       => api.post(`/messages/${conversationId}`, { body }),
  deleteMessage: (conversationId, messageId) => api.delete(`/messages/${conversationId}/${messageId}`),
};
