"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Shield,
  Sparkles,
} from "lucide-react";
import UTMSMark from "@/components/utms-mark";
import {
  getWinProbability,
  sampleTeamHistory,
  sampleTournaments,
} from "@/lib/tournaments";

const matchups = [
  { first: "Sri Lanka", second: "Pakistan", h2hFirst: 3, h2hPlayed: 5, tournament: "3-match ODI series", href: "/tournaments/sl-pakistan-odi-series" },
  { first: "Colombo Strikers", second: "Galle United", h2hFirst: 2, h2hPlayed: 3, tournament: "Colombo Night Series", href: "/tournaments/colombo-night-series" },
  { first: "Kandy Falcons", second: "Jaffna Kings", h2hFirst: 1, h2hPlayed: 2, tournament: "Campus Hoops Cup", href: "/tournaments/campus-hoops-cup" },
];

export default function PredictionsPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f2] text-stone-900">
      <header className="border-b border-white/10 bg-[#082f28] text-white">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b6ed58] p-2 text-[#082f28]"><UTMSMark className="h-full w-full" /></span>
            <span><span className="block text-lg font-black">UTMS<span className="text-[#b6ed58]">.</span></span><span className="hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:block">Tournament management</span></span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold text-white/75 sm:gap-7">
            <Link href="/#tournaments" className="hover:text-white">Tournaments</Link>
            <Link href="/matches" className="hover:text-white">Match Centre</Link>
            <span className="text-[#b6ed58]">Predictions</span>
            <Link href="/#sports" className="hover:text-white">Sports</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-4 pb-14 pt-7 sm:px-8 sm:pt-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-emerald-800"><ArrowLeft size={16} /> Dashboard</Link>
        <section className="relative mt-5 overflow-hidden rounded-[26px] bg-[#0b352c] p-6 text-white sm:p-9">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#d9f4aa]"><Sparkles size={13} /> Form & history</p>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">The numbers behind<br className="hidden sm:block" /> the next big win.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">Compare recent performance and head-to-head records to see a simple estimated win percentage for upcoming matchups.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 sm:min-w-[190px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Model inputs</p>
              <p className="mt-2 text-sm font-bold">Recent form + history</p>
              <p className="mt-1 text-xs text-white/55">Updated with recorded results</p>
            </div>
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-5 flex items-end justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-800">Across the sports</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Featured matchups</h2></div>
            <span className="hidden text-xs text-stone-400 sm:block">Demo data · sample history</span>
          </div>
          <div className="grid gap-4">
            {matchups.map((matchup) => {
              const first = sampleTeamHistory.find((team) => team.team === matchup.first)!;
              const second = sampleTeamHistory.find((team) => team.team === matchup.second)!;
              const probability = getWinProbability(first, second, matchup.h2hFirst, matchup.h2hPlayed);
              const tournament = sampleTournaments.find((item) => item.id === matchup.href.split("/").pop());

              return (
                <article key={matchup.first} className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600">{tournament?.sport}</span>
                        <span className="text-xs text-stone-400">{matchup.tournament}</span>
                      </div>
                      <h3 className="mt-2 text-lg font-black">{matchup.first} <span className="font-medium text-stone-300">vs</span> {matchup.second}</h3>
                    </div>
                    <Link href={matchup.href} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 transition hover:text-emerald-600">Match details <ArrowRight size={14} /></Link>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm"><span className="font-bold">{matchup.first}</span><span className="font-black text-emerald-800">{probability.first}%</span></div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-[#0b8064]" style={{ width: `${probability.first}%` }} /></div>
                      <p className="mt-2 text-[11px] text-stone-500">{first.wins}/{first.played} wins · last 5: {first.recentForm.join(" ")}</p>
                    </div>
                    <span className="mx-auto rounded-md bg-stone-100 px-2 py-1 text-[10px] font-black text-stone-400">VS</span>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm"><span className="font-bold">{matchup.second}</span><span className="font-black text-emerald-800">{probability.second}%</span></div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-stone-100"><div className="ml-auto h-full rounded-full bg-[#b6ed58]" style={{ width: `${probability.second}%` }} /></div>
                      <p className="mt-2 text-[11px] text-stone-500">{second.wins}/{second.played} wins · last 5: {second.recentForm.join(" ")}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4 text-[11px] text-stone-500">
                    <Shield size={13} className="text-emerald-800" />
                    <span>Head-to-head: {matchup.first} {matchup.h2hFirst} — {matchup.h2hPlayed - matchup.h2hFirst} {matchup.second}</span>
                    <span className="mx-1 text-stone-300">·</span>
                    <span>Last {matchup.h2hPlayed} meetings</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <CircleHelp size={19} className="mt-0.5 shrink-0" />
          <div><h2 className="text-sm font-black">Predictions are estimates, not guarantees.</h2><p className="mt-1 text-xs leading-5 text-amber-900">These percentages are calculated from illustrative sample statistics using a simple form and head-to-head weighting. They are not live odds or verified forecasts. Real predictions require reliable results data and sport-specific statistical models.</p></div>
        </aside>
        <footer className="mt-12 flex items-center justify-between border-t border-stone-200 pt-5 text-xs text-stone-500">
          <span>UTMS · Performance insights</span>
          <Link href="/" className="inline-flex items-center gap-1 font-semibold hover:text-emerald-800">Back home <ArrowRight size={14} /></Link>
        </footer>
      </div>
    </main>
  );
}
