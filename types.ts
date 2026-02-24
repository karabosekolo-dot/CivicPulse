
export enum IssueStatus {
  OPEN = 'Open',
  INVESTIGATING = 'Investigating',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export enum IssueCategory {
  INFRASTRUCTURE = 'Infrastructure',
  WATER_UTILITIES = 'Water & Utilities',
  SAFETY_SECURITY = 'Safety & Security',
  CORRUPTION_GOVERNANCE = 'Corruption & Governance',
  EDUCATION_SCHOOLS = 'Education & Schools',
  ENVIRONMENT = 'Environment',
  OTHER = 'Other'
}

export enum UrgencyLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  urgency: UrgencyLevel;
  location: GeoLocation;
  imageUrl?: string; // Keeping for backward compatibility if needed, but will prefer media
  media?: MediaItem[];
  reporterName: string;
  reporterId?: string;
  timestamp: string;
  upvotes: number;
  updates: IssueUpdate[];
  recommendedAction?: string;
}

export interface IssueUpdate {
  id: string;
  status: IssueStatus;
  comment: string;
  timestamp: string;
  author: string;
  authorId?: string;
  imageUrl?: string; // Keeping for backward compatibility
  media?: MediaItem[];
}

export interface AnalysisResult {
  category: IssueCategory;
  urgency: UrgencyLevel;
  summary: string;
  tags: string[];
  recommendedAction: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
