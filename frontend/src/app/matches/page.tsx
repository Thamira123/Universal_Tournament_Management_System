"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, CircleDot, MapPin } from "lucide-react";
import UTMSMark from "@/components/utms-mark";

type MatchStatus = "Live" | "Upcoming" | "Completed";
type MatchCentreFixture = {
  id: string;
  sport: string;
  competition: string;
  match: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: MatchStatus;
  homeScore?: string;
  awayScore?: string;
  result?: string;
  tournamentId: string;
};

const fixtures: MatchCentreFixture[] = [
  { id: "sl-pak-2", sport: "Cricket", competition: "Sri Lanka vs Pakistan · ODI Series", match: "2nd ODI", homeTeam: "Sri Lanka", awayTeam: "Pakistan", date: "2026-10-12", time: "Live", venue: "Pallekele International Stadium", status: "Live", homeScore: "176/5", awayScore: "269/8", result: "Sri Lanka need 94 from 86 balls", tournamentId: "sl-pakistan-odi-series" },
  { id: "football-today", sport: "Football", competition: "Colombo Night Series", match: "League · Match 8", homeTeam: "Colombo Strikers", awayTeam: "Galle United", date: "2026-10-12", time: "7:30 PM", venue: "Racecourse International Stadium", status: "Upcoming", tournamentId: "colombo-night-series" },
  { id: "basketball-today", sport: "Basketball", competition: "Campus Hoops Cup", match: "Group A · Match 4", homeTeam: "Kandy Falcons", awayTeam: "Jaffna Kings", date: "2026-10-12", time: "8:00 PM", venue: "University Sports Complex", status: "Upcoming", tournamentId: "campus-hoops-cup" },
  { id: "sl-pak-1", sport: "Cricket", competition: "Sri Lanka vs Pakistan · ODI Series", match: "1st ODI", homeTeam: "Sri Lanka", awayTeam: "Pakistan", date: "2026-10-10", time: "Completed", venue: "R. Premadasa Stadium, Colombo", status: "Completed", homeScore: "286/6", awayScore: "281/8", result: "Sri Lanka won by 4 wickets", tournamentId: "sl-pakistan-odi-series" },
  { id: "football-yesterday", sport: "Football", competition: "Colombo Night Series", match: "League · Match 7", homeTeam: "Negombo Waves", awayTeam: "Kandy Rovers", date: "2026-10-11", time: "Completed", venue: "Colombo City Stadium", status: "Completed", homeScore: "2", awayScore: "1", result: "Negombo Waves won", tournamentId: "colombo-night-series" },
  { id: "volleyball-result", sport: "Volleyball", competition: "Island Volleyball Open", match: "Semi-final 1", homeTeam: "Lions VC", awayTeam: "Coastal Spikers", date: "2026-10-09", time: "Completed", venue: "Sugathadasa Indoor Stadium", status: "Completed", homeScore: "3", awayScore: "1", result: "Lions VC advanced to the final", tournamentId: "island-volleyball-open" },
  { id: "sl-pak-3", sport: "Cricket", competition: "Sri Lanka vs Pakistan · ODI Series", match: "3rd ODI", homeTeam: "Sri Lanka", awayTeam: "Pakistan", date: "2026-10-15", time: "2:30 PM", venue: "R. Premadasa Stadium, Colombo", status: "Upcoming", tournamentId: "sl-pakistan-odi-series" },
  { id: "football-next", sport: "Football", competition: "Colombo Night Series", match: "League · Match 9", homeTeam: "Jaffna United", awayTeam: "Matara City", date: "2026-10-14", time: "6:00 PM", venue: "Racecourse International Stadium", status: "Upcoming", tournamentId: "colombo-night-series" },
  { id: "basketball-next", sport: "Basketball", competition: "Campus Hoops Cup", match: "Group B · Match 2", homeTeam: "Colombo Comets", awayTeam: "Galle Titans", date: "2026-10-16", time: "5:30 PM", venue: "University Sports Complex", status: "Upcoming", tournamentId: "campus-hoops-cup" },
  { id: "volleyball-next", sport: "Volleyball", competition: "Island Volleyball Open", match: "Final", homeTeam: "Lions VC", awayTeam: "Jaffna Aces", date: "2026-10-17", time: "4:00 PM", venue: "Sugathadasa Indoor Stadium", status: "Upcoming", tournamentId: "island-volleyball-open" },
  { id: "esports-next", sport: "Esports", competition: "Colombo Arena Series", match: "Grand Final", homeTeam: "Team Ember", awayTeam: "Neon Five", date: "2026-10-18", time: "7:00 PM", venue: "Online", status: "Upcoming", tournamentId: "colombo-arena-series" },
];

const sports = ["All sports", "Cricket", "Football", "Basketball", "Volleyball", "Esports"];
const tabs = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "results", label: "Results" },
] as const;

type MatchTab = (typeof tabs)[number]["id"];

const sportEmoji: Record<string, string> = {
  Cricket: "🏏",
  Football: "⚽",
  Basketball: "🏀",
  Volleyball: "🏐",
  Esports: "🎮",
};

function dateLabel(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en", options ?? { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function localDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function MatchCard({ fixture }: { fixture: MatchCentreFixture }) {
  const completed = fixture.status === "Completed";
  const live = fixture.status === "Live";
  return (
    <Link href={`/tournaments/${fixture.tournamentId}`} className="group block rounded-2xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-50 text-lg">{sportEmoji[fixture.sport]}</span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.13em] text-stone-400">{fixture.sport} <span className="mx-1 text-stone-300">·</span> {fixture.competition}</p>
            <p className="mt-0.5 text-xs font-bold text-stone-700">{fixture.match}</p>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${live ? "bg-rose-50 text-rose-700" : completed ? "bg-stone-100 text-stone-600" : "bg-emerald-50 text-emerald-800"}`}>
          {live && <CircleDot size={11} className="animate-pulse" />}{fixture.status}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-5 sm:py-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-stone-900 sm:text-base">{fixture.homeTeam}</p>
          {fixture.homeScore && <p className="mt-1 text-xl font-black tracking-tight text-[#0b352c]">{fixture.homeScore}</p>}
        </div>
        <span className="rounded-md bg-stone-100 px-2 py-1 text-[9px] font-black tracking-widest text-stone-400">VS</span>
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-black text-stone-900 sm:text-base">{fixture.awayTeam}</p>
          {fixture.awayScore && <p className="mt-1 text-xl font-black tracking-tight text-[#0b352c]">{fixture.awayScore}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-[11px] text-stone-500">
        <span className="inline-flex items-center gap-1.5"><MapPin size={12} />{fixture.venue}</span>
        <span className="inline-flex items-center gap-1.5 font-semibold"><CalendarDays size={12} />{completed ? dateLabel(fixture.date, { month: "short", day: "numeric", year: "numeric" }) : fixture.time}</span>
      </div>
      {(fixture.result || (live && fixture.result)) && <p className={`mt-3 rounded-lg px-3 py-2 text-xs font-bold ${live ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{fixture.result}</p>}
      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800">Match details <ChevronRight size={13} className="transition group-hover:translate-x-0.5" /></span>
    </Link>
  );
}

export default function MatchesPage() {
  const [activeSport, setActiveSport] = useState("All sports");
  const [activeTab, setActiveTab] = useState<MatchTab>("today");
  const [today, setToday] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToday(localDateKey(new Date()));
      const sport = new URLSearchParams(window.location.search).get("sport");
      if (sport && sports.includes(sport)) setActiveSport(sport);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const bySport = useMemo(() => fixtures.filter((fixture) => activeSport === "All sports" || fixture.sport === activeSport), [activeSport]);
  const todayMatches = today ? bySport.filter((fixture) => fixture.date === today && fixture.status !== "Completed") : [];
  const upcomingMatches = today ? bySport.filter((fixture) => fixture.status === "Upcoming" && fixture.date > today) : [];
  const resultMatches = bySport.filter((fixture) => fixture.status === "Completed");
  const visibleMatches = activeTab === "today" ? todayMatches : activeTab === "upcoming" ? upcomingMatches : resultMatches;
  const groupedUpcoming = [...new Set(upcomingMatches.map((fixture) => fixture.date))];
  const currentTabTitle = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <main className="min-h-screen bg-[#f4f5f2] text-stone-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#082f28] text-white">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-4 sm:px-8">
          <Link href="/" aria-label="UTMS home" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b6ed58] p-2 text-[#082f28]"><UTMSMark className="h-full w-full" /></span>
            <span><span className="block text-lg font-black">UTMS<span className="text-[#b6ed58]">.</span></span><span className="hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:block">Tournament management</span></span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-4 text-xs font-semibold text-white/75 sm:gap-7 sm:text-sm">
            <Link href="/#tournaments" className="hover:text-white">Tournaments</Link>
            <span className="text-[#b6ed58]">Match Centre</span>
            <Link href="/predictions" className="hover:text-white">Predictions</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-emerald-800"><ArrowLeft size={16} /> Dashboard</Link>
        <section className="relative mt-5 overflow-hidden rounded-[26px] bg-[#0b352c] p-6 text-white sm:p-9">
          <div className="absolute -right-12 -top-24 h-80 w-80 rounded-full border border-white/[0.08]" />
          <div className="absolute -right-4 -top-16 h-64 w-64 rounded-full border border-white/[0.08]" />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d9f4aa]"><CircleDot size={12} /> Scores, schedules & results</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Match Centre</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Choose a sport to see what&apos;s on today, what&apos;s coming next and the latest results.</p>
            </div>
            <Link href="/#tournaments" className="inline-flex items-center gap-2 self-start rounded-lg bg-[#b6ed58] px-4 py-3 text-xs font-extrabold text-[#082f28] transition hover:bg-[#c7fa74] sm:self-auto">Explore tournaments <ArrowRight size={14} /></Link>
          </div>
        </section>

        <section className="mt-7" aria-label="Filter matches by sport">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sports.map((sport) => (
              <button key={sport} onClick={() => setActiveSport(sport)} aria-pressed={activeSport === sport} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold transition ${activeSport === sport ? "border-[#0b352c] bg-[#0b352c] text-white" : "border-stone-200 bg-white text-stone-600 hover:border-emerald-700 hover:text-emerald-800"}`}>
                {sport !== "All sports" && <span className="mr-1.5">{sportEmoji[sport]}</span>}{sport}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200">
          <div className="flex gap-5 sm:gap-8" role="tablist" aria-label="Match schedule">
            {tabs.map((tab) => {
              const count = tab.id === "today" ? todayMatches.length : tab.id === "upcoming" ? upcomingMatches.length : resultMatches.length;
              return <button key={tab.id} id={`tab-${tab.id}`} role="tab" aria-selected={activeTab === tab.id} aria-controls="match-list" onClick={() => setActiveTab(tab.id)} className={`border-b-2 px-1 pb-3 text-sm font-extrabold transition ${activeTab === tab.id ? "border-emerald-800 text-[#0b352c]" : "border-transparent text-stone-400 hover:text-stone-700"}`}>{tab.label}<span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === tab.id ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>{count}</span></button>;
            })}
          </div>
          <p className="pb-3 text-[10px] font-semibold text-stone-400">{activeSport} <span className="mx-1">·</span> {currentTabTitle} matches</p>
        </div>

        <section id="match-list" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="mt-6">
          {activeTab === "today" && <div className="mb-4 flex items-center gap-2 text-sm font-black"><CalendarDays size={16} className="text-emerald-800" />{today ? dateLabel(today) : "Today"}<span className="text-xs font-medium text-stone-400">· Local time</span></div>}
          {activeTab === "upcoming" && groupedUpcoming.map((date) => (
            <div key={date} className="mb-8">
              <div className="mb-4 flex items-center gap-2 text-sm font-black"><CalendarDays size={16} className="text-emerald-800" />{dateLabel(date)}<span className="text-xs font-medium text-stone-400">· {dateLabel(date, { month: "short", day: "numeric" })}</span></div>
              <div className="grid gap-3 md:grid-cols-2">{upcomingMatches.filter((fixture) => fixture.date === date).map((fixture) => <MatchCard key={fixture.id} fixture={fixture} />)}</div>
            </div>
          ))}
          {activeTab !== "upcoming" && visibleMatches.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">{visibleMatches.map((fixture) => <MatchCard key={fixture.id} fixture={fixture} />)}</div>
          )}
          {!visibleMatches.length && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-2xl">{sportEmoji[activeSport] ?? "🏟️"}</div>
              <h2 className="mt-4 text-lg font-black">No {activeSport === "All sports" ? "" : `${activeSport.toLowerCase()} `}{activeTab} matches</h2>
              <p className="mt-2 text-sm text-stone-500">Try another sport or match category.</p>
            </div>
          )}
        </section>

        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Demo schedule and scores for preview only. Connect a live sports data provider to show verified fixtures, real-time scores and official results.</p>
        <footer className="mt-10 flex items-center justify-between border-t border-stone-200 pt-5 text-xs text-stone-500"><span>UTMS · Match Centre</span><Link href="/" className="inline-flex items-center gap-1 font-semibold hover:text-emerald-800">Home <ChevronRight size={14} /></Link></footer>
      </div>
    </main>
  );
}
