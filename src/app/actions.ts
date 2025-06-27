"use server";

import { roadmapInsightGenerator, RoadmapInsightOutput, RoadmapInsightInput } from "@/ai/flows/roadmap-insight-generator";
import { generateRoadmap, GenerateRoadmapOutput, GenerateRoadmapInput } from "@/ai/flows/roadmap-generator";

export async function getRoadmapInsight(input: RoadmapInsightInput): Promise<RoadmapInsightOutput | { error: string }> {
  try {
    const result = await roadmapInsightGenerator(input);
    return result;
  } catch (e) {
    console.error(e);
    return { error: "Failed to generate insights. Please try again." };
  }
}

export async function getAiRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput | { error: string }> {
    try {
      const result = await generateRoadmap(input);
      return result;
    } catch (e) {
      console.error(e);
      return { error: "Failed to generate the roadmap. The AI may be busy or the topic is too complex. Please try again later or with a different topic." };
    }
  }
