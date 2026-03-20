import { Router } from 'express';
import { renameConversationSchema } from '../validators/chatValidators';
import { deleteConversation, getConversationById, listConversations, renameConversation, } from '../services/conversationService';
export const conversationsRouter = Router();
conversationsRouter.get('/', async (_req, res) => {
    const items = await listConversations();
    res.json(items);
});
conversationsRouter.get('/:id', async (req, res) => {
    const conversation = await getConversationById(req.params.id);
    if (!conversation)
        return res.status(404).json({ error: 'Conversation introuvable' });
    return res.json(conversation);
});
conversationsRouter.patch('/:id', async (req, res) => {
    const parsed = renameConversationSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Payload invalide' });
    const updated = await renameConversation(req.params.id, parsed.data.title);
    return res.json(updated);
});
conversationsRouter.delete('/:id', async (req, res) => {
    await deleteConversation(req.params.id);
    return res.status(204).send();
});
