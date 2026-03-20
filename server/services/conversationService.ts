import { prisma } from '../db/prisma.js';

export async function listConversations() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return conversations.map((c: (typeof conversations)[number]) => ({
    id: c.id,
    title: c.title,
    lastMessagePreview: c.messages[0]?.content?.slice(0, 120) ?? null,
    updatedAt: c.updatedAt,
    createdAt: c.createdAt,
  }));
}

export async function getConversationById(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
}

export async function createConversationWithUserMessage(message: string) {
  return prisma.conversation.create({
    data: {
      title: message.slice(0, 50) || 'Nouvelle conversation',
      messages: { create: [{ role: 'user', content: message }] },
    },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
}

export async function addUserMessage(conversationId: string, message: string) {
  return prisma.message.create({
    data: { conversationId, role: 'user', content: message },
  });
}

export async function addAssistantMessage(conversationId: string, message: string) {
  return prisma.message.create({
    data: { conversationId, role: 'assistant', content: message },
  });
}

export async function renameConversation(id: string, title: string) {
  return prisma.conversation.update({ where: { id }, data: { title } });
}

export async function deleteConversation(id: string) {
  await prisma.conversation.delete({ where: { id } });
}


