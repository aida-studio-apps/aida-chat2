import { DEPLOYMENT, openai } from '../ai-client.js';

export async function getAssistantReply(userMessage: string) {
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

  return (
    completion.choices[0]?.message?.content?.trim() ||
    'Je n\'ai pas pu générer une réponse.'
  );
}



