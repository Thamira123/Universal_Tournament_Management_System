"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, CircleDot, MapPin, Shield, Sparkles } from "lucide-react";
import UTMSMark from "@/components/utms-mark";
import TournamentWorkspace from "./workspace";
import {
  getWinProbability,
  sampleSeriesMatches,
  sampleTeamHistory,
  sampleTournaments,
  useCreatedTournaments,
  type TeamHistory,
} from "@/lib/tournaments";

function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-[#082f28] text-white">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b6ed58] p-2 text-[#082f28]"><UTMSMark className="h-full w-full" /></span>
          <span><span className="block text-lg font-black">UTMS<span className="text-[#b6ed58]">.</span></span><span className="hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:block">Tournament management</span></span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold text-white/75 sm:gap-7">
          <Link href="/#tournaments" className="hover:text-white">Tournaments</Link>
          <Link href="/matches" className="hover:text-white">Match Centre</Link>
          <Link href="/predictions" className="hover:text-white">Predictions</Link>
          <Link href="/#sports" className="hover:text-white">Sports</Link>
        </nav>
      </div>
    </header>
  );
}

function FormDots({ results }: { results: ("W" | "L" | "D")[] }) {
  return <div className="flex gap-1.5">{results.map((result, index) => <span key={`${result}-${index}`} className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black text-white ${result === "W" ? "bg-emerald-600" : result === "L" ? "bg-rose-500" : "bg-stone-400"}`}>{result}</span>)}</div>;
}

function TeamFormCard({ team, percent, side, history }: { team: string; percent: number; side: "left" | "right"; history: TeamHistory }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className={`flex items-start justify-between gap-3 ${side === "right" ? "flex-row-reverse text-right" : ""}`}>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${side === "left" ? "bg-sky-50 text-sky-800" : "bg-emerald-50 text-emerald-800"}`}><Shield size={24} /></div>
        <div className={side === "right" ? "text-right" : ""}><p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Win chance</p><p className="text-3xl font-black tracking-tight text-[#0b352c]">{percent}<span className="text-lg">%</span></p></div>
      </div>
      <h3 className="mt-4 text-lg font-black">{team}</h3>
      <p className="mt-1 text-xs text-stone-500">{history.wins} wins from last {history.played} matches · sample data</p>
      <div className={`mt-4 flex items-center justify-between border-t border-stone-100 pt-3 ${side === "right" ? "flex-row-reverse" : ""}`}><span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Recent form</span><FormDots results={history.recentForm} /></div>
    </article>
  );
}

const tournamentCovers: Record<string, string> = {
  Cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=85",
  Football: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=85",
  Basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=85",
  Volleyball: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1600&q=85",
  Esports: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=85",
};

export default function TournamentDetailsPage() {
  const params = useParams<{ slug: string }>();
  const savedTournaments = useCreatedTournaments();
  const tournament = savedTournaments.find((item) => item.id === params.slug)
    ?? sampleTournaments.find((item) => item.id === params.slug);

  if (!tournament) {
    return (
      <main className="min-h-screen bg-[#f4f5f2]">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-3xl font-black">Tournament not found</h1><p className="mt-3 text-stone-500">This tournament may have been removed or was created in another browser.</p><Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b352c] px-5 py-3 text-sm font-bold text-white"><ArrowLeft size={16} /> Back to tournaments</Link></div>
      </main>
    );
  }

  const isSeries = tournament.id === "sl-pakistan-odi-series";
  const isSavedTournament = savedTournaments.some((item) => item.id === tournament.id);
  const sriLanka = sampleTeamHistory[0];
  const pakistan = sampleTeamHistory[1];
  const probability = getWinProbability(sriLanka, pakistan, 3, 5);
  const coverImage = tournamentCovers[tournament.sport] ?? tournamentCovers.Cricket;

  return (
    <main className="min-h-screen bg-[#f4f5f2] text-stone-900">
      <SiteHeader />
      <div className="mx-auto max-w-[1180px] px-4 pb-14 pt-6 sm:px-8 sm:pt-9">
        <Link href="/#tournaments" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-emerald-800"><ArrowLeft size={16} /> All tournaments</Link>
        <section className="relative mt-5 overflow-hidden rounded-[26px] bg-[#0b352c] p-6 text-white sm:p-9">
          <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,39,31,.92), rgba(5,39,31,.30)), url("${coverImage}")` }} />
          <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{tournament.sport}</span><span className="rounded-full bg-[#b6ed58] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#082f28]">{isSeries ? "Demo series" : tournament.status}</span></div><h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">{tournament.name}</h1><p className="mt-3 text-sm font-medium text-white/65">{tournament.format} <span className="mx-1 text-white/30">·</span> {tournament.teams} teams <span className="mx-1 text-white/30">·</span> {tournament.date}</p></div>
            {isSeries && <Link href="/predictions" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b6ed58] px-5 py-3 text-sm font-extrabold text-[#082f28] transition hover:bg-[#c7fa74]"><Sparkles size={16} /> View predictions</Link>}
          </div>
        </section>

        {isSeries ? (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              {[["SERIES SCORE", "Sri Lanka 1 — 0 Pakistan", "Match 2 is in progress"], ["NEXT FIXTURE", "Match 3 · Oct 15", "R. Premadasa Stadium"], ["HEAD TO HEAD", "Sri Lanka 3 — 2 Pakistan", "Last 5 series meetings · sample"]].map(([title, value, detail]) => <article key={title} className="rounded-2xl border border-stone-200 bg-white p-5"><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-stone-400">{title}</p><p className="mt-2 text-base font-black sm:text-lg">{value}</p><p className="mt-1 text-xs text-stone-500">{detail}</p></article>)}
            </section>
            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <section>
                <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-800">Every game, one place</p><h2 className="mt-1 text-2xl font-black">Series fixtures</h2></div><span className="text-xs font-semibold text-stone-400">3 matches</span></div>
                <div className="space-y-3">
                  {sampleSeriesMatches.map((match) => <article key={match.number} className="rounded-2xl border border-stone-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">ODI · Match {match.number}</p><h3 className="mt-1 font-black">{match.status === "Live" ? "Sri Lanka vs Pakistan" : `Match ${match.number}: Sri Lanka vs Pakistan`}</h3></div><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${match.status === "Live" ? "bg-rose-50 text-rose-700" : match.status === "Completed" ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>{match.status === "Live" && <CircleDot size={11} />}{match.status}</span></div>
                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-[#f5f6f3] p-4"><div><p className="text-xs font-semibold text-stone-500">Sri Lanka</p><p className="mt-1 text-lg font-black">{match.sriLankaScore ?? "—"}</p></div><span className="px-2 text-[10px] font-black text-stone-300">VS</span><div className="text-right"><p className="text-xs font-semibold text-stone-500">Pakistan</p><p className="mt-1 text-lg font-black">{match.pakistanScore ?? "—"}</p></div></div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><span className={match.result ? "font-bold text-emerald-800" : "font-semibold text-stone-600"}>{match.result ?? match.note ?? "Match scheduled"}</span><span className="inline-flex items-center gap-1 text-stone-400"><CalendarDays size={13} />{match.date}</span></div>
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-stone-400"><MapPin size={12} />{match.venue}</p>
                    {match.note && match.result && <p className="mt-2 text-[11px] text-stone-500">{match.note}</p>}
                  </article>)}
                </div>
              </section>
              <aside className="lg:sticky lg:top-6">
                <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-800">History meets form</p><h2 className="mt-1 text-2xl font-black">Match prediction</h2><p className="mt-1 text-xs text-stone-500">Estimated from recent form and head-to-head history.</p></div>
                <div className="grid gap-3"><TeamFormCard team="Sri Lanka" percent={probability.first} side="left" history={sriLanka} /><TeamFormCard team="Pakistan" percent={probability.second} side="right" history={pakistan} /></div>
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><p className="font-bold">Sample prediction, not a live forecast.</p><p className="mt-1 text-amber-800">This demo uses sample match history. Connect verified results and sport-specific models for real tournament predictions.</p></div>
                <Link href="/predictions" className="mt-4 flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 text-sm font-bold transition hover:border-emerald-300">See predictions across sports <ChevronRight size={17} /></Link>
              </aside>
            </div>
          </>
        ) : isSavedTournament ? (
          <TournamentWorkspace tournament={tournament} />
        ) : (
          <section className="mt-7 grid gap-7 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="text-xl font-black">Sample tournament</h2><p className="mt-2 text-sm leading-6 text-stone-500">This is an example competition. Create your own tournament to configure organizations, people, sports, events, stages, groups, scoring and awards.</p><Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b352c] px-5 py-3 text-sm font-bold text-white">Create your tournament <ArrowRight size={15} /></Link></div>
            <aside className="rounded-2xl bg-[#e8eddf] p-6"><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Competition info</p><p className="mt-2 text-lg font-black">{tournament.format}</p><p className="mt-1 text-sm text-stone-600">{tournament.teams} participating teams</p><p className="mt-5 flex items-center gap-2 text-sm font-semibold text-stone-600"><CalendarDays size={16} /> {tournament.date}</p></aside>
          </section>
        )}

        <footer className="mt-12 flex items-center justify-between border-t border-stone-200 pt-5 text-xs text-stone-500"><span>UTMS · Tournament management</span><Link href="/" className="inline-flex items-center gap-1 font-semibold hover:text-emerald-800">Home <ChevronRight size={14} /></Link></footer>
      </div>
    </main>
  );
}
