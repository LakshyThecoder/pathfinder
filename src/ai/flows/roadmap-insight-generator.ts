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
  insight: z.string().describe('AI-generated insights about the node content.'),
  resources: z.string().describe('Recommended resources for learning the node content.'),
  durationEstimate: z
    .string()
    .describe('An estimated duration for learning the node content.'),
});
export type RoadmapInsightOutput = z.infer<typeof RoadmapInsightOutputSchema>;

export async function roadmapInsightGenerator(input: RoadmapInsightInput): Promise<RoadmapInsightOutput> {
  return roadmapInsightGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'roadmapInsightPrompt',
  input: {schema: RoadmapInsightInputSchema},
  output: {schema: RoadmapInsightOutputSchema},
  prompt: `You are an expert learning advisor. For the given roadmap node content, provide a detailed response in the required structured JSON format.

**Roadmap Node:** {{{nodeContent}}}

Based on the node content, provide:
- A concise insight about the topic for the 'insight' field.
- A string containing a list of recommended resources (e.g., tutorials, documentation, courses) for the 'resources' field.
- A string containing an estimated duration to learn the topic for the 'durationEstimate' field.
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
    return output!;
  }
);
