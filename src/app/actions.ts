"use server";

import { roadmapInsightGenerator, RoadmapInsightOutput, RoadmapInsightInput } from "@/ai/flows/roadmap-insight-generator";
import { generateRoadmap, GenerateRoadmapOutput } from "@/ai/flows/roadmap-generator";
import { getFollowUpAnswer as getFollowUpAnswerFlow, FollowUpInput, FollowUpOutput } from "@/ai/flows/follow-up-question-generator";
import { generateDailyChallenge, DailyChallengeOutput } from "@/ai/flows/suggestion-generator";
import { saveRoadmap as saveRoadmapToDb, getRoadmap as getRoadmapFromDb, getUserRoadmaps, updateNodeStatus as updateNodeStatusInDb, getDashboardStats } from "@/lib/firestore";
import type { StoredRoadmap, NodeStatus } from "@/types";
import { auth } from "@/lib/firebase-admin";

async function getUserId(): Promise<string | null> {
    try {
        const user = await auth.getDecodedIdToken();
        return user?.uid || null;
    } catch (e) {
        return null;
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

export async function getAiRoadmap(query: string): Promise<StoredRoadmap | { error: string }> {
    try {
      const result = await generateRoadmap({ query });
      const userId = await getUserId();

      if (userId) {
        const savedRoadmap = await saveRoadmapToDb(userId, result, query);
        return savedRoadmap;
      }
      
      // For logged-out users, return an unsaved roadmap structure
      return {
        ...(result as GenerateRoadmapOutput),
        id: result.id || 'temp-id',
        userId: '',
        query: query,
        nodeStatuses: {},
        createdAt: new Date() as any,
      };

    } catch (e: any) {
      console.error("Error in getAiRoadmap:", e);
      return { error: e.message || "Failed to generate the roadmap. The AI may be busy or the topic is too complex. Please try again later or with a different topic." };
    }
}

export async function getStoredRoadmap(id: string): Promise<StoredRoadmap | { error: string }> {
    try {
        const roadmap = await getRoadmapFromDb(id);
        const userId = await getUserId();

        if (!roadmap) {
            return { error: 'Roadmap not found.' };
        }

        // Basic authorization: ensure the user owns the roadmap
        if (roadmap.userId !== userId) {
            return { error: 'You do not have permission to view this roadmap.' };
        }
        
        return roadmap;
    } catch (e: any) {
        console.error("Error in getStoredRoadmap:", e);
        return { error: e.message || 'Failed to retrieve the roadmap.' };
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

export async function updateNodeStatusAction(roadmapId: string, nodeId: string, status: NodeStatus) {
    const userId = await getUserId();
    if (!userId || !roadmapId) {
        return { error: 'Authentication required.' };
    }
    try {
        // We could add another auth check here to ensure the user owns the roadmap
        await updateNodeStatusInDb(roadmapId, nodeId, status);
        return { success: true };
    } catch (e: any) {
        console.error("Error updating node status:", e);
        return { error: e.message || 'Failed to update status.' };
    }
}

export async function getDashboardDataAction() {
    const userId = await getUserId();
    if (!userId) {
        return { error: "User not authenticated" };
    }

    try {
        const [stats, recentRoadmaps] = await Promise.all([
            getDashboardStats(userId),
            getUserRoadmaps(userId).then(r => r.slice(0, 3)) // Get top 3 recent
        ]);
        
        return {
            stats,
            recentRoadmaps,
        };

    } catch(e: any) {
        console.error("Error fetching dashboard data:", e);
        return { error: e.message || "Could not load dashboard data." };
    }
}


export async function getDailyChallengeAction(): Promise<DailyChallengeOutput | { error: string; challenge?: string; }> {
    const userId = await getUserId();
    if (!userId) {
        return { error: 'Authentication required.' };
    }
    
    try {
        const roadmaps = await getUserRoadmaps(userId);
        if (roadmaps.length === 0) {
            return { challenge: "Start your first roadmap to get daily challenges!" };
        }

        const latestRoadmap = roadmaps[0];
        const statuses = latestRoadmap.nodeStatuses || {};
        const nextTopicNode = latestRoadmap.children.find(child => !statuses[child.id] || statuses[child.id] === 'not-started' || statuses[child.id] === 'in-progress');

        if (!nextTopicNode) {
            return { challenge: "You've completed all topics in your latest roadmap! Great job!" };
        }

        const result = await generateDailyChallenge({
            roadmapTitle: latestRoadmap.title,
            nextTopic: nextTopicNode.title,
            timePreference: '15-30 minutes'
        });

        return result;

    } catch (e: any) {
        console.error("Error in getDailyChallengeAction:", e);
        return { error: e.message || "Could not generate a daily challenge." };
    }
}

export async function getHistoryAction() {
  const userId = await getUserId();
  if (!userId) {
    return { error: "User not authenticated" };
  }
  try {
    const roadmaps = await getUserRoadmaps(userId);
    return { roadmaps };
  } catch (e: any) {
    console.error("Error fetching history:", e);
    return { error: e.message || "Could not load history." };
  }
}
