export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  education?: string;
  college?: string;
  course?: string;
  year_of_study?: string;
  skills?: string;
  interests?: string;
  location?: string;
  phone?: string;
  bio?: string;
  resume_url?: string;
  resume_text?: string;
  certifications?: string;
  projects?: string;
  created_at?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  eligibility: string;
  education_level: string;
  amount: string;
  deadline: string;
  category: string;
  official_url: string;
  verified: number;
  required_documents?: string;
  location?: string;
  income_range?: string;
  is_government?: number;
  is_fully_funded?: number;
  views_count?: number;
  created_at?: string;
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  skills: string;
  location: string;
  work_mode: string;
  stipend: string;
  duration: string;
  deadline: string;
  official_url: string;
  description: string;
  verified: number;
  views_count?: number;
  created_at?: string;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  skills: string;
  experience: string;
  salary: string;
  location: string;
  work_mode: string;
  deadline: string;
  official_url: string;
  description: string;
  verified: number;
  views_count?: number;
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  category: string;
  duration: string;
  level: string;
  price: string;
  is_free: number;
  certificate_available: number;
  official_url: string;
  description: string;
  verified: number;
  created_at?: string;
}

export interface BookmarkItem {
  id: string;
  user_id: string;
  resource_id: string;
  resource_type: 'scholarship' | 'internship' | 'job' | 'course';
  title?: string;
  provider_or_company?: string;
  created_at: string;
  details?: Scholarship | Internship | Job | Course;
}

export interface ApplicationItem {
  id: string;
  user_id: string;
  opportunity_id: string;
  opportunity_type: 'scholarship' | 'internship' | 'job' | 'course';
  title: string;
  company_or_provider: string;
  status: 'Interested' | 'Saved' | 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  applied_date?: string;
  notes?: string;
  deadline?: string;
  created_at: string;
}

export interface CareerPathItem {
  id: string;
  title: string;
  category: string;
  overview: string;
  beginnerSkills: string[];
  advancedSkills: string[];
  certifications: string[];
  typicalRoles: string[];
  roadmapSteps: string[];
  avgSalary: string;
  growthRate: string;
  recommendedCourses: string[];
}

export interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface DeadlineItem {
  id: string;
  title: string;
  organization: string;
  deadline: string;
  type: 'scholarship' | 'internship' | 'job';
  verified: number;
  diffDays: number;
  status: 'Due Today' | 'Due Soon' | 'Upcoming' | 'Expired';
}

export interface MatchAnalysis {
  matchPercentage: number;
  breakdown: {
    skillsMatch: number;
    educationMatch: number;
    interestMatch: number;
    locationMatch: number;
  };
  missingSkills: string[];
  matchedSkills: string[];
  whyRecommended: string;
}

export interface ResumeAnalysisResult {
  score: number;
  grade: string;
  summary: string;
  strengths: string[];
  missingSkills: string[];
  suggestedImprovements: string[];
  recommendedCareerPaths: string[];
  recommendedCourses: string[];
  formattingScore: number;
  atsCompatibility: string;
}

export interface SkillGapResult {
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  learningRoadmap: Array<{
    phase: string;
    skillsToAcquire: string[];
    recommendedResources: string[];
    estimatedWeeks: number;
  }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  botName?: 'Sam' | 'Sarah';
  language?: string;
  text: string;
  timestamp: string;
}

export interface SentEmailReminderLog {
  id: string;
  userId: string;
  recipientEmail: string;
  recipientName: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: string;
  companyOrProvider: string;
  deadline: string;
  hoursRemaining: number;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  status: string;
  sentAt: string;
}

export interface Tracked24hOpportunity {
  id: string;
  opportunityId: string;
  title: string;
  companyOrProvider: string;
  opportunityType: string;
  status: string;
  deadline: string;
  hoursRemaining: number;
  source: 'application' | 'bookmark';
}

export interface ReminderServiceStatus {
  serviceName: string;
  transport: string;
  status: 'active' | 'idle';
  recipientEmail: string;
  studentName: string;
  alertThresholdHours: number;
  stats: {
    totalTrackedWithDeadlines: number;
    deadlinesWithin24hCount: number;
    totalRemindersDispatched: number;
  };
  upcomingWithin24h: Tracked24hOpportunity[];
}

