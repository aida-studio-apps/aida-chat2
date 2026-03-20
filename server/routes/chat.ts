import { Router } from 'express';
import { sendMessageSchema } from '../validators/chatValidators.js';
import {
  addAssistantMessage,
  addUserMessage,
  createConversationWithUserMessage,
  getConversationById,
} from '../services/conversationService.js';
import { getAssistantReply } from '../services/assistantService.js';

export const chatRouter = Router();

chatRouter.post('/message', async (req, res) => {
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Payload invalide' });

  const { conversationId, message } = parsed.data;

  let conversation;
  let userMessage;

  if (!conversationId) {
    conversation = await createConversationWithUserMessage(message);
    userMessage = conversation.messages[0];
  } else {
    conversation = await getConversationById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation introuvable' });
    userMessage = await addUserMessage(conversationId, message);
  }

  const reply = await getAssistantReply(message);
  const assistantMessage = await addAssistantMessage(conversation.id, reply);

  return res.json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      lastMessagePreview: assistantMessage.content.slice(0, 120),
      updatedAt: new Date().toISOString(),
      createdAt: conversation.createdAt,
    },
    userMessage,
    assistantMessage,
  });
});


