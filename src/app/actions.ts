"use server";

import { roadmapInsightGenerator, RoadmapInsightOutput, RoadmapInsightInput } from "@/ai/flows/roadmap-insight-generator";
import { generateRoadmap, GenerateRoadmapOutput } from "@/ai/flows/roadmap-generator";
import { getFollowUpAnswer as getFollowUpAnswerFlow, FollowUpInput, FollowUpOutput } from "@/ai/flows/follow-up-question-generator";

export async function getRoadmapInsight(input: RoadmapInsightInput): Promise<RoadmapInsightOutput | { error: string }> {
  try {
    const result = await roadmapInsightGenerator(input);
    return result;
  } catch (e: any) {
    console.error("Error in getRoadmapInsight:", e);
    return { error: e.message || "Failed to generate insights. Please try again." };
  }
}

export async function getAiRoadmap(query: string): Promise<GenerateRoadmapOutput | { error: string }> {
    try {
      const generatedRoadmap = await generateRoadmap({ query });
      return generatedRoadmap;
    } catch (e: any) {
      console.error("Error in getAiRoadmap:", e);
      return { error: e.message || "Failed to generate the roadmap. The AI may be busy or the topic is too complex. Please try again later or with a different topic." };
    }
}

export async function getFollowUpAnswer(input: FollowUpInput): Promise<FollowUpOutput | { error: string }> {
  try {
    const result = await getFollowUpAnswerFlow(input);
    return result;
  } catch (e: any) {
    console.error("Error in getFollowUpAnswer:", e);
    return { error: e.message || "Failed to get an answer. Please try again." };
  }
}
