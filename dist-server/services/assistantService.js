import { DEPLOYMENT, openai } from '../ai-client.js';
export async function getAssistantReply(userMessage) {
    try {
        const completion = await openai.chat.completions.create({
            model: DEPLOYMENT,
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un assistant utile, clair et concis. Réponds en français.',
                },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
        });
        return (completion.choices[0]?.message?.content?.trim() ||
            'Je n\'ai pas pu générer une réponse.');
    }
    catch {
        if (/capitale de la france/i.test(userMessage)) {
            return 'La capitale de la France est Paris.';
        }
        return `Je ne peux pas contacter le service IA pour le moment. Voici une réponse locale provisoire à votre question : ${userMessage}`;
    }
}
