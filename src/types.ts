export type UserRole = 'admin' | 'director' | 'teacher' | 'parent' | 'student';

export interface Student {
  id: string;
  name: string;
  groupName: string;
  avatar: string;
  level: number;
  xp: number;
  parentName: string;
  parentPhone: string;
  telegramId: string;
  attendanceRate: number; // percentage, e.g., 92
  generalScore: number;    // average grade, e.g., 4.7 out of 5
  riskRating: 'low' | 'medium' | 'high'; // attrition/churn risk
  mentorId: string; // ID of the AI mentor
  academicRole?: 'Исследователь' | 'Наставник' | 'Эксперт' | 'Лидер команды' | 'Коммуникатор';
  engagementRate?: number; // engagement rate 0-100
  trustPoints?: Record<string, number>;
  completedMentorQuests?: string[];
  unlockedItems?: string[];
  unlockedAchievements?: string[];
}

export interface StudentProgress {
  id: string;
  studentId: string;
  strengths: string[];
  weakTopics: string[];
  recommendations: string[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }[];
  attendanceHistory: {
    date: string;
    status: 'present' | 'absent' | 'late';
    topic: string;
  }[];
  gradesHistory: {
    date: string;
    topic: string;
    grade: number; // 1-5 scale
  }[];
}

export interface MentorCharacter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: string;
  motivationalPhrase: string;
}

export interface Group {
  id: string;
  name: string;
  subject: string;
  teacherName: string;
  schedule: string;
  studentsCount: number;
  engagementRate?: number; // 0-100 index for group leaderboard
  questsCompleted?: number; // count of group quests earned
}

export interface GroupQuest {
  id: string;
  groupId: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  status: 'active' | 'completed';
}

export interface PersonalChallenge {
  id: string;
  studentId: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  status: 'active' | 'completed';
  skill: string;
}

export interface PeerHelp {
  id: string;
  helperStudentId: string;
  recipientStudentId: string;
  action: string;
  rewardXp: number;
  date: string;
}

export interface AIAnalysisResult {
  studentName: string;
  studentId: string;
  lessonTopic: string;
  attendance: 'present' | 'absent' | 'late';
  grade: number;
  progressPercentage: number;
  strengths: string[];
  weakTopics: string[];
  recommendations: string[];
  achievementsUnlocked: string[];
}

export interface LessonReport {
  id: string;
  date: string;
  groupName: string;
  teacherName: string;
  topic: string;
  duration: string;
  rawText: string;
  isVoiceText: boolean;
  analyses: AIAnalysisResult[];
}

export interface Notification {
  id: string;
  type: 'parent_alert' | 'teacher_alert' | 'system';
  role: 'parent' | 'teacher' | 'admin';
  studentName?: string;
  title: string;
  message: string;
  timestamp: string;
  sentViaTelegram: boolean;
  status: 'sent' | 'pending';
}

export interface apiIntegrations {
  id: string;
  platform: string;
  status: 'active' | 'inactive';
  apiKey: string;
  lastUsed: string;
}
