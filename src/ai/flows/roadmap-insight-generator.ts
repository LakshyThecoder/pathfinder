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
  keyConcept: z.string().describe("A concise explanation of the single most important concept or mental model for the topic."),
  practicalTip: z.string().describe("A specific, actionable tip or a mini-exercise the user can do to apply their knowledge."),
  commonPitfall: z.string().describe("A common mistake or misunderstanding to watch out for, and advice on how to avoid it."),
  resources: z.string().describe("A markdown-formatted string with a bulleted list of 2-3 specific, high-quality learning resources (e.g., specific tutorials, documentation pages, or courses). Briefly explain why each is recommended."),
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
  prompt: `You are an expert learning advisor and curriculum designer. For the given roadmap node topic, provide a detailed, structured response in the required JSON format.

**Roadmap Node:** {{{nodeContent}}}

Your response must be encouraging, clear, and highly practical.

Based on the node topic, provide the following:
- 'keyConcept': Explain the single most important concept for this topic in a simple, easy-to-understand way. Use an analogy if helpful.
- 'practicalTip': Provide a concrete, actionable tip or a small exercise that a learner can do right now to better understand the topic.
- 'commonPitfall': Describe a common mistake learners make with this topic and explain how to avoid it.
- 'resources': A string containing a markdown-formatted bulleted list of 2-3 specific, high-quality learning resources. For each resource, add a brief sentence explaining why it's a good choice.
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
