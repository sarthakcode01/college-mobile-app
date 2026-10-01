/**
 * Core domain types for CampusHire.
 * These mirror the database schema so the Postgres migration later
 * maps onto them almost one-to-one.
 */

export type Role = 'student' | 'tpo' | 'coordinator';

export type Branch =
  | 'Computer Science & Engineering'
  | 'Information Technology'
  | 'Electronics & Communication'
  | 'Mechanical Engineering'
  | 'Civil Engineering'
  | 'Electrical Engineering'
  | 'Mechanical & Production'
  | 'Biotechnology';

export type Gender = 'male' | 'female' | 'other';

export type DriveTier = 'super_dream' | 'dream' | 'regular';

export type DriveStatus = 'upcoming' | 'open' | 'closed' | 'completed';

export type JobType = 'full_time' | 'internship';

export type SelectionRound = {
  name: string;
  description: string;
};

export type EligibilityCriteria = {
  minCgpa: number;
  allowedBranches: string[];
  maxActiveBacklogs: number;
  minTenthMarks: number;
  minTwelfthMarks: number;
  /** When set, the drive is restricted to one gender for diversity drives. */
  allowedGenders?: ('all' | Gender)[];
};

export type StudentProfile = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  rollNumber: string;
  branch: Branch;
  cgpa: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  activeBacklogs: number;
  totalBacklogHistory: number;
  gender: Gender;
  skills: string[];
  resumeName?: string;
  hasAcceptedOffer: boolean;
  acceptedOfferCtc?: number;
};

export type Company = {
  id: string;
  name: string;
  logoText: string;
  website: string;
  about: string;
};

export type PlacementDrive = {
  id: string;
  companyId: string;
  jobTitle: string;
  jobRole: string;
  ctcLpa: number;
  stipendPerMonth?: number;
  location: string;
  workMode: 'onsite' | 'hybrid' | 'remote';
  jobType: JobType;
  eligibility: EligibilityCriteria;
  rounds: SelectionRound[];
  registrationDeadline: string; // ISO
  driveDate: string; // ISO
  status: DriveStatus;
  jdSummary: string;
  keySkills: string[];
};

export const APPLICATION_STAGES = [
  'Applied',
  'OA',
  'Tech_1',
  'Tech_2',
  'HR',
  'Selected',
] as const;

export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export type ApplicationStatus = 'in_progress' | 'shortlisted' | 'rejected' | 'offered';

export type StageSchedule = {
  stage: ApplicationStage;
  date?: string;
  venue?: string;
  reportingTime?: string;
  link?: string;
  feedback?: string;
};

export type Application = {
  id: string;
  driveId: string;
  studentId: string;
  currentStage: ApplicationStage;
  status: ApplicationStatus;
  appliedAt: string;
  schedule: StageSchedule[];
  rejectionReason?: string;
};

export type AnnouncementPriority = 'urgent' | 'high' | 'normal';

export type Announcement = {
  id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  targetBranch: string;
  postedBy: string;
  createdAt: string;
};

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type InterviewExperience = {
  id: string;
  companyId: string;
  authorName: string;
  authorBranch: string;
  roleOffered: string;
  ctcLpa: number;
  difficulty: Difficulty;
  rounds: { name: string; experience: string }[];
  topicsAsked: string[];
  tipsForJuniors: string;
  upvotes: number;
  createdAt: string;
};

export type ApplicantRow = {
  studentId: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  branch: string;
  cgpa: number;
  gender: Gender;
  activeBacklogs: number;
  resumeName?: string;
  stage: ApplicationStage;
  status: ApplicationStatus;
};

export type PlacementStats = {
  totalStudents: number;
  placedStudents: number;
  placementPercentage: number;
  averageCtc: number;
  highestCtc: number;
  activeDrives: number;
  totalOffers: number;
  branchWise: { branch: string; placed: number; total: number; percentage: number }[];
  ctcDistribution: { range: string; count: number }[];
};