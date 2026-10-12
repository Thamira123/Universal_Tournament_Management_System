"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CircleDot,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Clock3,
  Flame,
  Menu,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import UTMSMark from "@/components/utms-mark";
import {
  sampleTournaments,
  saveCreatedTournaments,
  type Tournament,
  useCreatedTournaments,
} from "@/lib/tournaments";

const sportOptions = [
  { name: "Cricket", mark: "🏏" },
  { name: "Football", mark: "⚽" },
  { name: "Basketball", mark: "🏀" },
  { name: "Volleyball", mark: "🏐" },
  { name: "Esports", mark: "🎮" },
  { name: "Other", mark: "🏆" },
];

const formatOptions: Record<string, string[]> = {
  Cricket: ["T20", "ODI", "Test", "Tape ball"],
  Football: ["11-a-side", "5-a-side", "7-a-side"],
  Basketball: ["5x5", "3x3"],
  Volleyball: ["Indoor", "Beach"],
  Esports: ["Single elimination", "Double elimination", "Round robin"],
  Other: ["League", "Knockout", "Groups + finals"],
};

const sportStyles: Record<string, string> = {
  Cricket: "bg-amber-100 text-amber-800",
  Football: "bg-emerald-100 text-emerald-800",
  Basketball: "bg-orange-100 text-orange-800",
  Volleyball: "bg-sky-100 text-sky-800",
  Esports: "bg-violet-100 text-violet-800",
  Other: "bg-stone-200 text-stone-700",
};

const sportImages: Record<string, string> = {
  Cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=640&q=80",
  Football: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=640&q=80",
  Basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=640&q=80",
  Volleyball: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=640&q=80",
  Esports: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=640&q=80",
};

const heroSlides = [
  { sport: "Cricket", image: sportImages.Cricket, caption: "Bring every cricket series to life.", label: "Built for the big moments" },
  { sport: "Football", image: sportImages.Football, caption: "From local leagues to finals night.", label: "Every team. Every fixture." },
  { sport: "Basketball", image: sportImages.Basketball, caption: "Make your next tournament count.", label: "Play together. Rise together." },
];

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const sport = sportOptions.find((option) => option.name === tournament.sport);

  return (
    <Link href={`/tournaments/${tournament.id}`} className="group flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-2xl">
          {sportImages[tournament.sport] && <span aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url("${sportImages[tournament.sport]}")` }} />}
          <span className="relative drop-shadow">{sport?.mark ?? "🏆"}</span>
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${sportStyles[tournament.sport] ?? sportStyles.Other}`}>
              {tournament.sport}
            </span>
            <span className="text-xs text-stone-500">{tournament.format}</span>
          </div>
          <h3 className="truncate text-base font-bold text-stone-900">{tournament.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
            <CalendarDays size={13} />
            {tournament.date}
            <span className="mx-1 text-stone-300">•</span>
            <Users size={13} />
            {tournament.teams} teams
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3 sm:border-0 sm:pt-0">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tournament.status === "Registration open" || tournament.status === "Live" ? "text-emerald-700" : "text-stone-500"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${tournament.status === "Registration open" || tournament.status === "Live" ? "bg-emerald-500" : "bg-stone-400"}`} />
          {tournament.status}
        </span>
        <span aria-hidden="true" className="rounded-full p-2 text-stone-400 transition group-hover:bg-stone-100 group-hover:text-stone-900">
          <ChevronRight size={18} />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState("Cricket");
  const [customSport, setCustomSport] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const savedTournaments = useCreatedTournaments();
  const tournaments = useMemo(
    () => [
      ...savedTournaments,
      ...sampleTournaments.filter((item) => !savedTournaments.some((saved) => saved.id === item.id)),
    ],
    [savedTournaments],
  );
  const [showAllTournaments, setShowAllTournaments] = useState(false);
  const [scoreSearchOpen, setScoreSearchOpen] = useState(false);
  const [scoreSearch, setScoreSearch] = useState("");
  const formats = useMemo(() => formatOptions[selectedSport] ?? formatOptions.Other, [selectedSport]);

  useEffect(() => {
    const interval = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(interval);
  }, []);

  const searchResults = scoreSearch.trim()
    ? tournaments.filter((tournament) =>
        `${tournament.name} ${tournament.sport} ${tournament.teamNames?.join(" ") ?? ""}`
          .toLowerCase()
          .includes(scoreSearch.trim().toLowerCase()),
      )
    : [];

  function createTournament(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tournamentName = String(formData.get("tournamentName") ?? "").trim();
    if (!tournamentName) return;
    const sportName = selectedSport === "Other" ? customSport.trim() : selectedSport;
    if (!sportName) return;
    const tournamentId = `${tournamentName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
    const categoryName = String(formData.get("categoryName") ?? "Open").trim() || "Open";
    const eventName = String(formData.get("eventName") ?? "Main event").trim() || "Main event";
    const competitionType = String(formData.get("competitionType") ?? "League");
    const stageId = `${tournamentId}-stage`;
    const defaultPoints = [
      { place: "1st place", points: 100 },
      { place: "2nd place", points: 70 },
      { place: "3rd place", points: 50 },
    ];
    const initialStages = competitionType === "Groups + finals"
      ? [
          { id: `${stageId}-groups`, name: "Group Stage", type: "GROUP" as const, participants: [], groups: [], rounds: [], points: [] },
          { id: `${stageId}-finals`, name: "Finals", type: "KNOCKOUT" as const, participants: [], groups: [], rounds: [], points: [] },
        ]
      : [{ id: stageId, name: competitionType === "Knockout" ? "Knockout Stage" : "League Stage", type: competitionType === "Knockout" ? "KNOCKOUT" as const : "GROUP" as const, participants: [], groups: [], rounds: [], points: [] }];

    const newTournament: Tournament = {
      id: tournamentId,
      name: tournamentName,
      sport: sportName,
      format: `${String(formData.get("format") ?? formats[0])} • ${competitionType}`,
      teams: Number(formData.get("teamCount") ?? 8),
      date: "Date to be confirmed",
      status: "Coming soon",
      organizationName: String(formData.get("organizationName") ?? "").trim(),
      activities: [{
        id: `${tournamentId}-activity`,
        sport: sportName,
        winPoints: sportName === "Football" ? 3 : 2,
        drawPoints: 1,
        lossPoints: 0,
        categories: [{
          id: `${tournamentId}-category`,
          name: categoryName,
          events: [{ id: `${tournamentId}-event`, name: eventName, points: defaultPoints, stages: initialStages }],
        }],
      }],
      placementPoints: defaultPoints,
    };

    const createdTournaments = [newTournament, ...savedTournaments];
    saveCreatedTournaments(createdTournaments);
    setIsCreateOpen(false);
    event.currentTarget.reset();
    setSelectedSport("Cricket");
    setCustomSport("");
    setActiveSlide(0);
    router.push(`/tournaments/${tournamentId}`);
  }

  return (
    <main className="min-h-screen bg-[#f4f5f2] text-stone-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#082f28] text-white">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-8">
          <Link href="/" aria-label="UTMS home" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b6ed58] p-2 text-[#082f28] shadow-[0_5px_20px_rgba(182,237,88,0.15)]">
              <UTMSMark className="h-full w-full" />
            </span>
            <span>
              <span className="block text-lg font-black leading-none tracking-tight">UTMS<span className="text-[#b6ed58]">.</span></span>
              <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:block">Universal Tournament Management</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
            <Link className="border-b-2 border-[#b6ed58] py-[26px] text-white" href="/#overview">Home</Link>
            <Link className="transition hover:text-white" href="/#tournaments">Tournaments</Link>
            <Link className="transition hover:text-white" href="/matches">Match centre</Link>
            <Link className="transition hover:text-white" href="/predictions">Predictions</Link>
            <Link className="transition hover:text-white" href="/#sports">Sports</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:block">
              Sign in
            </Link>
            <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#b6ed58] px-3 py-2.5 text-xs font-bold text-[#082f28] transition hover:bg-[#c7fa74] sm:px-4 sm:text-sm">
              <Plus size={17} strokeWidth={2.5} />
              <span className="hidden sm:inline">Create tournament</span>
              <span className="sm:hidden">Create</span>
            </button>
            <details className="relative md:hidden">
              <summary aria-label="Open menu" className="list-none cursor-pointer rounded-lg p-2 text-white/70"><Menu size={20} /></summary>
              <div className="absolute right-0 top-12 flex min-w-48 flex-col rounded-xl border border-stone-200 bg-white p-2 text-sm font-semibold text-stone-800 shadow-xl">
                <Link className="rounded-lg px-3 py-2 hover:bg-stone-100" href="/#tournaments">Tournaments</Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-stone-100" href="/matches">Match centre</Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-stone-100" href="/predictions">Predictions</Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      <div className="bg-[#123e35] text-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 overflow-hidden px-4 py-2.5 text-xs sm:px-8">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded bg-[#f15d4e] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider">
            <CircleDot size={10} /> Live
          </span>
          <p className="truncate text-white/75"><span className="font-bold text-white">South Coast XI 146/4</span> (17.2 ov) vs Kandy Kings <span className="mx-2 text-white/30">|</span> National T20 Cup · Match 18</p>
          <Link href="/matches" className="ml-auto hidden shrink-0 items-center gap-1 font-bold text-[#b6ed58] sm:flex">All scores <ArrowRight size={14} /></Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-6 sm:px-8 sm:pt-9">
        <section id="overview" className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[26px] bg-[#0b352c] p-6 text-white sm:p-9 lg:min-h-[410px]">
            {heroSlides.map((slide, index) => <div key={slide.sport} aria-hidden="true" className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === activeSlide ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(5,39,31,.90) 0%, rgba(5,39,31,.55) 42%, rgba(5,39,31,.10) 100%), url("${slide.image}")` }} />)}
            <div className="absolute inset-0 bg-gradient-to-t from-[#082f28]/70 via-transparent to-transparent" />
            <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full border-[1px] border-white/[0.07]" />
            <div className="pointer-events-none absolute -right-4 -top-8 h-56 w-56 rounded-full border-[1px] border-white/[0.07]" />
            <div className="pointer-events-none absolute -bottom-24 right-24 h-64 w-64 rounded-full bg-[#b6ed58]/10 blur-3xl" />
            <div className="relative">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#d0ef9b]">
                <Flame size={14} /> {heroSlides[activeSlide].label}
              </div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/55">One home for every competition</p>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-[58px]">
                Make every match<br /> <span className="text-[#b6ed58]">count.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                {heroSlides[activeSlide].caption} Create tournaments across sports, track results and celebrate every champion.
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap items-center gap-3">
              <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#b6ed58] px-5 py-3 text-sm font-extrabold text-[#082f28] transition hover:bg-[#c7fa74]">
                <Plus size={17} /> Start a tournament
              </button>
              <a href="#tournaments" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Explore tournaments <ArrowRight size={15} />
              </a>
            </div>
            <div className="relative mt-5 flex items-center gap-2" aria-label="Featured sports banner">
              <button aria-label="Previous featured sport" onClick={() => setActiveSlide((current) => (current + heroSlides.length - 1) % heroSlides.length)} className="rounded-full border border-white/20 p-1.5 text-white/80 transition hover:bg-white/10"><ChevronLeft size={14} /></button>
              {heroSlides.map((slide, index) => <button key={slide.sport} aria-label={`Show ${slide.sport} banner`} aria-current={index === activeSlide} onClick={() => setActiveSlide(index)} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-[#b6ed58]" : "w-2 bg-white/35 hover:bg-white/70"}`} />)}
              <button aria-label="Next featured sport" onClick={() => setActiveSlide((current) => (current + 1) % heroSlides.length)} className="rounded-full border border-white/20 p-1.5 text-white/80 transition hover:bg-white/10"><ChevronRightIcon size={14} /></button>
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">{heroSlides[activeSlide].sport}</span>
            </div>
            <div className="absolute bottom-7 right-8 hidden text-[110px] leading-none opacity-[0.08] xl:block">🏆</div>
          </div>

          <div id="live" className="flex flex-col rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-stone-400"><span className="h-2 w-2 animate-pulse rounded-full bg-[#ed594e]" /> On the field</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Live centre</h2>
              </div>
              <button aria-label="Search tournaments and match series" onClick={() => { setScoreSearchOpen((open) => !open); setScoreSearch(""); }} className="rounded-full border border-stone-200 p-2.5 text-stone-500 transition hover:bg-stone-50"><Search size={17} /></button>
            </div>
            {scoreSearchOpen && (
              <div className="relative z-10 mb-4">
                <input autoFocus value={scoreSearch} onChange={(event) => setScoreSearch(event.target.value)} placeholder="Search teams or tournaments" aria-label="Search teams or tournaments" className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" />
                {scoreSearch.trim() && <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-stone-100 bg-white">
                  {searchResults.length ? searchResults.map((item) => <Link key={item.id} href={`/tournaments/${item.id}`} className="block px-3 py-2.5 text-xs font-semibold hover:bg-stone-50">{item.name}<span className="ml-2 text-stone-400">{item.sport}</span></Link>) : <p className="px-3 py-2.5 text-xs text-stone-500">No matching tournaments found.</p>}
                </div>}
              </div>
            )}
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4 text-xs">
              <Link href="/matches?sport=Cricket" className="rounded-full bg-[#0b352c] px-3 py-1.5 font-bold text-white">Cricket</Link>
              <Link href="/matches?sport=Football" className="rounded-full px-3 py-1.5 font-semibold text-stone-500 hover:bg-stone-100">Football</Link>
              <Link href="/matches?sport=Basketball" className="rounded-full px-3 py-1.5 font-semibold text-stone-500 hover:bg-stone-100">Basketball</Link>
              <Link href="/predictions" className="ml-auto text-xs font-semibold text-stone-400 hover:text-emerald-800">Insights</Link>
            </div>
            <div className="flex flex-1 flex-col justify-center py-4">
              <div className="mb-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400">
                <span>National T20 Cup · Match 18</span>
                <span className="inline-flex items-center gap-1.5 text-[#e14f43]"><span className="h-1.5 w-1.5 rounded-full bg-[#e14f43]" /> Live</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">🌊</div>
                  <p className="text-sm font-bold">South Coast XI</p>
                  <p className="mt-1 text-2xl font-black tracking-tight">146<span className="text-stone-400">/4</span></p>
                  <p className="text-[11px] text-stone-400">17.2 overs</p>
                </div>
                <span className="rounded-md bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-400">VS</span>
                <div className="text-right">
                  <div className="mb-2 ml-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">👑</div>
                  <p className="text-sm font-bold">Kandy Kings</p>
                  <p className="mt-1 text-2xl font-black tracking-tight">Yet to bat</p>
                  <p className="text-[11px] text-stone-400">Target —</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-[#f4f5f2] px-4 py-3 text-xs">
                <span className="font-bold text-stone-800">Need 55 from 16 balls</span>
                <span className="float-right text-stone-500">CRR 8.42</span>
              </div>
            </div>
            <Link href="/matches" className="inline-flex items-center justify-center gap-2 border-t border-stone-100 pt-4 text-xs font-bold text-emerald-800 transition hover:text-emerald-600">View match centre <ArrowRight size={14} /></Link>
          </div>
        </section>

        <section id="sports" className="mt-11">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Find your game</p>
              <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">Every sport, one platform.</h2>
            </div>
            <button onClick={() => setIsCreateOpen(true)} className="hidden items-center gap-1 text-sm font-bold text-emerald-800 sm:flex">Create yours <ArrowRight size={15} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {sportOptions.map((sport, index) => (
              <button key={sport.name} onClick={() => { setSelectedSport(sport.name); setIsCreateOpen(true); }} className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-2xl">
                  {sportImages[sport.name] && <span className="absolute inset-0 bg-cover bg-center opacity-70 transition group-hover:scale-110" style={{ backgroundImage: `url("${sportImages[sport.name]}")` }} />}
                  <span className="relative drop-shadow">{sport.mark}</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{sport.name}</span>
                  <span className="mt-0.5 block text-[11px] text-stone-400">{["T20 · ODI · Test", "11 · 7 · 5-a-side", "5x5 · 3x3", "Indoor · Beach", "All formats", "Your rules"][index]}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section id="tournaments" className="mt-12 grid items-start gap-7 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">The competition starts here</p>
                <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">Tournament desk</h2>
              </div>
              <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold transition hover:border-emerald-500 hover:text-emerald-800 sm:px-4 sm:text-sm"><Plus size={15} /> New tournament</button>
            </div>
            <div className="space-y-3">
              {tournaments.slice(0, showAllTournaments ? undefined : 3).map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}
            </div>
            <button onClick={() => setShowAllTournaments((show) => !show)} className="mt-4 w-full rounded-xl border border-dashed border-stone-300 py-3 text-sm font-semibold text-stone-500 transition hover:border-emerald-500 hover:text-emerald-800">{showAllTournaments ? "Show fewer tournaments" : "Browse all tournaments"} <ArrowRight className="ml-1 inline" size={15} /></button>
          </div>

          <aside className="rounded-2xl bg-[#e8eddf] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-800">How it works</p>
                <h3 className="mt-1 text-xl font-black">Ready in minutes.</h3>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-800"><Clock3 size={20} /></span>
            </div>
            <div className="mt-6 space-y-5">
              {[
                ["01", "Pick your sport", "Cricket, football, hoops and more."],
                ["02", "Choose a format", "League, knockout, groups or your own."],
                ["03", "Bring teams in", "Share fixtures and follow every result."],
              ].map(([number, title, detail]) => (
                <div key={number} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0b352c] text-[10px] font-black text-[#b6ed58]">{number}</span>
                  <div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-xs leading-5 text-stone-500">{detail}</p></div>
                </div>
              ))}
            </div>
            <button onClick={() => setIsCreateOpen(true)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b352c] py-3 text-sm font-bold text-white transition hover:bg-emerald-900">Create your first tournament <ArrowRight size={15} /></button>
            <p className="mt-3 text-center text-[11px] text-stone-500">Free to set up. Built for every level.</p>
          </aside>
        </section>
      </div>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 UTMS · Universal Tournament Management System</p>
          <div className="flex items-center gap-5"><Link href="/login" className="hover:text-stone-900">Sign in</Link><Link href="/register" className="hover:text-stone-900">Get started</Link></div>
        </div>
      </footer>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071b16]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-tournament-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[26px] bg-white p-6 shadow-2xl sm:rounded-[26px] sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Make it yours</p>
                <h2 id="create-tournament-title" className="mt-1 text-2xl font-black tracking-tight">Create a tournament</h2>
                <p className="mt-1 text-sm text-stone-500">Set the basics now. You can add teams and fixtures next.</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} aria-label="Close dialog" className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-800"><X size={19} /></button>
            </div>
            <form onSubmit={createTournament} className="space-y-5">
              <div>
                <label htmlFor="tournamentName" className="mb-2 block text-sm font-bold">Tournament name</label>
                <input id="tournamentName" name="tournamentName" required maxLength={60} placeholder="e.g. Summer Champions Cup" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
              </div>
              <div>
                <label htmlFor="organizationName" className="mb-2 block text-sm font-bold">Organizing organization</label>
                <input id="organizationName" name="organizationName" maxLength={80} placeholder="e.g. Colombo Sports Association" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
              </div>
              <div>
                <label htmlFor="sport" className="mb-2 block text-sm font-bold">Choose a sport</label>
                <select id="sport" value={selectedSport} onChange={(event) => setSelectedSport(event.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10">
                  {sportOptions.map((sport) => <option key={sport.name} value={sport.name}>{sport.mark} {sport.name}</option>)}
                </select>
              </div>
              {selectedSport === "Other" && (
                <div>
                  <label htmlFor="customSport" className="mb-2 block text-sm font-bold">Your sport or game</label>
                  <input id="customSport" value={customSport} onChange={(event) => setCustomSport(event.target.value)} required maxLength={40} placeholder="e.g. Badminton, chess, rugby" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="format" className="mb-2 block text-sm font-bold">Game format</label>
                  <select id="format" name="format" key={selectedSport} className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10">
                    {formats.map((format) => <option key={format} value={format}>{format}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="competitionType" className="mb-2 block text-sm font-bold">Competition type</label>
                  <select id="competitionType" name="competitionType" className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10">
                    <option>League</option><option>Knockout</option><option>Groups + finals</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="categoryName" className="mb-2 block text-sm font-bold">First category</label>
                  <input id="categoryName" name="categoryName" maxLength={40} defaultValue="Open" placeholder="e.g. Men's, Women's, U23" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
                </div>
                <div>
                  <label htmlFor="eventName" className="mb-2 block text-sm font-bold">First event</label>
                  <input id="eventName" name="eventName" maxLength={50} defaultValue="Main event" placeholder="e.g. Singles, 100m, T20" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
                </div>
              </div>
              <div>
                <label htmlFor="teamCount" className="mb-2 block text-sm font-bold">Number of teams</label>
                <select id="teamCount" name="teamCount" className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10">
                  {[4, 6, 8, 10, 12, 16, 20, 24, 32].map((count) => <option key={count} value={count}>{count} teams</option>)}
                </select>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-lg border border-stone-300 px-5 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-50">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b352c] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"><Plus size={16} /> Create tournament</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
