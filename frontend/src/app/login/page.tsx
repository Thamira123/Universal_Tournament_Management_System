"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import UTMSMark from "@/components/utms-mark";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <main className="min-h-screen bg-[#f4f5f2] text-stone-900">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-screen overflow-hidden bg-[#082f28] text-white lg:flex">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-55"
            style={{
              backgroundImage:
                "linear-gradient(115deg, rgba(5,39,31,.88), rgba(5,39,31,.28)), url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1800&q=85')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061e19]/90 via-transparent to-[#061e19]/20" />
          <div className="pointer-events-none absolute -right-24 top-24 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 top-40 h-64 w-64 rounded-full border border-white/10" />
          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <Link href="/" aria-label="UTMS home" className="flex w-fit items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b6ed58] p-2 text-[#082f28]">
                <UTMSMark className="h-full w-full" />
              </span>
              <span>
                <span className="block text-lg font-black tracking-tight">UTMS<span className="text-[#b6ed58]">.</span></span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  Universal Tournament Management
                </span>
              </span>
            </Link>

            <div className="max-w-xl py-12">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d9f4aa]">
                <Trophy size={13} /> One home for every competition
              </p>
              <h1 className="mt-6 text-4xl font-black leading-[1.04] tracking-tight xl:text-6xl">
                Your tournament.<br />
                <span className="text-[#b6ed58]">Your moment.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 xl:text-base">
                Bring teams, fixtures, scores and standings together. Pick up
                where you left off and keep every competition moving.
              </p>
              <div className="mt-9 grid max-w-lg grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/15 bg-[#082f28]/55 p-4 backdrop-blur-sm">
                  <CalendarDays size={18} className="text-[#b6ed58]" />
                  <p className="mt-3 text-sm font-bold">Every fixture</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">Schedules in one place.</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-[#082f28]/55 p-4 backdrop-blur-sm">
                  <ShieldCheck size={18} className="text-[#b6ed58]" />
                  <p className="mt-3 text-sm font-bold">Every team</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">People, rosters and results.</p>
                </div>
              </div>
            </div>

            <p className="text-xs font-medium text-white/50">© 2026 UTMS · Built for the big moments</p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" aria-label="UTMS home" className="flex items-center gap-3 lg:hidden">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b6ed58] p-2 text-[#082f28]">
                  <UTMSMark className="h-full w-full" />
                </span>
                <span>
                  <span className="block text-base font-black">UTMS<span className="text-emerald-700">.</span></span>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.13em] text-stone-500">Tournament management</span>
                </span>
              </Link>
              <Link href="/" className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 transition hover:text-emerald-800">
                <ArrowLeft size={14} /> Back to home
              </Link>
            </div>

            <div className="rounded-[26px] border border-stone-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,40,30,0.08)] sm:p-9">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-800">Welcome back</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#10251e]">Sign in to UTMS</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Continue to your tournament workspace.
              </p>

              <form
                className="mt-8 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  setStatusMessage(
                    "Sign-in is not connected to an authentication service yet.",
                  );
                }}
              >
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-bold text-stone-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-stone-200 bg-[#fafbf9] py-3.5 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-bold text-stone-700">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-stone-200 bg-[#fafbf9] py-3.5 pl-11 pr-12 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-emerald-800"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-stone-500">
                  <input type="checkbox" className="h-4 w-4 rounded border-stone-300 accent-emerald-800" />
                  Remember me
                </label>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b352c] py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 active:scale-[0.99]"
                >
                  Sign in <ArrowRight size={16} />
                </button>
                {statusMessage && (
                  <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-xs font-medium text-amber-900">
                    {statusMessage}
                  </p>
                )}
              </form>

              <p className="mt-7 text-center text-sm text-stone-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-extrabold text-emerald-800 transition hover:text-emerald-950">
                  Create an account
                </Link>
              </p>
            </div>
            <p className="mt-5 text-center text-[10px] font-medium text-stone-400">
              By continuing, you agree to keep your tournament community respectful and fair.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
