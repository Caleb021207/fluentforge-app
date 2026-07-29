/**
 * Rostering provider interface.
 *
 * NOTHING here talks to a real provider yet. These are declared stubs behind a
 * stable interface so Clever / Google Classroom / OneRoster can be wired later
 * without touching the classroom UI. Every provider reports
 * `configured: false` and `sync()` rejects — the UI must show them as
 * "not connected" rather than pretending a sync happened.
 */

export type RosterProviderId = "clever" | "google_classroom" | "oneroster";

export interface RosterClass {
  externalId: string;
  name: string;
  period?: string | null;
  gradeLevel?: string | null;
  teacherExternalIds: string[];
}

export interface RosterStudent {
  externalId: string;
  email: string | null;
  displayName: string;
  gradeLevel?: string | null;
  classExternalIds: string[];
}

export interface RosterSnapshot {
  classes: RosterClass[];
  students: RosterStudent[];
  fetchedAt: string;
}

export interface RosterSyncResult {
  provider: RosterProviderId;
  classesCreated: number;
  studentsLinked: number;
  skipped: number;
  warnings: string[];
}

export class RosterNotConfiguredError extends Error {
  constructor(public provider: RosterProviderId) {
    super(
      `The ${provider} rostering integration is not configured yet. ` +
        `Credentials and the provider API client still need to be wired.`,
    );
    this.name = "RosterNotConfiguredError";
  }
}

export interface RosterProvider {
  id: RosterProviderId;
  label: string;
  docsUrl: string;
  /** Credentials/API client wired? Always false until a provider is implemented. */
  configured: boolean;
  /** What still has to happen before this provider can go live. */
  pendingWork: string[];
  fetchSnapshot(): Promise<RosterSnapshot>;
  sync(schoolId: string): Promise<RosterSyncResult>;
}
