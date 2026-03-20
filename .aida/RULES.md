# Conventions de code — Projet `express-fullstack-ai`

## 1) Principes généraux
- Priorité à la lisibilité et à la simplicité.
- Toute logique métier non triviale doit être dans `services/` (pas dans les routes ni composants UI).
- Séparer clairement UI, hooks, API client, backend routes/services, et persistance.

## 2) TypeScript et typage
- `strict` activé : ne jamais utiliser `any`.
- Préférer des `interface` pour les objets métier.
- Les unions littérales (`'user' | 'assistant'`) doivent être centralisées dans `types/`.
- Les retours de fonctions publiques doivent être explicitement typés.

## 3) Nommage
- Composants React : **PascalCase** (`MessageComposer.tsx`).
- Fonctions/variables : **camelCase** (`sendMessage`, `activeConversationId`).
- Constantes globales : **UPPER_SNAKE_CASE**.
- Fichiers backend services/routes : suffixes explicites (`chat.ts`, `conversationService.ts`).

## 4) Exports
- Composants React : `export default`.
- Utilitaires, hooks, types : exports nommés.
- Éviter les exports wildcard (`export *`) hors fichiers d’index dédiés.

## 5) Imports (ordre obligatoire)
1. Imports React / Node natifs
2. Librairies tierces
3. Imports internes absolus/relatifs (types, lib, hooks, composants)
4. Styles éventuels

Séparer chaque groupe par une ligne vide.

## 6) Frontend (React)
- Composants en **arrow functions**.
- Props typées explicitement (inline ou via interface dédiée).
- Hooks personnalisés dans `src/hooks/` uniquement.
- Aucun appel `fetch` direct dans les composants : passer par `src/lib/api.ts`.
- Styling prioritairement Tailwind, sans CSS custom sauf nécessité réelle.

## 7) Backend (Express)
- Validation des entrées requête via **Zod** dans `server/validators/`.
- Routes minces : parsing + délégation aux services.
- Services responsables de la logique métier et des accès Prisma.
- Retourner des statuts HTTP cohérents (`200`, `201`, `400`, `404`, `500`).

## 8) Base de données (Prisma)
- Schéma unique dans `prisma/schema.prisma`.
- Nom des modèles au singulier (`Conversation`, `Message`).
- Toujours indexer les champs de tri/filtrage fréquents.
- Ne jamais hardcoder `DATABASE_URL` : utiliser `env("DATABASE_URL")`.

## 9) IA et sécurité (critique)
- Ne jamais hardcoder clé API, endpoint, deployment.
- Utiliser uniquement `process.env.AZURE_OPENAI_*` via le client pré-configuré.
- Appels IA encapsulés dans `assistantService.ts`.
- Gérer erreurs réseau, timeouts, réponses vides avec fallback utilisateur.

## 10) Gestion d’erreurs
- Backend : `try/catch` dans routes, message d’erreur non sensible côté client.
- Frontend : afficher une notification/erreur UI claire si requête échoue.
- Toujours logger côté serveur les erreurs techniques (sans secrets).

## 11) UX / Accessibilité
- Boutons d’action (renommer/supprimer/envoyer) avec labels explicites.
- Dialogues de confirmation pour suppression.
- Contraste texte/fond suffisant et focus visible clavier.

## 12) Qualité et structure
- Fonctions courtes, une responsabilité principale.
- Pas de duplication : extraire utilitaires communs.
- Toute nouvelle feature doit ajouter ses types/validators avant logique UI.

