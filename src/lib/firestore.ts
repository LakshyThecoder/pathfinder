import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { StoredRoadmap, RoadmapNodeData, NodeStatus } from '@/types';

// The roadmap data received from the AI, before being stored
type RawRoadmapData = Omit<RoadmapNodeData, 'id'> & { id?: string };

export async function saveRoadmap(userId: string, roadmapData: RawRoadmapData, originalQuery: string): Promise<StoredRoadmap> {
  const roadmapsCollection = collection(db, 'roadmaps');
  
  const docRef = await addDoc(roadmapsCollection, {
    ...roadmapData,
    userId,
    query: originalQuery,
    nodeStatuses: {},
    createdAt: serverTimestamp(),
  });

  return {
    ...(roadmapData as RoadmapNodeData), // The AI result includes an ID
    id: docRef.id,
    userId,
    query: originalQuery,
    nodeStatuses: {},
    createdAt: new Date() as any, // Temporary, will be a Timestamp
  };
}

export async function getRoadmap(roadmapId: string): Promise<StoredRoadmap | null> {
    const roadmapRef = doc(db, 'roadmaps', roadmapId);
    const roadmapSnap = await getDoc(roadmapRef);

    if (!roadmapSnap.exists()) {
        return null;
    }

    return { id: roadmapSnap.id, ...roadmapSnap.data() } as StoredRoadmap;
}


export async function getUserRoadmaps(userId: string): Promise<StoredRoadmap[]> {
    const roadmapsCollection = collection(db, 'roadmaps');
    const q = query(roadmapsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredRoadmap));
}

export async function updateNodeStatus(roadmapId: string, nodeId: string, status: NodeStatus) {
    const roadmapRef = doc(db, 'roadmaps', roadmapId);
    const fieldToUpdate = `nodeStatuses.${nodeId}`;

    await updateDoc(roadmapRef, {
        [fieldToUpdate]: status
    });
}


export async function getDashboardStats(userId: string, roadmaps?: StoredRoadmap[]) {
    const userRoadmaps = roadmaps || await getUserRoadmaps(userId);

    if (userRoadmaps.length === 0) {
        return {
            roadmapsCreated: 0,
            skillsCompleted: 0,
            averageProgress: 0,
            topicDistribution: [],
        };
    }
    
    let skillsCompleted = 0;
    let totalProgressSum = 0;
    const topicCounts: Record<string, number> = {};

    userRoadmaps.forEach(roadmap => {
        const statuses = Object.values(roadmap.nodeStatuses || {});
        const completed = statuses.filter(s => s === 'completed').length;
        const skipped = statuses.filter(s => s === 'skipped').length;
        const total = roadmap.children?.length || 0;
        const trackable = total - skipped;

        skillsCompleted += completed;

        if (trackable > 0) {
            totalProgressSum += (completed / trackable) * 100;
        }

        // Basic topic categorization from query
        const queryLower = roadmap.query.toLowerCase();
        let category = 'Other';
        if (queryLower.includes('react') || queryLower.includes('web') || queryLower.includes('ui') || queryLower.includes('design')) category = 'Web Dev & Design';
        if (queryLower.includes('python') || queryLower.includes('data')) category = 'Data Science';
        if (queryLower.includes('ai') || queryLower.includes('machine learning')) category = 'AI/ML';
        if (queryLower.includes('speak') || queryLower.includes('leader')) category = 'Soft Skills';
        
        topicCounts[category] = (topicCounts[category] || 0) + 1;
    });

    const averageProgress = roadmaps && roadmaps.length > 0 ? Math.round(totalProgressSum / roadmaps.length) : 0;

    const topicDistribution = Object.entries(topicCounts).map(([name, value]) => ({ name, value }));
    
    return {
        roadmapsCreated: userRoadmaps.length,
        skillsCompleted,
        averageProgress,
        topicDistribution,
    };
}