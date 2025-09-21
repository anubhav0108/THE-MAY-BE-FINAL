
'use server';

/**
 * @fileOverview Provides a conversational AI assistant for the application.
 *
 * - runChat - The main function that handles user queries.
 * - ChatAssistantInput - The input type for the runChat function.
 */

import { z } from 'zod';
import { chatAssistantFlow, ChatAssistantInputSchema } from './chat-assistant-flow';

export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;


export async function runChat(input: ChatAssistantInput): Promise<string> {
  return await chatAssistantFlow(input);
}
