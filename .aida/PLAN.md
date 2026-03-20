# Plan d’implémentation — Application de chat avec historique

## 1. Stack technique

### Template choisi
- **Template : `express-fullstack-ai`**
- **Justification :**
  - L’application nécessite un **frontend React** (écran de chat + sidebar d’historique) et un **backend API** (persistance des conversations/messages, renommage, suppression, appel IA).
  - Le cahier des charges demande un assistant intelligent : le template IA fournit un client Azure OpenAI prêt à l’emploi et des endpoints d’exemple.
  - La conservation des conversations impose une persistance durable : **Prisma + PostgreSQL**.

### Technologies principales
- **Frontend :** React + TypeScript + Vite + Tailwind CSS
- **Backend :** Express + TypeScript
- **IA :** Azure OpenAI via client serveur pré-configuré (`server/ai-client.ts`)
- **Base de données :** PostgreSQL via Prisma ORM

### Dépendances supplémentaires à prévoir
> Le scaffold installe la base du template. Les dépendances ci-dessous seront ajoutées ensuite par l’Agent Principal.

- Côté frontend :
  - `react-router-dom` (navigation entre conversation active et état vide)
  - `lucide-react` (icônes UI : supprimer, renommer, nouveau chat)
  - `date-fns` (formatage lisible des dates dans l’historique)
  - `clsx` (composition de classes Tailwind)
- Côté backend / commun :
  - `zod` (validation de payloads API)
  - `@prisma/client` (client Prisma runtime)
- Dev dependencies :
  - `prisma` (CLI migrations + génération client)

---

## 2. Arborescence des fichiers

```text
/workspace/
├── prisma/
│   └── schema.prisma
├── server/
│   ├── ai-client.ts
│   ├── db/
│   │   └── prisma.ts
│   ├── types/
│   │   └── chat.ts
│   ├── validators/
│   │   └── chatValidators.ts
│   ├── services/
│   │   ├── conversationService.ts
│   │   └── assistantService.ts
│   ├── routes/
│   │   ├── conversations.ts
│   │   └── chat.ts
│   └── index.ts
├── client/
│   ├── src/
│   │   ├── types/
│   │   │   └── chat.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── date.ts
│   │   ├── hooks/
│   │   │   ├── useConversations.ts
│   │   │   └── useChat.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── conversation/
│   │   │   │   ├── ConversationList.tsx
│   │   │   │   ├── ConversationListItem.tsx
│   │   │   │   ├── RenameConversationDialog.tsx
│   │   │   │   └── DeleteConversationDialog.tsx
│   │   │   └── chat/
│   │   │       ├── ChatView.tsx
│   │   │       ├── MessageList.tsx
│   │   │       ├── MessageBubble.tsx
│   │   │       └── MessageComposer.tsx
│   │   ├── pages/
│   │   │   ├── ChatPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
└── README.md
```

### Description de chaque fichier à créer
- `prisma/schema.prisma` : schéma DB des conversations et messages, indexes de tri/filtrage.
- `server/db/prisma.ts` : singleton PrismaClient pour éviter les instances multiples.
- `server/types/chat.ts` : types métier backend (DTO internes).
- `server/validators/chatValidators.ts` : schémas Zod pour créer message, renommer, supprimer.
- `server/services/conversationService.ts` : logique CRUD conversation + récupération historique.
- `server/services/assistantService.ts` : orchestration prompt + appel Azure OpenAI + persistance réponse.
- `server/routes/conversations.ts` : routes REST pour l’historique, sélection, renommage, suppression.
- `server/routes/chat.ts` : route d’envoi message utilisateur et réponse assistant.
- `server/index.ts` : montage des routes API et middlewares.
- `client/src/types/chat.ts` : types partagés côté UI (Conversation, Message, payloads API).
- `client/src/lib/api.ts` : fonctions HTTP vers `/api/...`.
- `client/src/lib/date.ts` : helpers format date pour sidebar.
- `client/src/hooks/useConversations.ts` : chargement liste historique + actions rename/delete/select.
- `client/src/hooks/useChat.ts` : gestion messages conversation active + envoi message.
- `client/src/components/layout/AppShell.tsx` : layout global (sidebar + zone principale).
- `client/src/components/layout/Sidebar.tsx` : conteneur barre latérale historique.
- `client/src/components/conversation/ConversationList.tsx` : rendu de la liste de conversations.
- `client/src/components/conversation/ConversationListItem.tsx` : item unitaire + actions contextuelles.
- `client/src/components/conversation/RenameConversationDialog.tsx` : UI renommage titre.
- `client/src/components/conversation/DeleteConversationDialog.tsx` : UI confirmation suppression.
- `client/src/components/chat/ChatView.tsx` : zone principale discussion.
- `client/src/components/chat/MessageList.tsx` : liste scrollable des messages.
- `client/src/components/chat/MessageBubble.tsx` : bulle stylée user/assistant.
- `client/src/components/chat/MessageComposer.tsx` : textarea + bouton envoyer.
- `client/src/pages/ChatPage.tsx` : page principale qui assemble hooks + composants.
- `client/src/pages/NotFoundPage.tsx` : fallback route inconnue.
- `client/src/App.tsx` : routing applicatif.
- `client/src/main.tsx` : bootstrap React.

---

## 3. Modèles de données (TypeScript)

### Frontend / DTO API
```ts
interface ConversationSummary {
  id: string;
  title: string;
  lastMessagePreview: string | null;
  updatedAt: string;
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  createdAt: string;
}

interface SendMessageRequest {
  conversationId?: string;
  message: string;
}

interface SendMessageResponse {
  conversation: ConversationSummary;
  userMessage: Message;
  assistantMessage: Message;
}

interface RenameConversationRequest {
  title: string;
}
```

### Backend types internes
```ts
type MessageRole = 'user' | 'assistant';

interface AssistantReplyInput {
  conversationId: string;
  userMessage: string;
}
```

## 3b. Schéma base de données (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Conversation {
  id        String    @id @default(cuid())
  title     String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]

  @@index([updatedAt])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  role           MessageRole
  content        String
  createdAt      DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
}

enum MessageRole {
  user
  assistant
}
```

---

## 4. Architecture des composants

- `ChatPage` (container principal)
  - orchestre `useConversations` et `useChat`
  - passe props aux composants de présentation
- `AppShell`
  - parent layout responsive (sidebar fixe + contenu flexible)
  - enfants : `Sidebar`, `ChatView`
- `Sidebar`
  - contient `ConversationList`
  - action “nouvelle conversation”
- `ConversationList`
  - map des conversations vers `ConversationListItem`
- `ConversationListItem`
  - affiche titre, aperçu, date
  - expose actions : sélectionner, renommer, supprimer
  - ouvre `RenameConversationDialog` et `DeleteConversationDialog`
- `ChatView`
  - affiche `MessageList` + `MessageComposer`
  - état empty si aucune conversation sélectionnée
- `MessageList`
  - affiche `MessageBubble` par message, auto-scroll en bas
- `MessageComposer`
  - saisie utilisateur, submit, état loading

---

## 5. Gestion d’état

- **État local composant :**
  - UI transitoire (dialog ouvert/fermé, input de renommage)
- **Hooks métiers :**
  - `useConversations` : liste historique, conversation active, actions CRUD de conversation
  - `useChat` : messages conversation active, envoi message, loading
- **Source de vérité persistée :**
  - PostgreSQL via Prisma (conversations/messages conservés sans limite temporelle)
- **Pas de Redux nécessaire** (périmètre simple, mono-utilisateur)

---

## 6. Routing

- `GET /` → `ChatPage`
- `GET /conversation/:conversationId` → `ChatPage` (conversation pré-sélectionnée)
- `*` → `NotFoundPage`

---

## 7. API Design (backend)

### Conversations
- `GET /api/conversations`
  - **But :** lister conversations triées par `updatedAt desc`
  - **Response :** `ConversationSummary[]`

- `GET /api/conversations/:id`
  - **But :** charger conversation + messages
  - **Response :** `ConversationDetail`

- `PATCH /api/conversations/:id`
  - **Body :** `{ title: string }`
  - **But :** renommer conversation
  - **Response :** `ConversationSummary`

- `DELETE /api/conversations/:id`
  - **But :** supprimer conversation et ses messages
  - **Response :** `{ success: true }`

### Chat
- `POST /api/chat`
  - **Body :** `{ conversationId?: string; message: string }`
  - **But :**
    1. créer conversation si absente
    2. enregistrer message user
    3. appeler Azure OpenAI
    4. enregistrer réponse assistant
  - **Response :** `SendMessageResponse`

---

## 8. Parties complexes et solutions

1. **Persistance durable de l’historique**
   - Solution : Prisma + PostgreSQL, indexes sur `updatedAt` et `(conversationId, createdAt)`.

2. **Création conversation implicite au premier message**
   - Solution : dans `POST /api/chat`, si `conversationId` absent → créer conversation avec titre par défaut (ex: dérivé du premier message, tronqué).

3. **Renommage et suppression robustes**
   - Solution : validation Zod (title non vide, longueur max), confirmation UI avant suppression, erreurs API gérées proprement.

4. **Qualité de réponse assistant**
   - Solution : service dédié `assistantService` construisant un contexte à partir des derniers messages de la conversation.

5. **Expérience de lecture chat**
   - Solution : auto-scroll contrôlé en bas sur nouveau message, style sobre et lisible, distinction visuelle user/assistant.

---

## 9. Dépendances à installer

```bash
npm install @prisma/client zod react-router-dom lucide-react date-fns clsx
npm install -D prisma
```

---

## 10. Ordre d’implémentation

1. `prisma/schema.prisma`
2. `server/db/prisma.ts`
3. `server/types/chat.ts`
4. `server/validators/chatValidators.ts`
5. `server/services/conversationService.ts`
6. `server/services/assistantService.ts`
7. `server/routes/conversations.ts`
8. `server/routes/chat.ts`
9. `server/index.ts` (brancher routes)
10. `client/src/types/chat.ts`
11. `client/src/lib/api.ts`
12. `client/src/lib/date.ts`
13. `client/src/hooks/useConversations.ts`
14. `client/src/hooks/useChat.ts`
15. `client/src/components/layout/AppShell.tsx`
16. `client/src/components/layout/Sidebar.tsx`
17. `client/src/components/conversation/ConversationList.tsx`
18. `client/src/components/conversation/ConversationListItem.tsx`
19. `client/src/components/conversation/RenameConversationDialog.tsx`
20. `client/src/components/conversation/DeleteConversationDialog.tsx`
21. `client/src/components/chat/MessageBubble.tsx`
22. `client/src/components/chat/MessageList.tsx`
23. `client/src/components/chat/MessageComposer.tsx`
24. `client/src/components/chat/ChatView.tsx`
25. `client/src/pages/ChatPage.tsx`
26. `client/src/pages/NotFoundPage.tsx`
27. `client/src/App.tsx`
28. `client/src/main.tsx`
29. Mise à jour `README.md` (instructions run/migrate)

---

## 11. Résultat attendu fonctionnel

- L’utilisateur peut envoyer un message et obtenir une réponse assistant.
- Chaque échange est stocké dans une conversation persistée.
- L’historique est visible dans la sidebar.
- Une conversation peut être ouverte, relue, renommée et supprimée.
- Les données restent disponibles après fermeture/réouverture de l’application.
