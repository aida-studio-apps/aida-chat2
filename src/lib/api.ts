import type { ConversationDetail, ConversationSummary } from '../types/chat';

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const r = await fetch('/api/conversations');
  if (!r.ok) throw new Error('Erreur chargement conversations');
  return r.json();
}

export async function fetchConversation(id: string): Promise<ConversationDetail> {
  const r = await fetch(`/api/conversations/${id}`);
  if (!r.ok) throw new Error('Conversation introuvable');
  return r.json();
}

export async function sendMessage(payload: { conversationId?: string; message: string }) {
  const r = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Erreur envoi message');
  return r.json();
}

export async function renameConversation(id: string, title: string) {
  const r = await fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!r.ok) throw new Error('Erreur renommage');
  return r.json();
}

export async function deleteConversation(id: string) {
  const r = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Erreur suppression');
}
