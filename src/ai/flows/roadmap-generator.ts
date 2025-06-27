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


// --- Schemas for AI output (no IDs, shallower structure for speed) ---

// Schema for a sub-topic, which cannot have its own children.
const RoadmapSubNodeForAISchema = z.object({
    title: z.string().describe('A specific sub-topic or skill.'),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of this sub-topic.'),
});

// Schema for a main topic, which can have sub-topics.
const RoadmapMainNodeForAISchema = z.object({
    title: z.string().describe('A major topic or milestone in the roadmap.'),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of this main topic.'),
    children: z.array(RoadmapSubNodeForAISchema).optional().describe('An array of sub-topics for this main topic.'),
});

// This is the schema for the AI's output (the root of the roadmap).
const GenerateRoadmapAIOutputSchema = z.object({
    title: z.string().describe('The title for the entire learning roadmap (e.g., "Mastering UI/UX Design").'),
    // The root node itself doesn't have a level in the same way children do, but the schema requires it. We can guide the AI.
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe("The overall starting level for the roadmap, typically 'Beginner'."),
    children: z.array(RoadmapMainNodeForAISchema).describe('A list of 3-5 main topics for the roadmap, categorized by difficulty.')
});

type AiOutput = z.infer<typeof GenerateRoadmapAIOutputSchema>;
type AiNode = z.infer<typeof RoadmapMainNodeForAISchema> | z.infer<typeof RoadmapSubNodeForAISchema>

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
    const roadmapFromAI = await roadmapGeneratorFlow(input);
    
    // Recursively add UUIDs to the AI-generated nodes to create the final roadmap structure.
    function addIds(node: AiOutput | AiNode): RoadmapNodeData {
      const newNode: RoadmapNodeData = {
        id: uuidv4(),
        title: node.title,
        level: node.level,
      };
      if ('children' in node && node.children && node.children.length > 0) {
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
    prompt: `You are an expert curriculum designer. Your task is to generate a structured, high-level learning roadmap for the given topic. Keep the roadmap concise and focused on the main stages of learning.

    The user wants to learn: {{{query}}}
    
    Create a roadmap with a clear, engaging title for the overall topic. The roadmap must be broken down into three main difficulty levels: 'Beginner', 'Intermediate', and 'Advanced'.
    
    For each level, provide a list of 3-5 core topics (main nodes). For each core topic, you can optionally provide a few specific sub-topics (children). Avoid deep nesting; the goal is a high-level overview.
    
    The final output must be a single JSON object that strictly adheres to the provided schema. The root object represents the entire roadmap.
    
    Do not include 'id' fields in your output; they will be generated automatically.`,
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
