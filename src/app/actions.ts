
"use server";

import { generateRoadmap, GenerateRoadmapOutput, GenerateRoadmapInput } from "@/ai/flows/roadmap-generator";
import { roadmapInsightGenerator, RoadmapInsightOutput, RoadmapInsightInput } from "@/ai/flows/roadmap-insight-generator";
import { getFollowUpAnswer as getFollowUpAnswerFlow, FollowUpInput, FollowUpOutput } from "@/ai/flows/follow-up-question-generator";
import { generateSuggestion, SuggestionInput, SuggestionOutput } from "@/ai/flows/suggestion-generator";
import { getDecodedIdToken } from "@/lib/firebase-admin";
import { getUserRoadmaps, getDashboardStats, saveRoadmap, getRoadmap as getRoadmapFromDb, updateNodeStatus as updateNodeStatusInDb } from "@/lib/firestore";
import type { StoredRoadmap, NodeStatus, RoadmapNodeData } from "@/types";


export async function getAiRoadmap(query: string): Promise<StoredRoadmap | RoadmapNodeData | { error: string }> {
    try {
      const decodedToken = await getDecodedIdToken();
      const generatedRoadmapData = await generateRoadmap({ query });

      // If user is logged in, save the roadmap to their account
      if (decodedToken) {
        const savedRoadmap = await saveRoadmap(decodedToken.uid, generatedRoadmapData, query);
        return savedRoadmap;
      }

      // If user is not logged in, return the transient roadmap data
      return generatedRoadmapData;

    } catch (e: any) {
      console.error("Error in getAiRoadmap:", e);
      return { error: e.message || "Failed to generate the roadmap. The AI may be busy or the topic is too complex. Please try again later or with a different topic." };
    }
}

export async function getRoadmapAction(roadmapId: string): Promise<StoredRoadmap | { error: string }> {
  try {
    const decodedToken = await getDecodedIdToken();
    if (!decodedToken) {
        return { error: "You must be logged in." };
    }
    const roadmap = await getRoadmapFromDb(roadmapId);
    if (!roadmap || roadmap.userId !== decodedToken.uid) {
      return { error: "Roadmap not found or you don't have permission to view it." };
    }
    return {
      ...roadmap,
      createdAt: (roadmap.createdAt as any).toDate().toISOString(),
    };
  } catch(e: any) {
    console.error("Error in getRoadmapAction:", e);
    return { error: e.message || "Failed to fetch roadmap." };
  }
}

export async function updateNodeStatusAction(roadmapId: string, nodeId: string, status: NodeStatus) {
    try {
        const decodedToken = await getDecodedIdToken();
        if (!decodedToken) {
            return { error: "You must be logged in." };
        }
        await updateNodeStatusInDb(roadmapId, nodeId, status);
        return { success: true };
    } catch (e: any) {
        console.error("Error in updateNodeStatusAction:", e);
        return { error: e.message || "Failed to update status." };
    }
}

export async function getHistoryAction(): Promise<StoredRoadmap[] | { error: string }> {
    try {
        const decodedToken = await getDecodedIdToken();
        if (!decodedToken) {
            return { error: "You must be logged in." };
        }
        const roadmaps = await getUserRoadmaps(decodedToken.uid);
        return roadmaps.map(r => ({ ...r, createdAt: (r.createdAt as any).toDate().toISOString() }));
    } catch (e: any) {
        console.error("Error in getHistoryAction:", e);
        return { error: e.message || "Failed to fetch history." };
    }
}


export async function getRoadmapInsight(input: RoadmapInsightInput): Promise<RoadmapInsightOutput | { error: string }> {
  try {
    const result = await roadmapInsightGenerator(input);
    return result;
  } catch (e: any) {
    console.error("Error in getRoadmapInsight:", e);
    return { error: e.message || "Failed to generate insights. Please try again." };
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

export async function getSuggestion(input: SuggestionInput): Promise<SuggestionOutput | { error: string }> {
  try {
    const result = await generateSuggestion(input);
    return result;
  } catch (e: any) {
    console.error("Error in getSuggestion:", e);
    return { error: e.message || "Failed to generate a suggestion. Please try again." };
  }
}

export async function getDashboardDataAction(): Promise<{ stats: any, recentRoadmaps: any[] } | { error: string }> {
    try {
        const decodedToken = await getDecodedIdToken();
        if (!decodedToken) {
            return { error: "You must be logged in." };
        }
        const userId = decodedToken.uid;
        const roadmaps = await getUserRoadmaps(userId);
        const stats = await getDashboardStats(userId, roadmaps);

        const recentRoadmaps = roadmaps
          .slice(0, 3)
          .map(r => ({ ...r, createdAt: (r.createdAt as any).toDate().toISOString() }));
    
        return { stats, recentRoadmaps };
    } catch (e: any) {
        console.error("Error in getDashboardDataAction:", e);
        return { error: e.message || "Failed to fetch dashboard data." };
    }
}

export async function getDailyChallengeAction(): Promise<SuggestionOutput | { error: string }> {
    try {
        const decodedToken = await getDecodedIdToken();
        if (!decodedToken) {
            return generateSuggestion({ topic: 'Learning something new', level: 'Beginner' });
        }
        const userId = decodedToken.uid;
        const roadmaps = await getUserRoadmaps(userId);

        if (roadmaps.length === 0) {
            return generateSuggestion({ topic: 'Setting a new learning goal', level: 'Beginner' });
        }

        const randomRoadmap = roadmaps[Math.floor(Math.random() * roadmaps.length)];
        const nodes = randomRoadmap.children;
        if (!nodes || nodes.length === 0) {
            return generateSuggestion({ topic: randomRoadmap.query || 'Learning', level: 'Intermediate' });
        }

        const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
        
        return generateSuggestion({ topic: randomNode.title, level: randomNode.level });
    } catch(e: any) {
        console.error("Error in getDailyChallengeAction:", e);
        return generateSuggestion({ topic: 'Creative thinking', level: 'Intermediate' });
    }
}
