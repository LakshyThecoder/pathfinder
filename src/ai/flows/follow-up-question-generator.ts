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

const FollowUpInputSchema = z.object({
  nodeContent: z
    .string()
    .describe('The content or topic of the roadmap node being discussed.'),
  question: z.string().describe("The user's follow-up question."),
});
export type FollowUpInput = z.infer<typeof FollowUpInputSchema>;

const FollowUpOutputSchema = z.object({
  answer: z
    .string()
    .describe("A helpful and detailed answer to the user's question, formatted as a single string which may include markdown for clarity."),
});
export type FollowUpOutput = z.infer<typeof FollowUpOutputSchema>;


export async function getFollowUpAnswer(input: FollowUpInput): Promise<FollowUpOutput> {
    return followUpQuestionFlow(input);
}


const prompt = ai.definePrompt({
  name: 'followUpQuestionPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: FollowUpInputSchema },
  output: { schema: FollowUpOutputSchema },
  prompt: `You are an expert learning advisor and tutor. The user is currently studying "{{nodeContent}}". They have asked the following follow-up question: "{{question}}". 

Your task is to provide a helpful, detailed, and encouraging answer. 
- Explain the concept clearly and concisely.
- Use analogies or simple examples to aid understanding.
- If relevant, provide code snippets or step-by-step instructions.
- Be encouraging and supportive in your tone.
- Format your answer using markdown (e.g., for lists, bold text, italics, code blocks) to make it easy to read.`,
});


const followUpQuestionFlow = ai.defineFlow(
  {
    name: 'followUpQuestionFlow',
    inputSchema: FollowUpInputSchema,
    outputSchema: FollowUpOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Failed to get an answer from the AI. Output was null.");
    }
    return output;
  }
);
