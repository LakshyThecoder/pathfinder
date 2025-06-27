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

// This is the final schema with IDs, matching what the app components expect.
const RoadmapNodeWithIdSchema: z.ZodType<RoadmapNodeData> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    children: z.array(RoadmapNodeWithIdSchema).optional(),
  })
);
export type GenerateRoadmapOutput = z.infer<typeof RoadmapNodeWithIdSchema>;


// This is the schema for the AI's output (no IDs).
const RoadmapNodeForAISchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    title: z.string().describe('The title of this roadmap step.'),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of this step.'),
    children: z.array(RoadmapNodeForAISchema).optional().describe('An array of sub-steps or related topics.'),
  })
);

// The root AI output is also a node.
const GenerateRoadmapAIOutputSchema = RoadmapNodeForAISchema;
type AiOutput = z.infer<typeof GenerateRoadmapAIOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
    const roadmapFromAI = await roadmapGeneratorFlow(input);
    
    function addIds(node: AiOutput): RoadmapNodeData {
      const newNode: RoadmapNodeData = {
        id: uuidv4(),
        title: node.title,
        level: node.level,
      };
      if (node.children && node.children.length > 0) {
        newNode.children = node.children.map(addIds);
      }
      return newNode;
    }

    return addIds(roadmapFromAI);
}

const prompt = ai.definePrompt({
    name: 'roadmapGeneratorPrompt',
    input: {schema: GenerateRoadmapInputSchema},
    output: { schema: GenerateRoadmapAIOutputSchema },
    prompt: `You are an expert curriculum designer and learning advisor. Your task is to generate a comprehensive, structured learning roadmap for a given topic.

    The user wants to learn: {{{query}}}
    
    Create a roadmap with a clear, engaging title for the overall topic. The roadmap must be broken down into three main difficulty levels: 'Beginner', 'Intermediate', and 'Advanced'.
    
    For each level, provide a list of essential topics or skills to learn. You can also nest topics to show relationships.
    
    The final output must be a single JSON object that strictly adheres to the provided schema. The root object represents the entire roadmap. Its 'children' array should contain the main learning nodes, each with a 'title', a 'level' ('Beginner', 'Intermediate', or 'Advanced'), and optionally more 'children' for sub-topics.
    
    Do not include 'id' fields in your output, they will be generated automatically.`,
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
