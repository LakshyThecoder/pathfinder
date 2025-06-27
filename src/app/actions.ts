"use server";

import { roadmapInsightGenerator, RoadmapInsightOutput, RoadmapInsightInput } from "@/ai/flows/roadmap-insight-generator";
import { generateRoadmap, GenerateRoadmapOutput } from "@/ai/flows/roadmap-generator";
import { getFollowUpAnswer as getFollowUpAnswerFlow, FollowUpInput, FollowUpOutput } from "@/ai/flows/follow-up-question-generator";
import { generateDailyChallenge, DailyChallengeOutput } from "@/ai/flows/suggestion-generator";
import { saveRoadmap as saveRoadmapToDb, getRoadmap as getRoadmapFromDb, getUserRoadmaps, updateNodeStatus as updateNodeStatusInDb, getDashboardStats } from "@/lib/firestore";
import type { StoredRoadmap, RoadmapNodeData, NodeStatus } from "@/types";
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

export async function saveRoadmapAction(roadmap: StoredRoadmap): Promise<StoredRoadmap | { error: string }> {
    const userId = await getUserId();
    if (!userId) {
        return { error: 'You must be logged in to save a roadmap.' };
    }

    try {
        // The roadmap data passed from the client doesn't have the final DB properties yet.
        const savedRoadmap = await saveRoadmapToDb(userId, roadmap, roadmap.query);
        // Serialize the roadmap for the client, converting the Timestamp to a string.
        return {
            ...savedRoadmap,
            createdAt: (savedRoadmap.createdAt as any).toDate().toISOString(),
        } as StoredRoadmap;
    } catch (e: any) {
        console.error("Error in saveRoadmapAction:", e);
        return { error: e.message || 'Failed to save roadmap.' };
    }
}


export async function getAiRoadmap(query: string): Promise<StoredRoadmap | { error: string }> {
    try {
      const result = await generateRoadmap({ query });
      const userId = await getUserId();

      // Return an unsaved roadmap structure. Saving is now an explicit user action.
      return {
        ...(result as GenerateRoadmapOutput),
        id: result.id || `temp-${Date.now()}`,
        userId: userId || '',
        query: query,
        nodeStatuses: {},
        // No 'createdAt' property, as it has not been saved to the database.
      } as StoredRoadmap;

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
        
        // Serialize the timestamp before sending to the client
        return {
            ...roadmap,
            createdAt: (roadmap.createdAt as any).toDate().toISOString(),
        } as StoredRoadmap;
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
        const roadmaps = await getUserRoadmaps(userId);
        const stats = await getDashboardStats(userId, roadmaps);
        const recentRoadmaps = roadmaps.slice(0, 3);

        const serializableRecentRoadmaps = recentRoadmaps.map(roadmap => ({
            ...roadmap,
            createdAt: (roadmap.createdAt as any).toDate().toISOString(),
        }));
        
        return {
            stats,
            recentRoadmaps: serializableRecentRoadmaps,
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
    const serializableRoadmaps = roadmaps.map(roadmap => ({
        ...roadmap,
        createdAt: (roadmap.createdAt as any).toDate().toISOString(),
    }));
    return { roadmaps: serializableRoadmaps };
  } catch (e: any) {
    console.error("Error fetching history:", e);
    return { error: e.message || "Could not load history." };
  }
}
