// types.ts

export interface Student {
  id: string;
  name: string;
  present: boolean;
  capability_level: 'high' | 'medium' | 'low';
}

export interface Class {
  id: string;
  user_id?: string; // Associated authenticated user's UUID from Supabase
  name: string;
  students: Student[];
}

export interface GroupingHistoryEntry {
  id: string;
  timestamp: string; // ISO string
  method: 'byGroups' | 'byStudents';
  value: number; // Number of groups or students per group
  numberOfStudents: number;
  groups: {
    id: string;
    name: string;
    students: Student[];
  }[];
}