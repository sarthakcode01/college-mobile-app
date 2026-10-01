/**
 * Application state for the demo build.
 * React Context only (per the chosen stack). Everything lives in memory;
 * switching this to API calls later means replacing the bodies of the
 * mutators, not the consumers.
 */

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import {
    ANNOUNCEMENTS,
    DEMO_APPLICATIONS,
    DEMO_COORDINATOR,
    DEMO_STUDENT,
    DEMO_TPO,
    getDrive,
} from '@/lib/demo-data';
import { DEFAULT_POLICY, evaluateForDrive } from '@/lib/eligibility';
import type {
    Announcement,
    AnnouncementPriority,
    Application,
    ApplicationStage,
    PlacementDrive,
    Role,
    StudentProfile,
} from '@/lib/types';

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  designation?: string;
};

type Store = {
  user: SessionUser | null;
  student: StudentProfile;
  applications: Application[];
  drives: PlacementDrive[];
  announcements: Announcement[];
  experiencesUpvotes: Record<string, boolean>;

  signIn: (role: Role) => void;
  signOut: () => void;

  applyToDrive: (driveId: string) => { ok: boolean; message: string };
  withdrawFromDrive: (driveId: string) => void;

  advanceApplication: (driveId: string, stage: ApplicationStage) => void;
  rejectApplication: (driveId: string, reason: string) => void;

  updateProfile: (patch: Partial<StudentProfile>) => void;

  createDrive: (drive: PlacementDrive) => void;
  updateDrive: (driveId: string, patch: Partial<PlacementDrive>) => void;
  setDriveStatus: (driveId: string, status: PlacementDrive['status']) => void;
  bulkAdvance: (driveId: string, studentIds: string[], stage: ApplicationStage) => void;

  postAnnouncement: (input: {
    title: string;
    message: string;
    priority: AnnouncementPriority;
    targetBranch: string;
  }) => void;
  deleteAnnouncement: (id: string) => void;

  toggleExperienceUpvote: (id: string) => void;
};

const StoreContext = createContext<Store | null>(null);

const SESSION_BY_ROLE: Record<Role, SessionUser> = {
  student: {
    id: DEMO_STUDENT.userId,
    fullName: DEMO_STUDENT.fullName,
    email: DEMO_STUDENT.email,
    role: 'student',
    designation: 'B.Tech CSE · 2027',
  },
  tpo: {
    id: DEMO_TPO.id,
    fullName: DEMO_TPO.fullName,
    email: DEMO_TPO.email,
    role: 'tpo',
    designation: DEMO_TPO.designation,
  },
  coordinator: {
    id: DEMO_COORDINATOR.id,
    fullName: DEMO_COORDINATOR.fullName,
    email: DEMO_COORDINATOR.email,
    role: 'coordinator',
    designation: DEMO_COORDINATOR.designation,
  },
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [student, setStudent] = useState<StudentProfile>(DEMO_STUDENT);
  const [applications, setApplications] = useState<Application[]>(DEMO_APPLICATIONS);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [experiencesUpvotes, setExperiencesUpvotes] = useState<Record<string, boolean>>({});

  const signIn = useCallback((role: Role) => {
    setUser(SESSION_BY_ROLE[role]);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const applyToDrive = useCallback<Store['applyToDrive']>(
    (driveId) => {
      const drive = getDrive(driveId);
      if (!drive) return { ok: false, message: 'Drive not found.' };

      const verdict = evaluateForDrive(student, drive, DEFAULT_POLICY);
      if (!verdict.isEligible) {
        return {
          ok: false,
          message: `You do not meet the criteria: ${verdict.failures.join(', ')}.`,
        };
      }

      const existing = applications.find((a) => a.driveId === driveId);
      if (existing && existing.status !== 'rejected') {
        return { ok: false, message: 'You have already applied to this drive.' };
      }

      const now = new Date().toISOString();
      if (existing) {
        // Re-apply after an earlier rejection.
        setApplications((prev) =>
          prev.map((a) =>
            a.driveId === driveId
              ? {
                  ...a,
                  currentStage: 'Applied',
                  status: 'in_progress',
                  appliedAt: now,
                  rejectionReason: undefined,
                  schedule: [{ stage: 'Applied', date: now, feedback: 'Re-applied.' }],
                }
              : a,
          ),
        );
      } else {
        const newApp: Application = {
          id: `app-${Date.now()}`,
          driveId,
          studentId: student.id,
          currentStage: 'Applied',
          status: 'in_progress',
          appliedAt: now,
          schedule: [
            {
              stage: 'Applied',
              date: now,
              feedback: 'Application submitted to the placement cell.',
            },
          ],
        };
        setApplications((prev) => [newApp, ...prev]);
      }

      return { ok: true, message: `Applied to ${drive.jobTitle}.` };
    },
    [applications, student],
  );

  const withdrawFromDrive = useCallback((driveId: string) => {
    setApplications((prev) => prev.filter((a) => a.driveId !== driveId));
  }, []);

  const advanceApplication = useCallback((driveId: string, stage: ApplicationStage) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.driveId !== driveId) return a;
        const now = new Date().toISOString();
        const has = a.schedule.some((s) => s.stage === stage);
        return {
          ...a,
          currentStage: stage,
          status: stage === 'Selected' ? 'offered' : 'shortlisted',
          schedule: has
            ? a.schedule.map((s) => (s.stage === stage ? { ...s, date: now } : s))
            : [...a.schedule, { stage, date: now }],
        };
      }),
    );
  }, []);

  const rejectApplication = useCallback((driveId: string, reason: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.driveId === driveId ? { ...a, status: 'rejected', rejectionReason: reason } : a,
      ),
    );
  }, []);

  const updateProfile = useCallback((patch: Partial<StudentProfile>) => {
    setStudent((prev) => ({ ...prev, ...patch }));
  }, []);

  const createDrive = useCallback((drive: PlacementDrive) => {
    setDrives((prev) => [drive, ...prev]);
  }, []);

  const updateDrive = useCallback((driveId: string, patch: Partial<PlacementDrive>) => {
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, ...patch } : d)),
    );
  }, []);

  const setDriveStatus = useCallback(
    (driveId: string, status: PlacementDrive['status']) => {
      updateDrive(driveId, { status });
    },
    [updateDrive],
  );

  const bulkAdvance = useCallback<Store['bulkAdvance']>((driveId, studentIds, stage) => {
    const now = new Date().toISOString();
    setApplications((prev) =>
      prev.map((a) => {
        if (a.driveId !== driveId || !studentIds.includes(a.studentId)) return a;
        return {
          ...a,
          currentStage: stage,
          status: stage === 'Selected' ? 'offered' : 'shortlisted',
          schedule: [...a.schedule.filter((s) => s.stage !== stage), { stage, date: now }],
        };
      }),
    );
  }, []);

  const postAnnouncement = useCallback<Store['postAnnouncement']>((input) => {
    setAnnouncements((prev) => [
      {
        id: `ann-${Date.now()}`,
        ...input,
        postedBy: user?.fullName ?? 'Placement Cell',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, [user]);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleExperienceUpvote = useCallback((id: string) => {
    setExperiencesUpvotes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      user,
      student,
      applications,
      drives,
      announcements,
      experiencesUpvotes,
      signIn,
      signOut,
      applyToDrive,
      withdrawFromDrive,
      advanceApplication,
      rejectApplication,
      updateProfile,
      createDrive,
      updateDrive,
      setDriveStatus,
      bulkAdvance,
      postAnnouncement,
      deleteAnnouncement,
      toggleExperienceUpvote,
    }),
    [
      user, student, applications, drives, announcements, experiencesUpvotes,
      signIn, signOut, applyToDrive, withdrawFromDrive, advanceApplication,
      rejectApplication, updateProfile, createDrive, updateDrive, setDriveStatus,
      bulkAdvance, postAnnouncement, deleteAnnouncement, toggleExperienceUpvote,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>.');
  return ctx;
}