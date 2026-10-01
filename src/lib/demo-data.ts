/**
 * Demo dataset for CampusHire.
 * Replaces the Postgres layer during the UI-first phase. The shapes match
 * src/lib/types.ts exactly, so swapping in real queries later is mechanical.
 */

import { getDriveTier } from '@/lib/eligibility';
import type {
    Announcement,
    ApplicantRow,
    Application,
    Company,
    InterviewExperience,
    PlacementDrive,
    PlacementStats,
    StudentProfile,
} from '@/lib/types';

/** Fixed "now" anchor so countdowns and dates stay stable across reloads. */
const NOW = new Date('2026-10-01T09:00:00+05:30');

export function daysFromNow(days: number, hour = 10, minute = 0): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Mechanical & Production',
  'Biotechnology',
] as const;

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const DEMO_STUDENT: StudentProfile = {
  id: 'stu-001',
  userId: 'usr-001',
  fullName: 'Sarthak Upadhyay',
  email: 'sarthak.upadhyay@dhsgu.edu.in',
  phone: '+91 98765 43210',
  rollNumber: 'CS22B1042',
  branch: 'Computer Science & Engineering',
  cgpa: 8.5,
  tenthPercentage: 88.4,
  twelfthPercentage: 91.2,
  activeBacklogs: 0,
  totalBacklogHistory: 1,
  gender: 'male',
  skills: ['React Native', 'TypeScript', 'SQL', 'DSA', 'React', 'Node.js'],
  resumeName: 'Sarthak_Upadhyay_Resume.pdf',
  hasAcceptedOffer: false,
};

export const DEMO_TPO = {
  id: 'usr-tpo-1',
  fullName: 'Dr. Anjali Verma',
  email: 'tpo@dhsgu.edu.in',
  role: 'tpo' as const,
  designation: 'Training & Placement Officer',
};

export const DEMO_COORDINATOR = {
  id: 'usr-coord-1',
  fullName: 'Rohit Sharma',
  email: 'coordinator@dhsgu.edu.in',
  role: 'coordinator' as const,
  designation: 'Student Placement Coordinator',
};

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export const COMPANIES: Company[] = [
  {
    id: 'cmp-001',
    name: 'Google',
    logoText: 'G',
    website: 'https://google.com/about/careers',
    about: 'Designs products that billions of people rely on daily.',
  },
  {
    id: 'cmp-002',
    name: 'Microsoft',
    logoText: 'M',
    website: 'https://jobs.careers.microsoft.com',
    about: 'Cloud, productivity and AI platform company.',
  },
  {
    id: 'cmp-003',
    name: 'Amazon',
    logoText: 'A',
    website: 'https://amazon.jobs',
    about: 'Global e-commerce, logistics and cloud infrastructure leader.',
  },
  {
    id: 'cmp-004',
    name: 'Adobe',
    logoText: 'A',
    website: 'https://careers.adobe.com',
    about: 'Creative, document and experience cloud software company.',
  },
  {
    id: 'cmp-005',
    name: 'Deloitte',
    logoText: 'D',
    website: 'https://www2.deloitte.com',
    about: 'Audit, consulting, tax and advisory professional services firm.',
  },
  {
    id: 'cmp-006',
    name: 'TCS Digital',
    logoText: 'T',
    website: 'https://careers.tcs.com',
    about: 'Banking, retail and digital services arm of Tata Consultancy Services.',
  },
  {
    id: 'cmp-007',
    name: 'Infosys',
    logoText: 'I',
    website: 'https://www.infosys.com/careers',
    about: 'Next-generation digital services and consulting company.',
  },
  {
    id: 'cmp-008',
    name: 'Zoho',
    logoText: 'Z',
    website: 'https://www.zoho.com/careers',
    about: 'Indigenous software product company headquartered in Chennai.',
  },
  {
    id: 'cmp-009',
    name: 'Goldman Sachs',
    logoText: 'G',
    website: 'https://www.goldmansachs.com/careers',
    about: 'Global investment banking and financial services firm.',
  },
  {
    id: 'cmp-010',
    name: 'Accenture',
    logoText: 'A',
    website: 'https://careers.accenture.com',
    about: 'Technology and professional services company.',
  },
];

export function getCompany(id: string): Company {
  return COMPANIES.find((c) => c.id === id) ?? COMPANIES[0];
}

// ---------------------------------------------------------------------------
// Placement drives
// ---------------------------------------------------------------------------

const ALL_BRANCHES = [...BRANCHES];
const CSE_IT = [
  'Computer Science & Engineering',
  'Information Technology',
];

export const DRIVES: PlacementDrive[] = [
  {
    id: 'drv-001',
    companyId: 'cmp-001',
    jobTitle: 'Software Engineer — Early 2027',
    jobRole: 'Software Development Engineer',
    ctcLpa: 28,
    location: 'Bengaluru, Karnataka',
    workMode: 'hybrid',
    jobType: 'full_time',
    eligibility: {
      minCgpa: 8.0,
      allowedBranches: CSE_IT,
      maxActiveBacklogs: 0,
      minTenthMarks: 75,
      minTwelfthMarks: 75,
    },
    rounds: [
      { name: 'Online Assessment', description: 'DSA + CS fundamentals, 90 minutes' },
      { name: 'Technical Round 1', description: 'Data structures and problem solving' },
      { name: 'Technical Round 2', description: 'System design and OOP depth' },
      { name: 'HR Interview', description: 'Culture fit and behavioural rounds' },
    ],
    registrationDeadline: daysFromNow(2, 23, 59),
    driveDate: daysFromNow(4, 9, 0),
    status: 'open',
    jdSummary:
      'You will design and build large-scale distributed systems serving billions of requests. The role involves strong fundamentals in algorithms, data structures and system design, with an emphasis on code quality and cross-team collaboration.',
    keySkills: ['DSA', 'System Design', 'C++/Java', 'OOP'],
  },
  {
    id: 'drv-002',
    companyId: 'cmp-002',
    jobTitle: 'Software Engineer — Campus 2027',
    jobRole: 'SDE II',
    ctcLpa: 24.5,
    location: 'Hyderabad, Telangana',
    workMode: 'hybrid',
    jobType: 'full_time',
    eligibility: {
      minCgpa: 7.5,
      allowedBranches: CSE_IT,
      maxActiveBacklogs: 0,
      minTenthMarks: 70,
      minTwelfthMarks: 70,
    },
    rounds: [
      { name: 'Online Assessment', description: 'Coding assessment, 120 minutes' },
      { name: 'Technical Interview', description: 'Two rounds back to back' },
      { name: 'HR Interview', description: 'Final discussion' },
    ],
    registrationDeadline: daysFromNow(5, 18, 0),
    driveDate: daysFromNow(7, 10, 0),
    status: 'open',
    jdSummary:
      'Join the Azure and platform teams building cloud infrastructure at global scale. Expect deep work on reliability, distributed storage and developer tooling.',
    keySkills: ['DSA', 'Cloud', 'Python/C#', 'Distributed Systems'],
  },
  {
    id: 'drv-003',
    companyId: 'cmp-003',
    jobTitle: 'SDE Intern — Summer 2027',
    jobRole: 'Software Development Intern',
    ctcLpa: 12.9,
    stipendPerMonth: 80000,
    location: 'Bengaluru, Karnataka',
    workMode: 'onsite',
    jobType: 'internship',
    eligibility: {
      minCgpa: 7.0,
      allowedBranches: CSE_IT,
      maxActiveBacklogs: 1,
      minTenthMarks: 65,
      minTwelfthMarks: 65,
    },
    rounds: [
      { name: 'Online Assessment', description: 'DSA screening test' },
      { name: 'Technical Interview', description: 'Pair programming round' },
      { name: 'Managerial Round', description: 'Internship conversion discussion' },
    ],
    registrationDeadline: daysFromNow(1, 20, 0),
    driveDate: daysFromNow(3, 9, 30),
    status: 'open',
    jdSummary:
      'Six-month internship with a strong conversion pipeline. You will be embedded with a product team and work on production code with mentorship.',
    keySkills: ['DSA', 'OOP', 'Git', 'Problem Solving'],
  },
  {
    id: 'drv-004',
    companyId: 'cmp-004',
    jobTitle: 'Product Engineer',
    jobRole: 'Product Engineer II',
    ctcLpa: 18.2,
    location: 'Noida, Uttar Pradesh',
    workMode: 'hybrid',
    jobType: 'full_time',
    eligibility: {
      minCgpa: 7.0,
      allowedBranches: CSE_IT,
      maxActiveBacklogs: 0,
      minTenthMarks: 70,
      minTwelfthMarks: 70,
    },
    rounds: [
      { name: 'Online Assessment', description: 'Aptitude and DSA' },
      { name: 'Technical Round 1', description: 'Front-end and architecture' },
      { name: 'Technical Round 2', description: 'Product thinking and collaboration' },
      { name: 'HR Interview', description: 'Culture and values' },
    ],
    registrationDeadline: daysFromNow(8, 23, 59),
    driveDate: daysFromNow(11, 10, 0),
    status: 'open',
    jdSummary:
      'Build creative tools used by millions of designers. The role blends deep engineering with strong product intuition and cross-functional collaboration.',
    keySkills: ['React', 'TypeScript', 'Web APIs', 'Design Sense'],
  },
  {
    id: 'drv-005',
    companyId: 'cmp-005',
    jobTitle: 'Analyst — Technology Consulting',
    jobRole: 'Consulting Analyst',
    ctcLpa: 9.4,
    location: 'Mumbai, Maharashtra',
    workMode: 'onsite',
    jobType: 'full_time',
    eligibility: {
      minCgpa: 6.5,
      allowedBranches: ALL_BRANCHES,
      maxActiveBacklogs: 2,
      minTenthMarks: 60,
      minTwelfthMarks: 60,
    },
    rounds: [
      { name: 'Aptitude Test', description: 'Verbal, quantitative and logical reasoning' },
      { name: 'Case Study', description: 'Group business case presentation' },
      { name: 'Technical Interview', description: 'Domain and analytics discussion' },
      { name: 'HR Interview', description: 'Final round' },
    ],
    registrationDeadline: daysFromNow(6, 17, 0),
    driveDate: daysFromNow(9, 9, 0),
    status: 'open',
    jdSummary:
      'Work with Fortune 500 clients on technology strategy, digital transformation and enterprise architecture engagements.',
    keySkills: ['SQL', 'Excel', 'Communication', 'Analytics'],
  },
  {
    id: 'drv-006',
    companyId: 'cmp-006',
    jobTitle: 'Systems Engineer',
    jobRole: 'Systems Engineer (Digital)',
    ctcLpa: 5.5,
    location: 'Nagpur, Maharashtra',
    workMode: 'onsite',
    jobType: 'full_time',
    eligibility: {
      minCgpa: 5.5,
      allowedBranches: ALL_BRANCHES,
      maxActiveBacklogs: 3,
      minTenthMarks: 55,
      minTwelfthMarks: 55,
    },
    rounds: [
      { name: 'Online Assessment', description: 'Aptitude and coding basics' },
      { name: 'Technical Interview', description: 'Core CS and project discussion' },
      { name: 'HR Interview', description: 'Fit and availability' },
    ],
    registrationDeadline: daysFromNow(9, 23, 59),
    driveDate: daysFromNow(13, 9, 0),
    status: 'open',
    jdSummary:
      'Entry-level systems engineering role supporting banking and retail platforms for large enterprise clients.',
    keySkills: ['Java', 'SQL', 'Problem Solving'],
  },
  {
    id: 'drv-007',
    companyId: 'cmp-009',
    jobTitle: 'Technology Analyst',
    jobRole: 'Technology Analyst — 2027',
    ctcLpa: 15,
    location: 'Bengaluru, Karnataka',
    workMode: 'onsite',
    jobType: 'full_time',
    eligibility: {
      minCgpa: 8.5,
      allowedBranches: CSE_IT,
      maxActiveBacklogs: 0,
      minTenthMarks: 80,
      minTwelfthMarks: 85,
      allowedGenders: ['female'],
    },
    rounds: [
      { name: 'Online Assessment', description: 'Technical and quant assessment' },
      { name: 'Technical Round 1', description: 'Algorithms deep dive' },
      { name: 'Technical Round 2', description: 'Quant and market concepts' },
      { name: 'HR Interview', description: 'Behavioural and values' },
    ],
    registrationDeadline: daysFromNow(4, 23, 59),
    driveDate: daysFromNow(10, 9, 0),
    status: 'open',
    jdSummary:
      'Campus diversity hiring initiative for women technology graduates. Strong performance bonus and structured global rotation programme.',
    keySkills: ['DSA', 'Quantitative Aptitude', 'Finance'],
  },
  {
    id: 'drv-008',
    companyId: 'cmp-008',
    jobTitle: 'Software Developer',
    jobRole: 'Developer — Freshers',
    ctcLpa: 6.5,
    location: 'Chennai, Tamil Nadu',
    workMode: 'onsite',
    jobType: 'full_time',
    eligibility: {
      minCgpa: 6.0,
      allowedBranches: CSE_IT,
      maxActiveBacklogs: 1,
      minTenthMarks: 60,
      minTwelfthMarks: 60,
    },
    rounds: [
      { name: 'Online Assessment', description: 'Coding and logical reasoning' },
      { name: 'Technical Interview', description: 'Programming and CS fundamentals' },
      { name: 'HR Interview', description: 'Culture fit' },
    ],
    registrationDeadline: daysFromNow(-2, 23, 59),
    driveDate: daysFromNow(3, 10, 0),
    status: 'closed',
    jdSummary:
      'Work on Zoho Workplace and Mail — products serving millions of users worldwide. Strong product engineering culture.',
    keySkills: ['Java', 'Web', 'SQL', 'DSA'],
  },
  {
    id: 'drv-009',
    companyId: 'cmp-010',
    jobTitle: 'ASE — Technology Consulting',
    jobRole: 'Associate System Engineer',
    ctcLpa: 4.4,
    location: 'Pune, Maharashtra',
    workMode: 'hybrid',
    jobType: 'full_time',
    eligibility: {
      minCgpa: 5.0,
      allowedBranches: ALL_BRANCHES,
      maxActiveBacklogs: 4,
      minTenthMarks: 50,
      minTwelfthMarks: 50,
    },
    rounds: [
      { name: 'Online Assessment', description: 'Aptitude and coding' },
      { name: 'Technical Interview', description: 'CS fundamentals' },
      { name: 'HR Interview', description: 'Final discussion' },
    ],
    registrationDeadline: daysFromNow(12, 23, 59),
    driveDate: daysFromNow(16, 9, 0),
    status: 'upcoming',
    jdSummary:
      'Broad-based hiring across all branches with a structured 12-month training programme before client allocation.',
    keySkills: ['C/Java', 'SQL', 'Communication'],
  },
  {
    id: 'drv-010',
    companyId: 'cmp-004',
    jobTitle: 'Applied AI Intern',
    jobRole: 'ML Engineering Intern',
    ctcLpa: 8,
    stipendPerMonth: 45000,
    location: 'Remote',
    workMode: 'remote',
    jobType: 'internship',
    eligibility: {
      minCgpa: 7.5,
      allowedBranches: CSE_IT,
      maxActiveBacklogs: 0,
      minTenthMarks: 70,
      minTwelfthMarks: 70,
    },
    rounds: [
      { name: 'Online Assessment', description: 'ML fundamentals and coding' },
      { name: 'Technical Interview', description: 'Model evaluation and design' },
      { name: 'Research Discussion', description: 'Project deep dive' },
    ],
    registrationDeadline: daysFromNow(14, 23, 59),
    driveDate: daysFromNow(20, 9, 0),
    status: 'upcoming',
    jdSummary:
      'Remote internship working on generative AI features in the Creative Cloud. Open to students from any year of study with a strong project record.',
    keySkills: ['Python', 'PyTorch', 'MLOps', 'Statistics'],
  },
];

export function getDrive(id: string): PlacementDrive | undefined {
  return DRIVES.find((d) => d.id === id);
}

export function driveWithTier(drive: PlacementDrive) {
  return { ...drive, tier: getDriveTier(drive.ctcLpa) };
}

// ---------------------------------------------------------------------------
// Applications for the demo student
// ---------------------------------------------------------------------------

export const DEMO_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    driveId: 'drv-001',
    studentId: 'stu-001',
    currentStage: 'Tech_1',
    status: 'in_progress',
    appliedAt: daysFromNow(-6, 14, 30),
    schedule: [
      {
        stage: 'Applied',
        date: daysFromNow(-6, 14, 30),
        feedback: 'Application submitted and verified by the placement cell.',
      },
      {
        stage: 'OA',
        date: daysFromNow(-3, 10, 0),
        feedback: 'Scored 78/100. Qualified for the technical round.',
      },
      {
        stage: 'Tech_1',
        date: daysFromNow(1, 10, 0),
        venue: 'Seminar Hall A, IT Block',
        reportingTime: '09:30 AM',
        feedback: 'Data structures and problem solving round.',
      },
      { stage: 'Tech_2' },
      { stage: 'HR' },
    ],
  },
  {
    id: 'app-002',
    driveId: 'drv-003',
    studentId: 'stu-001',
    currentStage: 'OA',
    status: 'in_progress',
    appliedAt: daysFromNow(-2, 16, 0),
    schedule: [
      {
        stage: 'Applied',
        date: daysFromNow(-2, 16, 0),
        feedback: 'Application submitted. Test link will be shared 24 hours before the exam.',
      },
      {
        stage: 'OA',
        date: daysFromNow(2, 15, 0),
        link: 'https://assessment.amazon.in',
        reportingTime: '03:00 PM',
        feedback: 'DSA screening test, 90 minutes.',
      },
    ],
  },
  {
    id: 'app-003',
    driveId: 'drv-005',
    studentId: 'stu-001',
    currentStage: 'HR',
    status: 'shortlisted',
    appliedAt: daysFromNow(-9, 11, 15),
    schedule: [
      { stage: 'Applied', date: daysFromNow(-9, 11, 15) },
      {
        stage: 'OA',
        date: daysFromNow(-7, 10, 0),
        feedback: 'Aptitude score 84/100. Cleared.',
      },
      {
        stage: 'Tech_1',
        date: daysFromNow(-5, 11, 0),
        feedback: 'Analytics case study. Strong performance.',
      },
      {
        stage: 'Tech_2',
        date: daysFromNow(-2, 10, 0),
        feedback: 'Shortlisted for the panel round.',
      },
      {
        stage: 'HR',
        date: daysFromNow(3, 10, 30),
        venue: 'Placement Cell, Administrative Block',
        reportingTime: '10:00 AM',
        feedback: 'Final panel with the consulting partner.',
      },
    ],
  },
  {
    id: 'app-004',
    driveId: 'drv-008',
    studentId: 'stu-001',
    currentStage: 'Tech_1',
    status: 'rejected',
    appliedAt: daysFromNow(-21, 10, 0),
    rejectionReason: 'Did not clear the technical round cutoff score.',
    schedule: [
      { stage: 'Applied', date: daysFromNow(-21, 10, 0) },
      {
        stage: 'OA',
        date: daysFromNow(-18, 10, 0),
        feedback: 'Scored 52/100. Below the 60 cutoff.',
      },
      { stage: 'Tech_1', date: daysFromNow(-15, 10, 0) },
    ],
  },
  {
    id: 'app-005',
    driveId: 'drv-006',
    studentId: 'stu-001',
    currentStage: 'Tech_1',
    status: 'rejected',
    appliedAt: daysFromNow(-34, 9, 30),
    rejectionReason: 'Profile did not match the required minimum CGPA band for this role.',
    schedule: [
      { stage: 'Applied', date: daysFromNow(-34, 9, 30) },
      { stage: 'OA', date: daysFromNow(-31, 10, 0), feedback: 'Cleared.' },
      { stage: 'Tech_1', date: daysFromNow(-28, 10, 0), feedback: 'Not shortlisted.' },
    ],
  },
];

export function getApplicationForDrive(driveId: string): Application | undefined {
  return DEMO_APPLICATIONS.find((a) => a.driveId === driveId);
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Google OA delayed by 30 minutes',
    message:
      'Due to a network issue at the centre, the Google online assessment has been pushed from 10:00 AM to 10:30 AM. Candidates must now report by 10:15 AM with college ID and a government photo ID. Reporting late will not be permitted.',
    priority: 'urgent',
    targetBranch: 'All Branches',
    postedBy: DEMO_TPO.fullName,
    createdAt: daysFromNow(0, 8, 15),
  },
  {
    id: 'ann-002',
    title: 'Deloitte case study material released',
    message:
      'The case study prompt and preparation guide for the Deloitte consulting analyst drive has been uploaded to the placement portal. Please read it thoroughly before the round.',
    priority: 'high',
    targetBranch: 'All Branches',
    postedBy: DEMO_TPO.fullName,
    createdAt: daysFromNow(-1, 17, 0),
  },
  {
    id: 'ann-003',
    title: 'Placement policy: maximum two offers',
    message:
      'Per the placement policy, every student may hold a maximum of two offers — one core offer and one dream offer. Students holding more than two offers will be asked to withdraw from the additional drives.',
    priority: 'normal',
    targetBranch: 'All Branches',
    postedBy: 'Placement Cell',
    createdAt: daysFromNow(-3, 12, 0),
  },
  {
    id: 'ann-004',
    title: 'Resume submission deadline extended',
    message:
      'The deadline to upload and update your resume on the portal has been extended to 6:00 PM on Saturday. Students whose resumes are not verified will not be allowed to apply to any drive.',
    priority: 'high',
    targetBranch: 'All Branches',
    postedBy: DEMO_COORDINATOR.fullName,
    createdAt: daysFromNow(-2, 15, 30),
  },
  {
    id: 'ann-005',
    title: 'Mock interview drive — Goldman Sachs',
    message:
      'A mock interview session for the Goldman Sachs diversity hiring drive will be conducted on Friday at 2:00 PM in the seminar hall. Registration is open at the placement cell desk.',
    priority: 'normal',
    targetBranch: 'Computer Science & Engineering',
    postedBy: DEMO_COORDINATOR.fullName,
    createdAt: daysFromNow(-4, 11, 0),
  },
];

// ---------------------------------------------------------------------------
// Interview experiences
// ---------------------------------------------------------------------------

export const EXPERIENCES: InterviewExperience[] = [
  {
    id: 'exp-001',
    companyId: 'cmp-001',
    authorName: 'Priya Nair',
    authorBranch: 'Computer Science & Engineering',
    roleOffered: 'Software Development Engineer',
    ctcLpa: 28,
    difficulty: 'Hard',
    rounds: [
      {
        name: 'OA',
        experience:
          'Three coding problems in 90 minutes on HackerRank. Difficulty was equivalent to LeetCode Medium, Medium and Hard. Topics: trees, dynamic programming and sliding window.',
      },
      {
        name: 'Tech Round 1',
        experience:
          'Data structures deep dive. They asked me to implement a LRU cache from scratch and then optimise it. Followed by complexity analysis on every solution.',
      },
      {
        name: 'Tech Round 2',
        experience:
          'System design for a URL shortener, scaled to 100 million requests per day. They cared much more about how you clarify requirements than about the final design.',
      },
      {
        name: 'HR',
        experience:
          'Two behavioural rounds. One about a time you disagreed with a teammate, one about your biggest project. Keep answers structured and specific.',
      },
    ],
    topicsAsked: ['LRU Cache', 'System Design', 'DP', 'Sliding Window', 'Graphs'],
    tipsForJuniors:
      'Practise explaining your thought process out loud before you write code. Two of my four rounds failed purely because I stayed silent while thinking. Also, revise SQL — it came up twice and I was weak there.',
    upvotes: 142,
    createdAt: daysFromNow(-28, 12, 0),
  },
  {
    id: 'exp-002',
    companyId: 'cmp-002',
    authorName: 'Aman Gupta',
    authorBranch: 'Information Technology',
    roleOffered: 'Software Engineer II',
    ctcLpa: 24.5,
    difficulty: 'Medium',
    rounds: [
      {
        name: 'OA',
        experience:
          'Coding assessment on HackerRank. Three problems, array and string manipulation heavy. 120 minutes.',
      },
      {
        name: 'Technical Interview',
        experience:
          'Two rounds back to back with a 15 minute break. Round one on data structures, round two on web fundamentals and asynchronous JavaScript.',
      },
      {
        name: 'HR',
        experience:
          'Short and friendly. Mostly about why Microsoft and what I want to build.',
      },
    ],
    topicsAsked: ['Arrays', 'Strings', 'Async JS', 'React', 'Closures'],
    tipsForJuniors:
      'Be honest about what you do not know. They value honesty and it saved me in the second technical round when I was asked about Kubernetes.',
    upvotes: 96,
    createdAt: daysFromNow(-20, 10, 30),
  },
  {
    id: 'exp-003',
    companyId: 'cmp-005',
    authorName: 'Neha Sharma',
    authorBranch: 'Electronics & Communication',
    roleOffered: 'Consulting Analyst',
    ctcLpa: 9.4,
    difficulty: 'Easy',
    rounds: [
      {
        name: 'Aptitude Test',
        experience:
          'Verbal, quantitative and logical reasoning. Cut-off was around 55 percent. Very doable with regular practice.',
      },
      {
        name: 'Case Study',
        experience:
          'Group case study with four candidates. You get 30 minutes to prepare and 10 minutes to present. They evaluate structure far more than the conclusion.',
      },
      {
        name: 'Technical Interview',
        experience:
          'Excel, SQL and basic analytics questions. Nothing deep, but know your joins.',
      },
      { name: 'HR', experience: 'Standard final conversation about relocation and flexibility.' },
    ],
    topicsAsked: ['Excel', 'SQL Joins', 'Business Case', 'Communication'],
    tipsForJuniors:
      'This drive is genuinely open to all branches and a low CGPA. Do not skip it thinking it is beneath you. I know three people from Civil who cracked it.',
    upvotes: 78,
    createdAt: daysFromNow(-15, 14, 0),
  },
  {
    id: 'exp-004',
    companyId: 'cmp-003',
    authorName: 'Vikram Singh',
    authorBranch: 'Computer Science & Engineering',
    roleOffered: 'Software Development Intern',
    ctcLpa: 12.9,
    difficulty: 'Medium',
    rounds: [
      {
        name: 'OA',
        experience: 'DSA screening. Two problems in 90 minutes. Graphs and dynamic programming.',
      },
      {
        name: 'Technical Interview',
        experience:
          'Pair programming round. They shared an editor and watched me code. I was nervous and typed slowly, but they said it does not matter.',
      },
      {
        name: 'Managerial Round',
        experience:
          'Discussion about internship goals and availability. Mostly a fit check.',
      },
    ],
    topicsAsked: ['Graphs', 'DP', 'Debugging', 'REST APIs'],
    tipsForJuniors:
      'Type your code aloud and narrate your debugging. Interns who narrate are hired far more often than those who silently struggle.',
    upvotes: 64,
    createdAt: daysFromNow(-11, 11, 0),
  },
  {
    id: 'exp-005',
    companyId: 'cmp-008',
    authorName: 'Sneha Patel',
    authorBranch: 'Information Technology',
    roleOffered: 'Software Developer',
    ctcLpa: 6.5,
    difficulty: 'Easy',
    rounds: [
      {
        name: 'OA',
        experience: 'Basic coding and logical reasoning. Very straightforward if you know the fundamentals.',
      },
      {
        name: 'Technical Interview',
        experience: 'Programming fundamentals and a discussion of my final year project.',
      },
      { name: 'HR', experience: 'Culture fit and salary expectation discussion.' },
    ],
    topicsAsked: ['OOP', 'SQL', 'Projects', 'Java Basics'],
    tipsForJuniors:
      'Be ready to explain your college project in depth. They asked me fifteen minutes of questions about a single project and that decided the outcome.',
    upvotes: 52,
    createdAt: daysFromNow(-9, 16, 0),
  },
  {
    id: 'exp-006',
    companyId: 'cmp-009',
    authorName: 'Ananya Deshmukh',
    authorBranch: 'Computer Science & Engineering',
    roleOffered: 'Technology Analyst',
    ctcLpa: 15,
    difficulty: 'Hard',
    rounds: [
      {
        name: 'Online Assessment',
        experience:
          'Technical coding plus a heavy quant section. Quant was harder than the coding for me.',
      },
      {
        name: 'Tech Round 1',
        experience: 'Advanced algorithms. Binary trees, amortised analysis, and a graph optimisation puzzle.',
      },
      {
        name: 'Tech Round 2',
        experience: 'Finance and markets concepts combined with a technical case. Very different from a normal tech interview.',
      },
      { name: 'HR', experience: 'Values-based and behavioural, with a strong emphasis on collaboration.' },
    ],
    topicsAsked: ['Binary Trees', 'Amortised Analysis', 'Probability', 'Market Microstructure'],
    tipsForJuniors:
      'Prepare separately for the quant section — most of us ignored it. Their cut-off is aggressive and many technically strong candidates were screened out.',
    upvotes: 47,
    createdAt: daysFromNow(-6, 13, 0),
  },
];

// ---------------------------------------------------------------------------
// TPO directory + analytics
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  'Aarav', 'Diya', 'Kabir', 'Ishita', 'Rohan', 'Meera', 'Aditya', 'Sanjana',
  'Nikhil', 'Pooja', 'Karan', 'Ritika', 'Siddharth', 'Ananya', 'Harsh', 'Divya',
  'Manav', 'Shreya', 'Yash', 'Aditi', 'Rahul', 'Neha', 'Varun', 'Sneha',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Yadav', 'Prasad', 'Chauhan', 'Rathore',
  'Dubey', 'Joshi', 'Mishra', 'Tiwari', 'Agarwal', 'Bansal', 'Chauhan', 'Rao',
];

const EXTRA_SKILLS = [
  'Java', 'Python', 'SQL', 'DSA', 'React', 'Node.js', 'AWS', 'Docker',
  'Machine Learning', 'Figma', 'C++', 'MongoDB', 'GraphQL', 'Power BI',
];

/** Builds a realistic student directory for the TPO applicant tables. */
export function buildDirectory(count = 60): StudentProfile[] {
  const students: StudentProfile[] = [DEMO_STUDENT];
  for (let i = 1; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const branch = BRANCHES[i % BRANCHES.length];
    const cgpa = Math.round((5.4 + ((i * 37) % 44) / 10) * 100) / 100;
    const backlogs = i % 11 === 0 ? 2 : i % 5 === 0 ? 1 : 0;
    students.push({
      id: `stu-${String(i + 1).padStart(3, '0')}`,
      userId: `usr-${String(i + 1).padStart(3, '0')}`,
      fullName: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@dhsgu.edu.in`,
      phone: `+91 9${String(100000000 + i * 137).slice(0, 9)}`,
      rollNumber: `${branch.slice(0, 2).toUpperCase()}${22 + (i % 3)}${String(i).padStart(4, '0')}`,
      branch,
      cgpa: Math.min(cgpa, 9.85),
      tenthPercentage: 60 + ((i * 13) % 38),
      twelfthPercentage: 62 + ((i * 17) % 36),
      activeBacklogs: backlogs,
      totalBacklogHistory: backlogs + (i % 4),
      gender: i % 3 === 0 ? 'female' : i % 7 === 0 ? 'other' : 'male',
      skills: EXTRA_SKILLS.slice(i % 4, i % 4 + 4),
      resumeName: `${first}_${last}_Resume.pdf`,
      hasAcceptedOffer: false,
    });
  }
  return students;
}

export const DIRECTORY: StudentProfile[] = buildDirectory(60);

function stageForIndex(i: number): { stage: Application['currentStage']; status: Application['status'] } {
  const table: { stage: Application['currentStage']; status: Application['status'] }[] = [
    { stage: 'Applied', status: 'in_progress' },
    { stage: 'OA', status: 'in_progress' },
    { stage: 'OA', status: 'rejected' },
    { stage: 'Tech_1', status: 'in_progress' },
    { stage: 'Tech_2', status: 'shortlisted' },
    { stage: 'HR', status: 'shortlisted' },
    { stage: 'Selected', status: 'offered' },
    { stage: 'Tech_1', status: 'rejected' },
  ];
  return table[i % table.length];
}

/** Builds the applicant table for a given drive, including eligibility filtering. */
export function buildApplicants(driveId: string): ApplicantRow[] {
  const drive = getDrive(driveId);
  if (!drive) return [];
  const rows: ApplicantRow[] = [];
  const count = drive.ctcLpa >= 12 ? 24 : 40;
  for (let i = 0; i < count && i < DIRECTORY.length; i++) {
    const s = DIRECTORY[i];
    const { stage, status } = stageForIndex(i);
    rows.push({
      studentId: s.id,
      name: s.fullName,
      rollNumber: s.rollNumber,
      email: s.email,
      phone: s.phone,
      branch: s.branch,
      cgpa: s.cgpa,
      gender: s.gender,
      activeBacklogs: s.activeBacklogs,
      resumeName: s.resumeName,
      stage,
      status,
    });
  }
  return rows;
}

export const ANALYTICS: PlacementStats = {
  totalStudents: 480,
  placedStudents: 352,
  placementPercentage: 73.3,
  averageCtc: 9.42,
  highestCtc: 32,
  activeDrives: DRIVES.filter((d) => d.status === 'open').length,
  totalOffers: 397,
  branchWise: [
    { branch: 'Computer Science & Engineering', placed: 68, total: 72, percentage: 94.4 },
    { branch: 'Information Technology', placed: 64, total: 72, percentage: 88.9 },
    { branch: 'Electronics & Communication', placed: 58, total: 72, percentage: 80.6 },
    { branch: 'Mechanical Engineering', placed: 51, total: 72, percentage: 70.8 },
    { branch: 'Civil Engineering', placed: 44, total: 72, percentage: 61.1 },
    { branch: 'Electrical Engineering', placed: 39, total: 72, percentage: 54.2 },
    { branch: 'Mechanical & Production', placed: 17, total: 38, percentage: 44.7 },
    { branch: 'Biotechnology', placed: 11, total: 20, percentage: 55.0 },
  ],
  ctcDistribution: [
    { range: '> 20 LPA', count: 22 },
    { range: '12 – 20 LPA', count: 58 },
    { range: '6 – 12 LPA', count: 124 },
    { range: '3.5 – 6 LPA', count: 149 },
    { range: '< 3.5 LPA', count: 44 },
  ],
};

export { NOW };
