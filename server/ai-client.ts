/**
 * Azure OpenAI client — pre-configured wrapper.
 *
 * Reads credentials from environment variables that are automatically
 * injected by AiDA Studio. NEVER hardcode API keys or endpoints.
 *
 * Environment variables available:
 *   AZURE_OPENAI_ENDPOINT     — Azure OpenAI resource endpoint
 *   AZURE_OPENAI_API_KEY      — API key
 *   AZURE_OPENAI_DEPLOYMENT   — Model deployment name (e.g. gpt-4o)
 *   AZURE_OPENAI_API_VERSION  — API version (e.g. 2025-01-01-preview)
 */

import { AzureOpenAI } from 'openai';

// Validate required env vars at startup
const requiredVars = [
  'AZURE_OPENAI_ENDPOINT',
  'AZURE_OPENAI_API_KEY',
  'AZURE_OPENAI_DEPLOYMENT',
] as const;

for (const v of requiredVars) {
  if (!process.env[v]) {
    console.warn(`⚠️  Missing env var: ${v} — Azure OpenAI calls will fail.`);
  }
}

/**
 * Pre-configured Azure OpenAI client.
 * Usage:
 *   import { openai, DEPLOYMENT } from './ai-client';
 *   const completion = await openai.chat.completions.create({
 *     model: DEPLOYMENT,
 *     messages: [{ role: 'user', content: 'Hello!' }],
 *   });
 */
export const openai = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview',
});

/** The deployed model name to use in API calls. */
export const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

