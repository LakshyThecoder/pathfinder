'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating insights, resources, and duration estimates for a given roadmap node.
 *
 * - roadmapInsightGenerator - A function that generates insights for a roadmap node.
 * - RoadmapInsightInput - The input type for the roadmapInsightGenerator function.
 * - RoadmapInsightOutput - The return type for the roadmapInsightGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RoadmapInsightInputSchema = z.object({
  nodeContent: z
    .string()
    .describe('The content or topic of the roadmap node to generate insights for.'),
});
export type RoadmapInsightInput = z.infer<typeof RoadmapInsightInputSchema>;

const RoadmapInsightOutputSchema = z.object({
  insight: z.string().describe("A concise, expert insight about the learning topic. This should be a key piece of advice or a mental model."),
  resources: z.string().describe("A bulleted list of 2-3 recommended resources (e.g., specific tutorials, documentation pages, or courses) as a single string."),
  durationEstimate: z
    .string()
    .describe("An estimated duration to achieve a solid understanding of the topic (e.g., '1-2 weeks', '8-10 hours')."),
});
export type RoadmapInsightOutput = z.infer<typeof RoadmapInsightOutputSchema>;

export async function roadmapInsightGenerator(input: RoadmapInsightInput): Promise<RoadmapInsightOutput> {
  return roadmapInsightGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'roadmapInsightPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: RoadmapInsightInputSchema},
  output: {schema: RoadmapInsightOutputSchema},
  prompt: `You are an expert learning advisor. For the given roadmap node topic, provide a detailed response in the required structured JSON format.

**Roadmap Node:** {{{nodeContent}}}

Based on the node topic, provide the following:
- 'insight': A concise, expert insight about the topic. This should be a key piece of advice, a common pitfall to avoid, or a powerful mental model.
- 'resources': A string containing a bulleted list of 2-3 specific, high-quality learning resources.
- 'durationEstimate': A string containing a realistic, estimated time to learn the topic for a beginner (e.g., "1-2 weeks", "8-10 hours").
`,
});

const roadmapInsightGeneratorFlow = ai.defineFlow(
  {
    name: 'roadmapInsightGeneratorFlow',
    inputSchema: RoadmapInsightInputSchema,
    outputSchema: RoadmapInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate insights. AI output was null.");
    }
    return output;
  }
);
