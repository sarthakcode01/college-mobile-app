/**
 * CSV export for the TPO applicant list.
 *
 * Implemented by hand rather than with a library: the output is a plain
 * comma-separated file, and this avoids pulling in a heavy dependency.
 */

import { Platform, Share } from 'react-native';

import type { ApplicantRow } from '@/lib/types';

/** Escapes a single CSV cell: quotes, commas, newlines. */
function escapeCell(value: string | number | undefined): string {
  const s = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: ApplicantRow[], columns?: (keyof ApplicantRow)[]): string {
  const cols = columns ?? (Object.keys(rows[0] ?? {}) as (keyof ApplicantRow)[]);

  const header = cols.map((c) => escapeCell(COLUMN_LABELS[c] ?? c)).join(',');

  const body = rows
    .map((row) => cols.map((c) => escapeCell(row[c] as string | number | undefined)).join(','))
    .join('\n');

  // BOM keeps Excel from mangling UTF-8 characters such as the ₹ symbol.
  return `${header}\n${body}`;
}

const COLUMN_LABELS: Partial<Record<keyof ApplicantRow, string>> = {
  rollNumber: 'Roll Number',
  name: 'Student Name',
  email: 'Email',
  phone: 'Phone',
  branch: 'Branch',
  cgpa: 'CGPA',
  gender: 'Gender',
  activeBacklogs: 'Active Backlogs',
  resumeName: 'Resume File',
  stage: 'Current Stage',
  status: 'Status',
  studentId: 'Student ID',
};

export type ExportResult =
  | { ok: true; fileName: string; rowCount: number; method: 'share' | 'downloaded' }
  | { ok: false; reason: string };

/**
 * Writes the CSV to a cache file and opens the native share sheet so the TPO
 * can send it to company HR over WhatsApp, email or Drive.
 */
export async function exportApplicantsToCsv(
  rows: ApplicantRow[],
  fileNameHint = 'applicants',
): Promise<ExportResult> {
  if (rows.length === 0) {
    return { ok: false, reason: 'There are no applicants to export with the current filters.' };
  }

  try {
    const csv = toCsv(rows);
    const stamp = new Date().toISOString().slice(0, 10);
    const fileName = `${fileNameHint}_${stamp}.csv`;

    const FileSystem = await import('expo-file-system');
    const Sharing = await import('expo-sharing');

    const FS = FileSystem as unknown as {
      cacheDirectory?: string;
      writeAsStringAsync?: (uri: string, contents: string, opts?: { encoding?: string }) => Promise<void>;
      EncodingType?: { UTF8: string };
      getInfoAsync?: (uri: string) => Promise<{ exists: boolean }>;
    };

    const directory = FS.cacheDirectory;
    const uri = directory ? `${directory}${fileName}` : fileName;

    if (FS.writeAsStringAsync) {
      await FS.writeAsStringAsync(uri, csv, {
        encoding: (FS.EncodingType?.UTF8 ?? 'utf8') as 'utf8',
      });

      const canShare = await Sharing.isAvailableAsync().catch(() => false);
      if (canShare && Platform.OS !== 'web') {
        await Sharing.shareAsync(uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export applicant list',
          UTI: 'public.comma-separated-values-text',
        });
        return { ok: true, fileName, rowCount: rows.length, method: 'share' };
      }
    }

    // Web (or share unavailable): fall back to a plain text share.
    await Share.share({
      title: fileName,
      message: csv,
    });
    return { ok: true, fileName, rowCount: rows.length, method: 'downloaded' };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Export failed unexpectedly.',
    };
  }
}

/** Builds a summary line suitable for a broadcast message. */
export function summariseApplicants(rows: ApplicantRow[]): string {
  const byBranch = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.branch] = (acc[r.branch] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(byBranch)
    .sort((a, b) => b[1] - a[1])
    .map(([branch, count]) => `${branch}: ${count}`)
    .join('\n');
}