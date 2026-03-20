export interface ConversationSummary {
  id: string;
  title: string;
  lastMessagePreview: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ConversationDetail {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  createdAt: string;
}
