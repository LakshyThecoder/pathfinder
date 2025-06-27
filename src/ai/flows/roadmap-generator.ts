'use server';

/**
 * @fileOverview A Genkit flow for generating a learning roadmap based on a user's query.
 *
 * - generateRoadmap - A function that generates the roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { RoadmapNodeData } from '@/types';

const GenerateRoadmapInputSchema = z.object({
  query: z.string().describe('The topic for which to generate a learning roadmap.'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const RoadmapNodeWithIdSchema: z.ZodType<RoadmapNodeData> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    children: z.array(RoadmapNodeWithIdSchema).optional(),
  })
);
export type GenerateRoadmapOutput = z.infer<typeof RoadmapNodeWithIdSchema>;


// --- Schemas for AI output (no IDs, flatter structure for speed) ---

// A single node for the AI to generate
const RoadmapNodeForAISchema = z.object({
    title: z.string().describe('A specific topic or skill.'),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of this topic.'),
});

// The root schema for the AI output
const GenerateRoadmapAIOutputSchema = z.object({
    title: z.string().describe('The title for the entire learning roadmap (e.g., "Mastering UI/UX Design").'),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe("The overall starting level for the roadmap, typically 'Beginner'."),
    children: z.array(RoadmapNodeForAISchema).describe('A flat list of 3-5 topics for each difficulty level (Beginner, Intermediate, Advanced).')
});

type AiOutput = z.infer<typeof GenerateRoadmapAIOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
    const roadmapFromAI = await roadmapGeneratorFlow(input);

    if (!roadmapFromAI || !roadmapFromAI.title || !roadmapFromAI.children) {
      throw new Error("AI failed to generate a valid roadmap structure. The response was empty or malformed.");
    }

    const finalRoadmap: GenerateRoadmapOutput = {
      id: uuidv4(),
      title: roadmapFromAI.title,
      level: roadmapFromAI.level,
      children: roadmapFromAI.children.map(child => ({
        id: uuidv4(),
        title: child.title,
        level: child.level,
      }))
    };
    
    return finalRoadmap;
}

const prompt = ai.definePrompt({
    name: 'roadmapGeneratorPrompt',
    input: {schema: GenerateRoadmapInputSchema},
    output: { schema: GenerateRoadmapAIOutputSchema },
    prompt: `You are an expert curriculum designer. Your task is to generate a high-level learning roadmap for "{{query}}".

Your response MUST be a JSON object that matches the requested schema precisely.

You must:
1.  Create an engaging 'title' for the entire roadmap. For example, "The Complete Guide to {{query}}".
2.  The 'level' for the overall roadmap object should be "Beginner".
3.  Create a flat list of topics for the 'children' array. This list must contain topics for 'Beginner', 'Intermediate', and 'Advanced' levels.
4.  For each topic in the 'children' array, you must provide a 'title' (a specific skill or concept) and a 'level' ('Beginner', 'Intermediate', or 'Advanced').
5.  Ensure there are between 3 and 5 topics for each of the three difficulty levels. A smaller number of high-quality topics is better.`,
});

const roadmapGeneratorFlow = ai.defineFlow(
  {
    name: 'roadmapGeneratorFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
