"use client";

import { FormEvent, useState } from "react";
import {
  Activity,
  Award,
  Check,
  CirclePlus,
  Layers3,
  Medal,
  Plus,
  Shield,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import type {
  Tournament,
  TournamentActivity,
  TournamentCategory,
  TournamentEvent,
  TournamentStage,
} from "@/lib/tournaments";
import {
  getWinProbability,
  readCreatedTournaments,
  saveCreatedTournaments,
  type TeamHistory,
} from "@/lib/tournaments";

type WorkspaceProps = {
  tournament: Tournament;
  onUpdate?: (updates: Partial<Tournament>) => void;
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createStage(name: string, type: "GROUP" | "KNOCKOUT", teams: string[]): TournamentStage {
  const id = makeId("stage");
  if (type === "GROUP") {
    const groupCount = Math.max(1, Math.min(teams.length, Math.ceil(teams.length / 4)));
    const groups = Array.from({ length: groupCount }, (_, index) => ({
      id: `${id}-group-${index + 1}`,
      name: `Group ${String.fromCharCode(65 + index)}`,
      teamNames: teams.filter((_, teamIndex) => teamIndex % groupCount === index),
    }));
    return { id, name, type, participants: teams, groups, rounds: [], points: [] };
  }

  const roundCount = Math.ceil(Math.log2(teams.length));
  const rounds = Array.from({ length: roundCount }, (_, index) => {
    const teamCount = 2 ** (roundCount - index);
    const name = teamCount === 2 ? "Final" : teamCount === 4 ? "Semi-finals" : teamCount === 8 ? "Quarter-finals" : `Round of ${teamCount}`;
    return {
      id: `${id}-round-${index + 1}`,
      name,
      teamNames: index === 0 ? teams : [],
    };
  });
  return { id, name, type, participants: teams, groups: [], rounds, points: [] };
}

function createTournamentUpdater({ tournament, onUpdate }: WorkspaceProps) {
  return (updates: Partial<Tournament>) => {
    const saved = readCreatedTournaments();
    const next = saved.map((item) => item.id === tournament.id ? { ...item, ...updates } : item);
    saveCreatedTournaments(next);
    onUpdate?.(updates);
  };
}

export default function TournamentWorkspace({ tournament, onUpdate }: WorkspaceProps) {
  const update = createTournamentUpdater({ tournament, onUpdate });
  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("Organizer");
  const [participantName, setParticipantName] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [sportName, setSportName] = useState("");
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [eventDrafts, setEventDrafts] = useState<Record<string, string>>({});
  const [stageDrafts, setStageDrafts] = useState<Record<string, string>>({});
  const [stageTypes, setStageTypes] = useState<Record<string, "GROUP" | "KNOCKOUT">>({});
  const [stagePointDrafts, setStagePointDrafts] = useState<Record<string, { teamName: string; points: string }>>({});
  const [roundParticipantDrafts, setRoundParticipantDrafts] = useState<Record<string, string>>({});
  const [placementDraft, setPlacementDraft] = useState({ place: "1st place", points: "" });
  const [message, setMessage] = useState("");
  const [predictionSport, setPredictionSport] = useState(tournament.sport);

  const activities = tournament.activities ?? [];
  const participants = tournament.participants ?? [];
  const teams = tournament.teamNames ?? [];
  const completedMatches = (tournament.matches ?? []).filter(
    (match) => (match.sport ?? tournament.sport) === predictionSport && match.completed && match.homeScore !== undefined && match.awayScore !== undefined,
  );
  const teamHistories: TeamHistory[] = teams.map((team) => {
    const playedMatches = completedMatches.filter((match) => match.homeTeam === team || match.awayTeam === team);
    const wins = playedMatches.filter((match) =>
      match.homeTeam === team ? match.homeScore! > match.awayScore! : match.awayScore! > match.homeScore!,
    );
    const recentForm = playedMatches.slice(-5).map((match) => {
      const teamScore = match.homeTeam === team ? match.homeScore! : match.awayScore!;
      const opponentScore = match.homeTeam === team ? match.awayScore! : match.homeScore!;
      return teamScore > opponentScore ? "W" as const : teamScore < opponentScore ? "L" as const : "D" as const;
    });
    return { team, sport: tournament.sport, played: playedMatches.length, wins: wins.length, recentForm, scores: playedMatches.map((match) => match.homeTeam === team ? match.homeScore! : match.awayScore!) };
  });
  const standings = activities.flatMap((activity) => teams.map((team) => {
    const played = (tournament.matches ?? []).filter(
      (match) => (match.sport ?? tournament.sport) === activity.sport && match.completed && match.homeScore !== undefined && match.awayScore !== undefined && (match.homeTeam === team || match.awayTeam === team),
    );
    const wins = played.filter((match) => match.homeTeam === team ? match.homeScore! > match.awayScore! : match.awayScore! > match.homeScore!);
    const draws = played.filter((match) => match.homeScore === match.awayScore);
    const losses = played.length - wins.length - draws.length;
    const points = wins.length * activity.winPoints + draws.length * activity.drawPoints + losses * activity.lossPoints;
    return { team, sport: activity.sport, played: played.length, wins: wins.length, draws: draws.length, losses, points };
  })).sort((first, second) => second.points - first.points || second.wins - first.wins || first.team.localeCompare(second.team));
  const firstHistory = teamHistories[0];
  const secondHistory = teamHistories[1];
  const headToHead = completedMatches.filter((match) =>
    (match.homeTeam === firstHistory?.team && match.awayTeam === secondHistory?.team) ||
    (match.homeTeam === secondHistory?.team && match.awayTeam === firstHistory?.team),
  );
  const firstHeadToHeadWins = headToHead.filter((match) =>
    match.homeTeam === firstHistory?.team ? match.homeScore! > match.awayScore! : match.awayScore! > match.homeScore!,
  ).length;
  const headToHeadDraws = headToHead.filter((match) => match.homeScore === match.awayScore).length;
  const prediction = firstHistory && secondHistory
    ? getWinProbability(firstHistory, secondHistory, firstHeadToHeadWins, headToHead.length, headToHeadDraws)
    : null;

  function updateActivity(activityId: string, transform: (activity: TournamentActivity) => TournamentActivity) {
    update({ activities: activities.map((activity) => activity.id === activityId ? transform(activity) : activity) });
  }

  function updateCategory(activityId: string, categoryId: string, transform: (category: TournamentCategory) => TournamentCategory) {
    updateActivity(activityId, (activity) => ({
      ...activity,
      categories: activity.categories.map((category) => category.id === categoryId ? transform(category) : category),
    }));
  }

  function updateEvent(activityId: string, categoryId: string, eventId: string, transform: (event: TournamentEvent) => TournamentEvent) {
    updateCategory(activityId, categoryId, (category) => ({
      ...category,
      events: category.events.map((event) => event.id === eventId ? transform(event) : event),
    }));
  }

  function addPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = personName.trim();
    if (!name) return;
    update({ organizationPeople: [...(tournament.organizationPeople ?? []), { id: makeId("person"), name, role: personRole }] });
    setPersonName("");
    setMessage(`${name} added to the organization.`);
  }

  function addParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const personId = String(new FormData(event.currentTarget).get("organizationPerson") ?? "");
    const person = (tournament.organizationPeople ?? []).find((item) => item.id === personId);
    const name = person?.name ?? participantName.trim();
    if (!name) return;
    update({ participants: [...participants, { id: makeId("participant"), name, ...(person ? { personId: person.id } : {}) }] });
    setParticipantName("");
    setSelectedPersonId("");
    setMessage(`${name} added to the participant roster.`);
  }

  function assignParticipant(participantId: string, teamName: string) {
    update({
      participants: participants.map((participant) =>
        participant.id === participantId
          ? { ...participant, ...(teamName ? { teamName } : { teamName: undefined }) }
          : participant,
      ),
    });
  }

  function addTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("teamName") ?? "").trim();
    if (!name || teams.some((team) => team.toLowerCase() === name.toLowerCase())) {
      setMessage(name ? "That team has already been added." : "Enter a team name.");
      return;
    }
    if (teams.length >= tournament.teams) {
      setMessage(`The tournament currently has ${tournament.teams} team slots.`);
      return;
    }
    update({ teamNames: [...teams, name] });
    event.currentTarget.reset();
    setMessage(`${name} added.`);
  }

  function generateFixtures() {
    if (teams.length < 2) {
      setMessage("Add at least two teams before generating fixtures.");
      return;
    }
    if (tournament.matches?.length) {
      setMessage("Fixtures have already been created. Add more teams before generating another schedule.");
      return;
    }
    const sports = activities.length ? activities.map((activity) => activity.sport) : [tournament.sport];
    const fixtures: NonNullable<Tournament["matches"]> = [];
    const existingMatches = tournament.matches ?? [];
    for (const sport of sports) {
      if (tournament.format.toLowerCase().includes("knockout")) {
        if (existingMatches.some((match) => (match.sport ?? tournament.sport) === sport)) continue;
        for (let index = 0; index + 1 < teams.length; index += 2) {
          fixtures.push({ id: makeId("match"), sport, homeTeam: teams[index], awayTeam: teams[index + 1], completed: false });
        }
      } else {
        for (let first = 0; first < teams.length; first += 1) {
          for (let second = first + 1; second < teams.length; second += 1) {
            const pairExists = existingMatches.some(
              (match) =>
                (match.sport ?? tournament.sport) === sport &&
                ((match.homeTeam === teams[first] && match.awayTeam === teams[second]) ||
                  (match.homeTeam === teams[second] && match.awayTeam === teams[first])),
            );
            if (!pairExists) fixtures.push({ id: makeId("match"), sport, homeTeam: teams[first], awayTeam: teams[second], completed: false });
          }
        }
      }
    }
    if (!fixtures.length) {
      setMessage("All fixtures are already scheduled. Add a team or sport to extend the schedule.");
      return;
    }
    update({ matches: [...existingMatches, ...fixtures] });
    setMessage(`${fixtures.length} fixtures generated.`);
  }

  function recordResult(matchId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const homeScore = Number(formData.get("homeScore"));
    const awayScore = Number(formData.get("awayScore"));
    if (!Number.isSafeInteger(homeScore) || !Number.isSafeInteger(awayScore) || homeScore < 0 || awayScore < 0) {
      setMessage("Enter whole, non-negative scores for both teams.");
      return;
    }
    const matches = (tournament.matches ?? []).map((match) =>
      match.id === matchId ? { ...match, homeScore, awayScore, completed: true } : match,
    );
    update({ matches });
    setMessage("Result saved. Standings and recent-form prediction updated.");
  }

  function addRoundParticipant(activityId: string, categoryId: string, eventId: string, stage: TournamentStage, roundId: string) {
    const teamName = roundParticipantDrafts[roundId];
    if (!teamName) return;
    updateStage(activityId, categoryId, eventId, stage.id, (current) => ({
      ...current,
      rounds: current.rounds.map((round) =>
        round.id === roundId && !round.teamNames.includes(teamName)
          ? { ...round, teamNames: [...round.teamNames, teamName] }
          : round,
      ),
    }));
    setRoundParticipantDrafts((current) => ({ ...current, [roundId]: "" }));
    setMessage(`${teamName} assigned to the round.`);
  }

  function addSport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sport = sportName.trim();
    if (!sport || activities.some((activity) => activity.sport.toLowerCase() === sport.toLowerCase())) {
      setMessage(sport ? "This sport is already part of the tournament." : "Enter a sport name.");
      return;
    }
    const activityId = makeId("sport");
    const category: TournamentCategory = {
      id: makeId("category"),
      name: "Open",
      events: [{ id: makeId("event"), name: sport === "Cricket" ? "T20" : `${sport} Open`, points: [{ place: "1st place", points: 100 }, { place: "2nd place", points: 70 }, { place: "3rd place", points: 50 }], stages: [] }],
    };
    const activity: TournamentActivity = {
      id: activityId,
      sport,
      winPoints: sport.toLowerCase() === "football" ? 3 : 2,
      drawPoints: sport.toLowerCase() === "football" ? 1 : 1,
      lossPoints: 0,
      categories: [category],
    };
    update({ activities: [...activities, activity] });
    setSportName("");
    setMessage(`${sport} added as a tournament activity.`);
  }

  function addCategory(activityId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = (categoryNames[activityId] ?? "").trim();
    if (!name) return;
    updateActivity(activityId, (activity) => ({
      ...activity,
      categories: [...activity.categories, { id: makeId("category"), name, events: [] }],
    }));
    setCategoryNames((current) => ({ ...current, [activityId]: "" }));
    setMessage(`${name} category added.`);
  }

  function addEvent(activityId: string, categoryId: string) {
    const name = (eventDrafts[categoryId] ?? "").trim();
    if (!name) return;
    const createdEvent: TournamentEvent = {
      id: makeId("event"),
      name,
      points: [{ place: "1st place", points: 100 }, { place: "2nd place", points: 70 }, { place: "3rd place", points: 50 }],
      stages: [],
    };
    updateCategory(activityId, categoryId, (category) => ({ ...category, events: [...category.events, createdEvent] }));
    setEventDrafts((current) => ({ ...current, [categoryId]: "" }));
    setMessage(`${name} event added.`);
  }

  function addStage(activityId: string, categoryId: string, eventItem: TournamentEvent) {
    const name = (stageDrafts[eventItem.id] ?? "").trim();
    if (!name) return;
    const type = stageTypes[eventItem.id] ?? "GROUP";
    const stage = createStage(name, type, teams);
    updateEvent(activityId, categoryId, eventItem.id, (current) => ({ ...current, stages: [...current.stages, stage] }));
    setStageDrafts((current) => ({ ...current, [eventItem.id]: "" }));
    setMessage(`${name} ${type === "GROUP" ? "groups" : "knockout rounds"} created.`);
  }

  function updateStage(activityId: string, categoryId: string, eventId: string, stageId: string, transform: (stage: TournamentStage) => TournamentStage) {
    updateEvent(activityId, categoryId, eventId, (event) => ({
      ...event,
      stages: event.stages.map((stage) => stage.id === stageId ? transform(stage) : stage),
    }));
  }

  function addStagePoints(activityId: string, categoryId: string, eventId: string, stageId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = stagePointDrafts[stageId];
    if (!draft?.teamName || draft.points === "" || !Number.isFinite(Number(draft.points))) return;
    updateStage(activityId, categoryId, eventId, stageId, (stage) => ({
      ...stage,
      points: [...stage.points.filter((item) => item.teamName !== draft.teamName), { teamName: draft.teamName, points: Number(draft.points) }],
    }));
    setStagePointDrafts((current) => ({ ...current, [stageId]: { teamName: "", points: "" } }));
    setMessage("Stage points saved.");
  }

  function addPlacementPoints(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (placementDraft.points === "" || !Number.isFinite(Number(placementDraft.points))) return;
    const points = [...(tournament.placementPoints ?? []).filter((item) => item.place !== placementDraft.place), { place: placementDraft.place, points: Number(placementDraft.points) }];
    update({ placementPoints: points });
    setPlacementDraft({ place: "1st place", points: "" });
    setMessage("Tournament placement points updated.");
  }

  function updateActivityPoints(activityId: string, field: "winPoints" | "drawPoints" | "lossPoints", value: string) {
    const points = Number(value);
    if (!Number.isFinite(points) || points < 0) return;
    updateActivity(activityId, (activity) => ({ ...activity, [field]: points }));
  }

  function updateEventPoints(activityId: string, categoryId: string, eventItem: TournamentEvent, index: number, value: string) {
    const points = Number(value);
    if (!Number.isFinite(points) || points < 0) return;
    updateEvent(activityId, categoryId, eventItem.id, (current) => ({
      ...current,
      points: current.points.map((point, pointIndex) => pointIndex === index ? { ...point, points } : point),
    }));
  }

  return (
    <section className="mt-7 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Organization</p><h2 className="mt-1 text-xl font-black">{tournament.organizationName || "Tournament organization"}</h2><p className="mt-1 text-xs text-stone-500">Organizers, referees, managers and staff.</p></div>
            <Shield className="text-emerald-800" size={20} />
          </div>
          <form onSubmit={(event) => {
            event.preventDefault();
            const name = String(new FormData(event.currentTarget).get("organizationName") ?? "").trim();
            if (name) {
              update({ organizationName: name });
              setMessage("Organization details saved.");
            }
          }} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input name="organizationName" defaultValue={tournament.organizationName} required maxLength={80} aria-label="Organization name" placeholder="Organization name" className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" />
            <button className="rounded-lg border border-stone-300 px-4 py-2.5 text-xs font-bold hover:border-emerald-700">Save organization</button>
          </form>
          <form onSubmit={addPerson} className="mt-4 grid gap-2 sm:grid-cols-[1fr_170px_auto]">
            <input value={personName} onChange={(event) => setPersonName(event.target.value)} required maxLength={60} aria-label="Organization person name" placeholder="Add organizer, referee or staff" className="min-w-0 rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" />
            <select value={personRole} onChange={(event) => setPersonRole(event.target.value)} aria-label="Organization role" className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm">
              {["Organizer", "Referee", "Staff", "Manager", "Coach"].map((role) => <option key={role}>{role}</option>)}
            </select>
            <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#0b352c] px-4 py-2.5 text-xs font-bold text-white"><Plus size={14} /> Add person</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {(tournament.organizationPeople ?? []).map((person) => <span key={person.id} className="rounded-lg bg-stone-100 px-3 py-2 text-xs"><strong>{person.name}</strong><span className="ml-2 text-stone-500">{person.role}</span></span>)}
            {!(tournament.organizationPeople ?? []).length && <p className="text-xs text-stone-400">Add the people who run this organization and tournament.</p>}
          </div>
        </section>

        <section className="rounded-2xl bg-[#e8eddf] p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Tournament points</p><h2 className="mt-1 text-lg font-black">Award by placement</h2></div><Trophy size={20} className="text-emerald-800" /></div>
          <div className="mt-4 space-y-2">
            {(tournament.placementPoints ?? []).map((point) => <div key={point.place} className="flex justify-between rounded-lg bg-white/75 px-3 py-2 text-xs"><span className="font-semibold">{point.place}</span><span className="font-black">{point.points} pts</span></div>)}
            {!(tournament.placementPoints ?? []).length && <p className="text-xs text-stone-500">Set points awarded for overall tournament placement.</p>}
          </div>
          <form onSubmit={addPlacementPoints} className="mt-3 grid grid-cols-[1fr_75px_auto] gap-2">
            <select value={placementDraft.place} onChange={(event) => setPlacementDraft((current) => ({ ...current, place: event.target.value }))} aria-label="Tournament placement" className="min-w-0 rounded-lg border border-stone-300 bg-white px-2 py-2 text-xs">
              {["1st place", "2nd place", "3rd place", "Participation"].map((place) => <option key={place}>{place}</option>)}
            </select>
            <input value={placementDraft.points} onChange={(event) => setPlacementDraft((current) => ({ ...current, points: event.target.value }))} type="number" min="0" required aria-label="Placement points" placeholder="Pts" className="w-full rounded-lg border border-stone-300 px-2 py-2 text-xs" />
            <button aria-label="Save tournament points" className="rounded-lg bg-[#0b352c] px-2.5 text-white"><Plus size={15} /></button>
          </form>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">People → Participants → Teams</p><h2 className="mt-1 text-xl font-black">Roster & team members</h2></div><Users size={20} className="text-emerald-800" /></div>
          <form onSubmit={addParticipant} className="mt-4 grid gap-2 sm:grid-cols-[1fr_170px_auto]">
            <input value={participantName} onChange={(event) => setParticipantName(event.target.value)} maxLength={60} required aria-label="Participant name" placeholder="Add a player / participant" className="min-w-0 rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" />
            <select name="organizationPerson" value={selectedPersonId} onChange={(event) => {
              const personId = event.target.value;
              setSelectedPersonId(personId);
              const selected = (tournament.organizationPeople ?? []).find((person) => person.id === personId);
              if (selected) setParticipantName(selected.name);
            }} aria-label="Link to organization person" className="min-w-0 rounded-lg border border-stone-300 bg-white px-2 py-2.5 text-xs">
              <option value="">Independent participant</option>
              {(tournament.organizationPeople ?? []).map((person) => <option key={person.id} value={person.id}>Link: {person.name}</option>)}
            </select>
            <button className="inline-flex items-center gap-1 rounded-lg bg-[#0b352c] px-3 py-2.5 text-xs font-bold text-white"><Plus size={14} /> Add</button>
          </form>
          <form onSubmit={addTeam} className="mt-3 flex gap-2">
            <input name="teamName" maxLength={60} required aria-label="New team name" placeholder={`Add a team (${teams.length}/${tournament.teams})`} className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" />
            <button disabled={teams.length >= tournament.teams} className="rounded-lg border border-stone-300 px-3 py-2.5 text-xs font-bold disabled:opacity-50">Add team</button>
          </form>
          <div className="mt-4 space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 rounded-lg bg-stone-50 p-2.5">
                <span className="min-w-0 flex-1 truncate text-xs font-bold">{participant.name}{participant.personId && <span className="ml-1.5 text-[10px] font-normal text-stone-400">organization person</span>}</span>
                <select value={participant.teamName ?? ""} onChange={(event) => assignParticipant(participant.id, event.target.value)} aria-label={`Assign ${participant.name} to team`} className="max-w-40 rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs">
                  <option value="">No team</option>
                  {teams.map((team) => <option key={team} value={team}>{team}</option>)}
                </select>
              </div>
            ))}
            {!participants.length && <p className="text-xs text-stone-400">Add participants and assign them to teams to define team membership.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Tournament → sports / activities</p><h2 className="mt-1 text-xl font-black">Activities & scoring rules</h2><p className="mt-1 text-xs text-stone-500">One tournament can include multiple sports.</p></div>
            <Activity size={20} className="text-emerald-800" />
          </div>
          <form onSubmit={addSport} className="mt-4 flex gap-2">
            <input value={sportName} onChange={(event) => setSportName(event.target.value)} maxLength={50} required aria-label="Additional sport or activity" placeholder="Add sport or activity (e.g. Badminton)" className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" />
            <button className="inline-flex items-center gap-1 rounded-lg bg-[#0b352c] px-3 py-2.5 text-xs font-bold text-white"><Plus size={14} /> Add sport</button>
          </form>
          <div className="mt-4 space-y-3">
            {activities.map((activity) => (
              <article key={activity.id} className="rounded-xl bg-[#f5f6f3] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black">{activity.sport}</p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500">
                    {(["winPoints", "drawPoints", "lossPoints"] as const).map((field, index) => (
                      <label key={field} className="flex items-center gap-1">{["W", "D", "L"][index]}<input aria-label={`${activity.sport} ${field}`} type="number" min="0" value={activity[field]} onChange={(event) => updateActivityPoints(activity.id, field, event.target.value)} className="w-12 rounded border border-stone-200 bg-white px-1.5 py-1 text-xs text-stone-800" /></label>
                    ))}
                    <span>pts</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Fixtures → results → standings</p><h2 className="mt-1 text-xl font-black">Schedule & match history</h2></div>
          <button onClick={generateFixtures} disabled={teams.length < 2} className="rounded-lg bg-[#0b352c] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{(tournament.matches ?? []).length ? "Update fixture list" : "Generate fixtures"}</button>
        </div>
        {!tournament.matches?.length ? <p className="mt-4 rounded-xl bg-[#f5f6f3] p-4 text-xs text-stone-500">Add at least two teams to generate {tournament.format.toLowerCase().includes("knockout") ? "the first knockout round" : "a full round-robin schedule"}.</p> : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-2">
              {tournament.matches.map((match, index) => <article key={match.id} className="rounded-xl border border-stone-100 p-3">
                <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{match.sport ?? tournament.sport} · Match {index + 1}</span><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${match.completed ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>{match.completed ? "Completed" : "Scheduled"}</span></div>
                {match.completed ? <div className="flex items-center justify-between rounded-lg bg-[#f5f6f3] p-3 text-xs"><span className="font-bold">{match.homeTeam}</span><span className="font-black">{match.homeScore} : {match.awayScore}</span><span className="font-bold">{match.awayTeam}</span></div> : <form onSubmit={(event) => recordResult(match.id, event)} className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                  <label className="min-w-0 text-[10px] font-semibold">{match.homeTeam}<input name="homeScore" type="number" min="0" step="1" required aria-label={`${match.homeTeam} score`} placeholder="Score" className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-2 text-sm outline-none focus:border-emerald-700" /></label><span className="pb-2 text-[10px] font-bold text-stone-400">VS</span><label className="min-w-0 text-[10px] font-semibold">{match.awayTeam}<input name="awayScore" type="number" min="0" step="1" required aria-label={`${match.awayTeam} score`} placeholder="Score" className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-2 text-sm outline-none focus:border-emerald-700" /></label><button className="col-span-3 rounded-lg bg-[#0b352c] py-2 text-[10px] font-bold text-white">Save result</button>
                </form>}
              </article>)}
            </div>
            <div className="rounded-xl bg-[#f5f6f3] p-4">
              <div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Sport standings</p><select value={predictionSport} onChange={(event) => setPredictionSport(event.target.value)} aria-label="Prediction sport" className="max-w-32 rounded border border-stone-200 bg-white px-2 py-1 text-[10px]">{activities.map((activity) => <option key={activity.id} value={activity.sport}>{activity.sport}</option>)}</select></div>
              {standings.filter((row) => row.sport === predictionSport).map((row, index) => <div key={`${row.sport}:${row.team}`} className="mt-2 flex items-center gap-2 border-b border-stone-200/70 py-2 text-[10px] last:border-0"><span className="w-4 text-stone-400">{index + 1}</span><span className="min-w-0 flex-1 truncate font-bold">{row.team}</span><span>{row.wins}W</span><span>{row.draws}D</span><span className="font-black">{row.points} pts</span></div>)}
              {!teams.length && <p className="mt-3 text-xs text-stone-400">Add teams to see standings.</p>}
              <p className="mt-3 text-[9px] text-stone-400">Win/draw/loss points follow the selected sport&apos;s rules.</p>
              {prediction && firstHistory && secondHistory && (
                <div className="mt-5 border-t border-stone-200 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">History-based estimate</p>
                  <p className="mt-1 text-xs font-black">{firstHistory.team} vs {secondHistory.team}</p>
                  {[{ history: firstHistory, chance: prediction.first }, { history: secondHistory, chance: prediction.second }].map(({ history, chance }) => (
                    <div key={history.team} className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px]"><span className="font-semibold">{history.team}</span><span className="font-black">{chance}%</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${chance}%` }} /></div>
                      <p className="mt-1 text-[9px] text-stone-400">{history.wins}W in {history.played} matches · form {history.recentForm.join(" ") || "not enough results"}</p>
                    </div>
                  ))}
                  {!completedMatches.length && <p className="mt-3 text-[9px] leading-4 text-amber-800">No tournament results yet; showing a neutral 50/50 starting estimate. This is not a live forecast.</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Activities → categories → events → stages</p><h2 className="mt-1 text-xl font-black">Competition structure</h2><p className="mt-1 text-xs text-stone-500">Build divisions, events and their group or knockout phases.</p></div>
          <Layers3 size={21} className="text-emerald-800" />
        </div>
        {!activities.length && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs text-amber-900">Add a sport or activity above to set up its categories, events and stages.</p>}
        <div className="mt-5 space-y-4">
          {activities.map((activity) => (
            <article key={activity.id} className="rounded-2xl border border-stone-200 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-base font-black"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800"><Activity size={16} /></span>{activity.sport}</h3>
                <form onSubmit={(event) => addCategory(activity.id, event)} className="flex gap-2">
                  <input value={categoryNames[activity.id] ?? ""} onChange={(event) => setCategoryNames((current) => ({ ...current, [activity.id]: event.target.value }))} maxLength={40} required aria-label={`${activity.sport} category name`} placeholder="e.g. Women's, U23, Open" className="w-44 rounded-lg border border-stone-300 px-2.5 py-2 text-xs" />
                  <button className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold"><CirclePlus size={14} /> Category</button>
                </form>
              </div>
              {!activity.categories.length && <p className="mt-4 text-xs text-stone-400">Add a category to define events.</p>}
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {activity.categories.map((category) => (
                  <section key={category.id} className="rounded-xl bg-[#f6f7f4] p-4">
                    <div className="flex items-center justify-between gap-2"><h4 className="text-sm font-black">{category.name}</h4><span className="text-[10px] font-semibold text-stone-400">{category.events.length} events</span></div>
                    <form onSubmit={(event) => { event.preventDefault(); addEvent(activity.id, category.id); }} className="mt-3 flex gap-2">
                      <input value={eventDrafts[category.id] ?? ""} onChange={(event) => setEventDrafts((current) => ({ ...current, [category.id]: event.target.value }))} maxLength={50} required aria-label={`${category.name} event name`} placeholder="e.g. Singles, Doubles, 100m" className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs" />
                      <button className="rounded-lg bg-[#0b352c] px-3 text-white" aria-label="Add event"><Plus size={15} /></button>
                    </form>
                    <div className="mt-3 space-y-3">
                      {category.events.map((eventItem) => (
                        <article key={eventItem.id} className="rounded-xl border border-stone-200 bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2"><h5 className="flex items-center gap-2 text-xs font-black"><Swords size={14} className="text-emerald-800" />{eventItem.name}</h5><span className="text-[10px] text-stone-400">{eventItem.stages.length} stages</span></div>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {eventItem.points.map((point, index) => <label key={point.place} className="text-[9px] font-semibold text-stone-500">{point.place}<span className="mt-1 flex items-center gap-1"><Medal size={11} /><input aria-label={`${eventItem.name} ${point.place} points`} type="number" min="0" value={point.points} onChange={(change) => updateEventPoints(activity.id, category.id, eventItem, index, change.target.value)} className="w-full rounded border border-stone-200 px-1.5 py-1 text-[10px] text-stone-900" /></span></label>)}
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_130px_auto]">
                            <input value={stageDrafts[eventItem.id] ?? ""} onChange={(change) => setStageDrafts((current) => ({ ...current, [eventItem.id]: change.target.value }))} maxLength={50} aria-label={`${eventItem.name} stage name`} placeholder="Stage name" className="min-w-0 rounded-lg border border-stone-300 px-2.5 py-2 text-xs" />
                            <select value={stageTypes[eventItem.id] ?? "GROUP"} onChange={(change) => setStageTypes((current) => ({ ...current, [eventItem.id]: change.target.value as "GROUP" | "KNOCKOUT" }))} aria-label="Stage type" className="rounded-lg border border-stone-300 bg-white px-2 py-2 text-xs"><option value="GROUP">Group stage</option><option value="KNOCKOUT">Knockout</option></select>
                            <button onClick={() => addStage(activity.id, category.id, eventItem)} disabled={!teams.length} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold disabled:opacity-50"><Plus className="mr-1 inline" size={13} /> Add stage</button>
                          </div>
                          {!teams.length && <p className="mt-1.5 text-[10px] text-stone-400">Add at least one team before creating stages.</p>}
                          {eventItem.stages.map((stage) => (
                            <div key={stage.id} className="mt-3 rounded-lg bg-[#f5f6f3] p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-black">{stage.name}</p><span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-800">{stage.type} · {stage.participants.length} teams</span>
                                <button disabled={!teams.length || stage.points.length > 0} onClick={() => {
                                  const refreshed = createStage(stage.name, stage.type, teams);
                                  updateStage(activity.id, category.id, eventItem.id, stage.id, () => ({ ...refreshed, id: stage.id }));
                                  setMessage("Teams assigned to the stage.");
                                }} className="text-[9px] font-bold text-emerald-800 disabled:text-stone-400">Assign current teams</button>
                              </div>
                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                {stage.type === "GROUP" ? stage.groups.map((group) => <div key={group.id} className="rounded-md bg-white p-2"><p className="text-[10px] font-black">{group.name}</p><p className="mt-1 text-[10px] text-stone-500">{group.teamNames.join(" · ") || "Teams will be assigned here"}</p></div>) : stage.rounds.map((round) => <div key={round.id} className="rounded-md bg-white p-2">
                                  <p className="text-[10px] font-black">{round.name}</p>
                                  <div className="mt-1 flex flex-wrap gap-1">{round.teamNames.map((team) => <button key={team} type="button" aria-label={`Remove ${team} from ${round.name}`} onClick={() => updateStage(activity.id, category.id, eventItem.id, stage.id, (current) => ({ ...current, rounds: current.rounds.map((item) => item.id === round.id ? { ...item, teamNames: item.teamNames.filter((name) => name !== team) } : item) }))} className="rounded-full bg-stone-100 px-2 py-1 text-[9px] font-semibold hover:bg-rose-50 hover:text-rose-700">{team} ×</button>)}</div>
                                  {!round.teamNames.length && <p className="mt-1 text-[10px] text-stone-400">Advancing teams can be assigned here.</p>}
                                  <form onSubmit={(event) => { event.preventDefault(); addRoundParticipant(activity.id, category.id, eventItem.id, stage, round.id); }} className="mt-2 flex gap-1">
                                    <select value={roundParticipantDrafts[round.id] ?? ""} onChange={(event) => setRoundParticipantDrafts((current) => ({ ...current, [round.id]: event.target.value }))} aria-label={`${round.name} participant`} className="min-w-0 flex-1 rounded border border-stone-200 bg-white px-1.5 py-1 text-[9px]"><option value="">Add participant…</option>{teams.filter((team) => !round.teamNames.includes(team)).map((team) => <option key={team}>{team}</option>)}</select>
                                    <button aria-label={`Add participant to ${round.name}`} className="rounded bg-[#0b352c] px-2 text-white"><Plus size={12} /></button>
                                  </form>
                                </div>)}
                              </div>
                              <form onSubmit={(event) => addStagePoints(activity.id, category.id, eventItem.id, stage.id, event)} className="mt-3 grid grid-cols-[1fr_80px_auto] gap-2">
                                <select value={stagePointDrafts[stage.id]?.teamName ?? ""} onChange={(event) => setStagePointDrafts((current) => ({ ...current, [stage.id]: { teamName: event.target.value, points: current[stage.id]?.points ?? "" } }))} required aria-label="Team receiving stage points" className="min-w-0 rounded border border-stone-200 bg-white px-2 py-1.5 text-[10px]"><option value="">Award stage points to…</option>{teams.map((team) => <option key={team}>{team}</option>)}</select>
                                <input value={stagePointDrafts[stage.id]?.points ?? ""} onChange={(event) => setStagePointDrafts((current) => ({ ...current, [stage.id]: { teamName: current[stage.id]?.teamName ?? "", points: event.target.value } }))} type="number" required aria-label="Stage points" placeholder="Points" className="w-full rounded border border-stone-200 px-2 py-1.5 text-[10px]" />
                                <button aria-label="Save stage points" className="rounded bg-[#0b352c] px-2 text-white"><Check size={13} /></button>
                              </form>
                              {stage.points.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{stage.points.map((point) => <span key={point.teamName} className="rounded-full bg-white px-2 py-1 text-[9px] font-bold">{point.teamName}: {point.points} pts</span>)}</div>}
                              <button className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-stone-500" onClick={() => setMessage(`Stage participants: ${stage.participants.join(", ") || "none"}`)}><Award size={12} /> View stage participants</button>
                            </div>
                          ))}
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900">{message}</p>}
      <p className="text-[11px] leading-5 text-stone-400">This workspace prototype stores changes in this browser. A shared database and real user permissions require a connected backend.</p>
    </section>
  );
}
