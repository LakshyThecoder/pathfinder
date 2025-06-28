'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a learning suggestion or challenge.
 *
 * - generateSuggestion - A function that generates a challenge.
 * - SuggestionInput - The input type for the generateSuggestion function.
 * - SuggestionOutput - The return type for the generateSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestionInputSchema = z.object({
  topic: z.string().describe('The learning topic for the challenge.'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of the topic.'),
});
export type SuggestionInput = z.infer<typeof SuggestionInputSchema>;

const SuggestionOutputSchema = z.object({
  challenge: z.string().describe("A short, specific, and actionable challenge for the user to complete."),
  estimatedTime: z.string().describe("A user-friendly estimate of how long the challenge will take (e.g., '15-20 minutes')."),
});
export type SuggestionOutput = z.infer<typeof SuggestionOutputSchema>;

export async function generateSuggestion(input: SuggestionInput): Promise<SuggestionOutput> {
  return suggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestionPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: SuggestionInputSchema },
  output: { schema: SuggestionOutputSchema },
  prompt: `You are an expert learning coach. The user is studying '{{topic}}' at a '{{level}}' level.

Your task is to create a small, concrete, and actionable challenge to help them practice this skill. The challenge should be something they can start right now.

Generate a response with a 'challenge' and an 'estimatedTime'.

Example:
- topic: "Color Theory Basics"
- level: "Beginner"
- Your Output: { "challenge": "Find a website you love and identify its primary, secondary, and accent colors. Note them down using a color picker tool.", "estimatedTime": "10-15 minutes" }

Do not just say "learn about X". Give a specific action. Make it sound like an exciting mini-quest.
`,
});

const suggestionFlow = ai.defineFlow(
  {
    name: 'suggestionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: SuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate a suggestion. AI output was null.");
    }
    return output;
  }
);
