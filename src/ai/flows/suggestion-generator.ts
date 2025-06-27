'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a daily learning suggestion.
 *
 * - generateDailyChallenge - A function that generates a challenge.
 * - DailyChallengeInput - The input type for the generateDailyChallenge function.
 * - DailyChallengeOutput - The return type for the generateDailyChallenge function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyChallengeInputSchema = z.object({
  roadmapTitle: z.string().describe('The title of the overall learning roadmap.'),
  nextTopic: z.string().describe('The specific topic the user should focus on next.'),
  timePreference: z.string().describe('How much time the user has for the task (e.g., "15 minutes", "about an hour").')
});
export type DailyChallengeInput = z.infer<typeof DailyChallengeInputSchema>;

const DailyChallengeOutputSchema = z.object({
  challenge: z.string().describe("A short, specific, and actionable challenge for the user to complete."),
  estimatedTime: z.string().describe("A user-friendly estimate of how long the challenge will take (e.g., '15-20 minutes')."),
});
export type DailyChallengeOutput = z.infer<typeof DailyChallengeOutputSchema>;

export async function generateDailyChallenge(input: DailyChallengeInput): Promise<DailyChallengeOutput> {
  return dailyChallengeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyChallengePrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: DailyChallengeInputSchema },
  output: { schema: DailyChallengeOutputSchema },
  prompt: `You are an expert learning coach. The user is working on a roadmap called "{{roadmapTitle}}".

Their next topic to learn is "{{nextTopic}}".

Your task is to create a "Today's Challenge". It should be a small, concrete, and actionable task related to "{{nextTopic}}" that can be completed in approximately {{timePreference}}.

Generate a response with a 'challenge' and an 'estimatedTime'.

Example:
- roadmapTitle: "Mastering UI/UX Design"
- nextTopic: "Color Theory Basics"
- timePreference: "15 minutes"
- Your Output: { "challenge": "Find a website you love and identify its primary, secondary, and accent colors. Note them down.", "estimatedTime": "10-15 minutes" }

Do not just say "learn about X". Give a specific action.
`,
});

const dailyChallengeFlow = ai.defineFlow(
  {
    name: 'dailyChallengeFlow',
    inputSchema: DailyChallengeInputSchema,
    outputSchema: DailyChallengeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate a daily challenge. AI output was null.");
    }
    return output;
  }
);
