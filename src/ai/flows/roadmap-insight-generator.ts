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
  prompt: `You are an AI assistant designed to provide insights, resources, and duration estimates for learning roadmap nodes.

  Based on the content of the node, provide:

  1.  A concise insight about the topic.
  2.  A list of recommended resources (e.g., tutorials, documentation, courses).
  3.  An estimated duration to learn the topic.

  Node Content: {{{nodeContent}}}
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
