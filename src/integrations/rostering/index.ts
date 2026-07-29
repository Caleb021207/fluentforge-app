import {
  RosterNotConfiguredError,
  type RosterProvider,
  type RosterProviderId,
  type RosterSnapshot,
  type RosterSyncResult,
} from "./types";

/**
 * Declared-but-unimplemented rostering providers.
 *
 * Each provider is intentionally inert: `configured` is false and both calls
 * reject with RosterNotConfiguredError. Do not fake sample rosters here — the
 * classroom UI surfaces these as "not connected" so nobody is sold a feature
 * that does not exist.
 */

function stub(
  id: RosterProviderId,
  label: string,
  docsUrl: string,
  pendingWork: string[],
): RosterProvider {
  return {
    id,
    label,
    docsUrl,
    configured: false,
    pendingWork,
    fetchSnapshot(): Promise<RosterSnapshot> {
      return Promise.reject(new RosterNotConfiguredError(id));
    },
    sync(): Promise<RosterSyncResult> {
      return Promise.reject(new RosterNotConfiguredError(id));
    },
  };
}

export const rosterProviders: RosterProvider[] = [
  stub("clever", "Clever", "https://dev.clever.com/docs", [
    "Register the app and store the Clever client id/secret as backend secrets",
    "Implement the OAuth handshake and /v3.0/sections + /v3.0/users pull",
    "Map Clever sections to classes and users to profiles",
  ]),
  stub("google_classroom", "Google Classroom", "https://developers.google.com/classroom", [
    "Enable the Classroom API and store the OAuth client credentials",
    "Implement domain-wide delegation / teacher consent flow",
    "Map courses to classes and courses.students to enrollments",
  ]),
  stub("oneroster", "OneRoster 1.2", "https://www.1edtech.org/standards/oneroster", [
    "Store the OneRoster base URL plus OAuth2 client credentials",
    "Implement /classes, /students and /enrollments paging",
    "Map orgs to schools and classes to classes",
  ]),
];

export function getRosterProvider(id: RosterProviderId): RosterProvider {
  const provider = rosterProviders.find((p) => p.id === id);
  if (!provider) throw new Error(`Unknown rostering provider: ${id}`);
  return provider;
}

export * from "./types";
