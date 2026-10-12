import { useSyncExternalStore } from "react";

export type TournamentStatus = "Registration open" | "Coming soon" | "Live" | "Completed";

export type TournamentMatch = {
  id: string;
  sport?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  completed: boolean;
};

export type Person = {
  id: string;
  name: string;
  role: string;
};

export type TournamentParticipant = {
  id: string;
  name: string;
  personId?: string;
  teamName?: string;
};

export type PlacementPoint = {
  place: string;
  points: number;
};

export type TournamentStage = {
  id: string;
  name: string;
  type: "GROUP" | "KNOCKOUT";
  participants: string[];
  groups: { id: string; name: string; teamNames: string[] }[];
  rounds: { id: string; name: string; teamNames: string[] }[];
  points: { teamName: string; points: number }[];
};

export type TournamentEvent = {
  id: string;
  name: string;
  points: PlacementPoint[];
  stages: TournamentStage[];
};

export type TournamentCategory = {
  id: string;
  name: string;
  events: TournamentEvent[];
};

export type TournamentActivity = {
  id: string;
  sport: string;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  categories: TournamentCategory[];
};

export type Tournament = {
  id: string;
  name: string;
  sport: string;
  format: string;
  teams: number;
  date: string;
  status: TournamentStatus;
  teamNames?: string[];
  matches?: TournamentMatch[];
  organizationName?: string;
  organizationPeople?: Person[];
  participants?: TournamentParticipant[];
  activities?: TournamentActivity[];
  placementPoints?: PlacementPoint[];
};

export const TOURNAMENT_STORAGE_KEY = "utms-created-tournaments";
const TOURNAMENTS_UPDATED_EVENT = "utms:tournaments-updated";

export const sampleTournaments: Tournament[] = [
  {
    id: "island-premier-league",
    name: "Island Premier League",
    sport: "Cricket",
    format: "T20 • League",
    teams: 10,
    date: "Oct 28, 2026",
    status: "Registration open",
  },
  {
    id: "colombo-night-series",
    name: "Colombo Night Series",
    sport: "Football",
    format: "5-a-side • Knockout",
    teams: 16,
    date: "Nov 02, 2026",
    status: "Registration open",
  },
  {
    id: "campus-hoops-cup",
    name: "Campus Hoops Cup",
    sport: "Basketball",
    format: "3x3 • Groups + finals",
    teams: 12,
    date: "Nov 14, 2026",
    status: "Coming soon",
  },
  {
    id: "sl-pakistan-odi-series",
    name: "Sri Lanka vs Pakistan",
    sport: "Cricket",
    format: "ODI • 3-match series",
    teams: 2,
    date: "Series centre",
    status: "Live",
    teamNames: ["Sri Lanka", "Pakistan"],
  },
];

export type TeamHistory = {
  team: string;
  sport: string;
  played: number;
  wins: number;
  recentForm: ("W" | "L" | "D")[];
  scores: number[];
};

export const sampleTeamHistory: TeamHistory[] = [
  {
    team: "Sri Lanka",
    sport: "Cricket",
    played: 10,
    wins: 6,
    recentForm: ["W", "W", "L", "W", "W"],
    scores: [286, 248, 301, 223, 274],
  },
  {
    team: "Pakistan",
    sport: "Cricket",
    played: 10,
    wins: 5,
    recentForm: ["W", "L", "W", "L", "W"],
    scores: [281, 294, 239, 312, 260],
  },
  {
    team: "Colombo Strikers",
    sport: "Football",
    played: 8,
    wins: 6,
    recentForm: ["W", "W", "W", "L", "W"],
    scores: [3, 2, 4, 1, 2],
  },
  {
    team: "Galle United",
    sport: "Football",
    played: 8,
    wins: 4,
    recentForm: ["L", "W", "W", "L", "W"],
    scores: [1, 2, 2, 0, 3],
  },
  {
    team: "Kandy Falcons",
    sport: "Basketball",
    played: 9,
    wins: 7,
    recentForm: ["W", "W", "W", "L", "W"],
    scores: [82, 76, 91, 68, 88],
  },
  {
    team: "Jaffna Kings",
    sport: "Basketball",
    played: 9,
    wins: 5,
    recentForm: ["W", "L", "W", "W", "L"],
    scores: [74, 69, 80, 85, 72],
  },
];

export type SeriesMatch = {
  number: number;
  date: string;
  venue: string;
  status: "Completed" | "Live" | "Upcoming";
  sriLankaScore?: string;
  pakistanScore?: string;
  result?: string;
  note?: string;
};

export const sampleSeriesMatches: SeriesMatch[] = [
  {
    number: 1,
    date: "Oct 10, 2026",
    venue: "R. Premadasa Stadium, Colombo",
    status: "Completed",
    sriLankaScore: "286/6 (48.2)",
    pakistanScore: "281/8 (50)",
    result: "Sri Lanka won by 4 wickets",
    note: "N. Perera 82 · S. Afridi 3/54",
  },
  {
    number: 2,
    date: "Oct 12, 2026",
    venue: "Pallekele International Stadium",
    status: "Live",
    sriLankaScore: "176/5 (35.4)",
    pakistanScore: "269/8 (50)",
    note: "Sri Lanka need 94 from 86 balls",
  },
  {
    number: 3,
    date: "Oct 15, 2026",
    venue: "R. Premadasa Stadium, Colombo",
    status: "Upcoming",
  },
];

export function getWinProbability(
  first: TeamHistory,
  second: TeamHistory,
  firstHeadToHeadWins: number,
  headToHeadPlayed: number,
  headToHeadDraws = 0,
) {
  const firstFormWins = first.recentForm.reduce(
    (points, result) => points + (result === "W" ? 1 : result === "D" ? 0.5 : 0),
    0,
  );
  const secondFormWins = second.recentForm.reduce(
    (points, result) => points + (result === "W" ? 1 : result === "D" ? 0.5 : 0),
    0,
  );
  const firstStrength =
    0.45 * ((first.wins + 1) / (first.played + 2)) +
    0.35 * ((firstFormWins + 1) / (first.recentForm.length + 2)) +
    0.2 * ((firstHeadToHeadWins + headToHeadDraws / 2 + 1) / (headToHeadPlayed + 2));
  const secondStrength =
    0.45 * ((second.wins + 1) / (second.played + 2)) +
    0.35 * ((secondFormWins + 1) / (second.recentForm.length + 2)) +
    0.2 * ((headToHeadPlayed - firstHeadToHeadWins - headToHeadDraws / 2 + 1) / (headToHeadPlayed + 2));
  const firstPercentage = Math.round((firstStrength / (firstStrength + secondStrength)) * 100);

  return { first: firstPercentage, second: 100 - firstPercentage };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlacementPoint(value: unknown): value is PlacementPoint {
  return isRecord(value) && typeof value.place === "string" && typeof value.points === "number";
}

function isNamedTeamList(value: unknown): value is { id: string; name: string; teamNames: string[] } {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.teamNames) &&
    value.teamNames.every((team: unknown) => typeof team === "string");
}

function isTournamentStage(value: unknown): value is TournamentStage {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.type === "GROUP" || value.type === "KNOCKOUT") &&
    Array.isArray(value.participants) &&
    value.participants.every((team: unknown) => typeof team === "string") &&
    Array.isArray(value.groups) &&
    value.groups.every(isNamedTeamList) &&
    Array.isArray(value.rounds) &&
    value.rounds.every(isNamedTeamList) &&
    Array.isArray(value.points) &&
    value.points.every((point: unknown) => isRecord(point) && typeof point.teamName === "string" && typeof point.points === "number");
}

function isTournamentEvent(value: unknown): value is TournamentEvent {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.points) &&
    value.points.every(isPlacementPoint) &&
    Array.isArray(value.stages) &&
    value.stages.every(isTournamentStage);
}

function isTournamentCategory(value: unknown): value is TournamentCategory {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.events) &&
    value.events.every(isTournamentEvent);
}

function isTournamentActivity(value: unknown): value is TournamentActivity {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.sport === "string" &&
    typeof value.winPoints === "number" &&
    typeof value.drawPoints === "number" &&
    typeof value.lossPoints === "number" &&
    Array.isArray(value.categories) &&
    value.categories.every(isTournamentCategory);
}

function isTournament(value: unknown): value is Tournament {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.sport === "string" &&
    typeof value.format === "string" &&
    typeof value.teams === "number" &&
    typeof value.date === "string" &&
    (value.status === "Registration open" ||
      value.status === "Coming soon" ||
      value.status === "Live" ||
      value.status === "Completed") &&
    (!("organizationName" in value) || typeof value.organizationName === "string") &&
    (!("organizationPeople" in value) ||
      (Array.isArray(value.organizationPeople) &&
        value.organizationPeople.every(
          (person: unknown) =>
            isRecord(person) &&
            typeof person.id === "string" &&
            typeof person.name === "string" &&
            typeof person.role === "string",
        ))) &&
    (!("participants" in value) ||
      (Array.isArray(value.participants) &&
        value.participants.every(
          (participant: unknown) =>
            isRecord(participant) &&
            typeof participant.id === "string" &&
            typeof participant.name === "string" &&
            (!("personId" in participant) || typeof participant.personId === "string") &&
            (!("teamName" in participant) || typeof participant.teamName === "string"),
        ))) &&
    (!("teamNames" in value) ||
      (Array.isArray(value.teamNames) && value.teamNames.every((team: unknown) => typeof team === "string"))) &&
    (!("activities" in value) ||
      (Array.isArray(value.activities) && value.activities.every(isTournamentActivity))) &&
    (!("placementPoints" in value) ||
      (Array.isArray(value.placementPoints) && value.placementPoints.every(isPlacementPoint))) &&
    (!("matches" in value) ||
      (Array.isArray(value.matches) &&
        value.matches.every(
          (match: unknown) =>
            isRecord(match) &&
            typeof match.id === "string" &&
            (!("sport" in match) || typeof match.sport === "string") &&
            typeof match.homeTeam === "string" &&
            typeof match.awayTeam === "string" &&
            typeof match.completed === "boolean" &&
            (!("homeScore" in match) || typeof match.homeScore === "number") &&
            (!("awayScore" in match) || typeof match.awayScore === "number"),
        )));
}

function parseTournaments(stored: string): Tournament[] {
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error("Stored tournaments must be an array.");
    if (!parsed.every(isTournament)) throw new Error("Saved tournament data has an invalid structure.");
    return parsed;
  } catch (error) {
    console.error("Unable to read saved tournaments.", error);
    return [];
  }
}

function subscribeToTournaments(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(TOURNAMENTS_UPDATED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(TOURNAMENTS_UPDATED_EVENT, onChange);
  };
}

function getTournamentsSnapshot() {
  return window.localStorage.getItem(TOURNAMENT_STORAGE_KEY) ?? "[]";
}

function getServerTournamentsSnapshot() {
  return "[]";
}

export function useCreatedTournaments() {
  const stored = useSyncExternalStore(
    subscribeToTournaments,
    getTournamentsSnapshot,
    getServerTournamentsSnapshot,
  );
  return parseTournaments(stored);
}

export function readCreatedTournaments() {
  return parseTournaments(getTournamentsSnapshot());
}

export function saveCreatedTournaments(tournaments: Tournament[]) {
  window.localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournaments));
  window.dispatchEvent(new Event(TOURNAMENTS_UPDATED_EVENT));
}
