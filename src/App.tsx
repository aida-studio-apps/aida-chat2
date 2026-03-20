import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  deleteConversation,
  fetchConversation,
  fetchConversations,
  renameConversation,
  sendMessage,
} from './lib/api';
import type { ConversationDetail, ConversationSummary } from './types/chat';

function App() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<ConversationDetail | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    const items = await fetchConversations();
    setConversations(items);
    if (!activeId && items[0]) setActiveId(items[0].id);
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (!activeId) {
      setActive(null);
      return;
    }
    void fetchConversation(activeId).then(setActive);
  }, [activeId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    try {
      const res = await sendMessage({ conversationId: activeId ?? undefined, message });
      setMessage('');
      setActiveId(res.conversation.id);
      await loadConversations();
      const detail = await fetchConversation(res.conversation.id);
      setActive(detail);
    } finally {
      setLoading(false);
    }
  };

  const title = useMemo(() => active?.title ?? 'Nouvelle conversation', [active]);

  return (
    <div className="h-screen flex bg-slate-50 text-slate-900">
      <aside className="w-80 border-r bg-white p-4 overflow-auto">
        <button
          className="w-full mb-3 px-3 py-2 rounded bg-slate-900 text-white"
          onClick={() => setActiveId(null)}
        >
          + Nouvelle conversation
        </button>
        {conversations.map((c) => (
          <div key={c.id} className="mb-2 p-2 rounded border">
            <button className="text-left w-full" onClick={() => setActiveId(c.id)}>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-slate-500 truncate">{c.lastMessagePreview ?? 'Aucun message'}</div>
            </button>
            <div className="mt-2 flex gap-2">
              <button
                className="text-xs px-2 py-1 border rounded"
                onClick={async () => {
                  const t = prompt('Nouveau titre', c.title);
                  if (t?.trim()) {
                    await renameConversation(c.id, t.trim());
                    await loadConversations();
                    if (activeId === c.id) setActive(await fetchConversation(c.id));
                  }
                }}
              >
                Renommer
              </button>
              <button
                className="text-xs px-2 py-1 border rounded text-red-600"
                onClick={async () => {
                  if (confirm('Supprimer cette conversation ?')) {
                    await deleteConversation(c.id);
                    if (activeId === c.id) setActiveId(null);
                    await loadConversations();
                  }
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b bg-white p-4 font-semibold">{title}</header>
        <section className="flex-1 overflow-auto p-4 space-y-3">
          {active?.messages?.map((m) => (
            <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div
                className={`inline-block px-3 py-2 rounded max-w-[70%] ${
                  m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {!active && <p className="text-slate-500">Commencez une nouvelle conversation.</p>}
        </section>
        <form onSubmit={onSubmit} className="border-t bg-white p-4 flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Écrivez votre question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="px-4 py-2 rounded bg-slate-900 text-white" disabled={loading}>
            Envoyer
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
