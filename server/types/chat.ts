export type MessageRole = 'user' | 'assistant';

export interface AssistantReplyInput {
  conversationId: string;
  userMessage: string;
}
