import { prisma } from '../db/prisma';
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
    return conversations.map((c) => ({
        id: c.id,
        title: c.title,
        lastMessagePreview: c.messages[0]?.content?.slice(0, 120) ?? null,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
    }));
}
export async function getConversationById(id) {
    return prisma.conversation.findUnique({
        where: { id },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
}
export async function createConversationWithUserMessage(message) {
    return prisma.conversation.create({
        data: {
            title: message.slice(0, 50) || 'Nouvelle conversation',
            messages: { create: [{ role: 'user', content: message }] },
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
}
export async function addUserMessage(conversationId, message) {
    return prisma.message.create({
        data: { conversationId, role: 'user', content: message },
    });
}
export async function addAssistantMessage(conversationId, message) {
    return prisma.message.create({
        data: { conversationId, role: 'assistant', content: message },
    });
}
export async function renameConversation(id, title) {
    return prisma.conversation.update({ where: { id }, data: { title } });
}
export async function deleteConversation(id) {
    await prisma.conversation.delete({ where: { id } });
}
