'use server';

/**
 * @fileOverview A Genkit flow for generating a learning roadmap based on a user's query.
 *
 * - generateRoadmap - A function that generates the roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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
    children: z.array(RoadmapNodeForAISchema).describe('A flat list of 5-7 topics for each difficulty level (Beginner, Intermediate, Advanced).')
});

type AiOutput = z.infer<typeof GenerateRoadmapAIOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
    const roadmapFromAI = await roadmapGeneratorFlow(input);

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
    prompt: `You are an expert curriculum designer. Your task is to generate a structured, high-level learning roadmap for the given topic.

    The user wants to learn: {{{query}}}
    
    1.  Create a clear, engaging title for the overall roadmap.
    2.  Provide a list of learning topics broken down into three difficulty levels: 'Beginner', 'Intermediate', and 'Advanced'.
    3.  For each difficulty level, list 5-7 core topics.
    4.  The output for the 'children' field must be a single flat array containing all topics from all difficulty levels. Do NOT nest topics.
    
    The final output must be a single JSON object that strictly adheres to the provided schema.`,
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
