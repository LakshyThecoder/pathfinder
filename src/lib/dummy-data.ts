import type { RoadmapNodeData } from '@/types';

const UI_UX_DATA: RoadmapNodeData = {
    id: 'uiux-root',
    title: 'UI/UX Design Mastery',
    level: 'Beginner',
    children: [
      {
        id: 'uiux-b1', title: 'Foundations of UX', level: 'Beginner',
        children: [
            { id: 'uiux-b1-1', title: 'What is UX?', level: 'Beginner'},
            { id: 'uiux-b1-2', title: 'User-Centered Design', level: 'Beginner'},
        ]
      },
      { id: 'uiux-b2', title: 'Intro to UI Design', level: 'Beginner' },
      { id: 'uiux-b3', title: 'Design Principles', level: 'Beginner' },
      { id: 'uiux-b4', title: 'Wireframing', level: 'Beginner' },
      { id: 'uiux-b5', title: 'Prototyping', level: 'Beginner' },
      
      { id: 'uiux-i1', title: 'User Research', level: 'Intermediate' },
      { id: 'uiux-i2', title: 'Interaction Design', level: 'Intermediate' },
      { id: 'uiux-i3', title: 'Information Architecture', level: 'Intermediate' },
      { id: 'uiux-i4', title: 'Design Systems', level: 'Intermediate' },
      { id: 'uiux-i5', title: 'Usability Testing', level: 'Intermediate' },

      { id: 'uiux-a1', title: 'Advanced Prototyping', level: 'Advanced' },
      { id: 'uiux-a2', title: 'Product Strategy', level: 'Advanced' },
      { id: 'uiux-a3', title: 'Accessibility (A11y)', level: 'Advanced' },
      { id: 'uiux-a4', title: 'Design Leadership', level: 'Advanced' },
    ],
};

const WEB_DEV_DATA: RoadmapNodeData = {
    id: 'webdev-root',
    title: 'Web Development Mastery',
    level: 'Beginner',
    children: [
        { id: 'wd-b1', title: 'HTML Basics', level: 'Beginner'},
        { id: 'wd-b2', title: 'CSS Fundamentals', level: 'Beginner'},
        { id: 'wd-b3', title: 'JavaScript Core Concepts', level: 'Beginner'},

        { id: 'wd-i1', title: 'Frontend Frameworks (React)', level: 'Intermediate'},
        { id: 'wd-i2', title: 'Backend Development (Node.js)', level: 'Intermediate'},
        { id: 'wd-i3', title: 'Databases (SQL/NoSQL)', level: 'Intermediate'},

        { id: 'wd-a1', title: 'DevOps & CI/CD', level: 'Advanced'},
        { id: 'wd-a2', title: 'System Design & Architecture', level: 'Advanced'},
        { id: 'wd-a3', title: 'Web Security', level: 'Advanced'},
    ]
}

const DATA_SCIENCE_DATA: RoadmapNodeData = {
    id: 'ds-root',
    title: 'Data Science Mastery',
    level: 'Beginner',
    children: [
        { id: 'ds-b1', title: 'Python for Data Science', level: 'Beginner'},
        { id: 'ds-b2', title: 'Statistics & Probability', level: 'Beginner'},
        { id: 'ds-b3', title: 'Data Wrangling with Pandas', level: 'Beginner'},

        { id: 'ds-i1', title: 'Machine Learning Models', level: 'Intermediate'},
        { id: 'ds-i2', title: 'Data Visualization', level: 'Intermediate'},
        { id: 'ds-i3', title: 'Feature Engineering', level: 'Intermediate'},

        { id: 'ds-a1', title: 'Deep Learning', level: 'Advanced'},
        { id: 'ds-a2', title: 'Big Data Technologies (Spark)', level: 'Advanced'},
        { id: 'ds-a3', title: 'MLOps', level: 'Advanced'},
    ]
}


export const DUMMY_ROADMAPS: Record<string, RoadmapNodeData> = {
  'ui/ux design': UI_UX_DATA,
  'web development': WEB_DEV_DATA,
  'data science': DATA_SCIENCE_DATA
};

export const getRoadmapData = (query: string): RoadmapNodeData => {
  const normalizedQuery = query.toLowerCase();
  for (const key in DUMMY_ROADMAPS) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return DUMMY_ROADMAPS[key];
    }
  }
  // Fallback to UI/UX Design if no match is found
  return DUMMY_ROADMAPS['ui/ux design'];
};
