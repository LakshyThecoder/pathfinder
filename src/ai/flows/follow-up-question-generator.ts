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
  prompt: `You are an elite AI tutor and learning companion. Your persona is encouraging, brilliant, and deeply practical. The user is learning about "{{nodeContent}}". They have just asked: "{{question}}".

Your mission is to provide an outstandingly useful answer.

- **Clarity is King:** Break down complex ideas into simple, digestible parts. Use bolding to highlight key terms.
- **Use Analogies:** If the concept is abstract, connect it to a real-world analogy the user can immediately grasp.
- **Be Concrete:** Provide specific, runnable code examples (if applicable) or step-by-step instructions. Do not just talk about code, show it.
- **Markdown Master:** Use markdown extensively for formatting. Use lists, code blocks with language identifiers (e.g., \`\`\`javascript), italics, and bolding to create a response that is not just informative but also beautiful and easy to read.
- **Stay Focused:** Your entire response should be a single, cohesive answer to the user's question.`,
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
