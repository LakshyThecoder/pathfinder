'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering follow-up questions about a roadmap node.
 *
 * - getFollowUpAnswer - A function that generates an answer to a follow-up question.
 * - FollowUpInput - The input type for the getFollowUpAnswer function.
 * - FollowUpOutput - The return type for the getFollowUpAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const FollowUpInputSchema = z.object({
  nodeContent: z
    .string()
    .describe('The content or topic of the roadmap node being discussed.'),
  question: z.string().describe('The user\'s follow-up question.'),
});
export type FollowUpInput = z.infer<typeof FollowUpInputSchema>;

export const FollowUpOutputSchema = z.object({
  answer: z
    .string()
    .describe("A helpful and concise answer to the user's question."),
});
export type FollowUpOutput = z.infer<typeof FollowUpOutputSchema>;


export async function getFollowUpAnswer(input: FollowUpInput): Promise<FollowUpOutput> {
    return followUpQuestionFlow(input);
}


const prompt = ai.definePrompt({
  name: 'followUpQuestionPrompt',
  input: { schema: FollowUpInputSchema },
  output: { schema: FollowUpOutputSchema },
  prompt: `You are an expert learning advisor. The user is currently studying "{{nodeContent}}". They have asked the following follow-up question: "{{question}}". Provide a helpful and concise answer to their question in the context of their learning topic.`,
});


const followUpQuestionFlow = ai.defineFlow(
  {
    name: 'followUpQuestionFlow',
    inputSchema: FollowUpInputSchema,
    outputSchema: FollowUpOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
