"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// Types
interface Slide {
  id: number;
  category: string;
  categoryType: "blue" | "red";
  title: string;
  subtitle: string;
  presenterNotes: string;
}

interface BenchmarkMetric {
  name: string;
  unit: string;
  before: number;
  after: number;
  peakAfter: number;
  accent: "blue" | "red";
  inverted?: boolean; // lower is better
}

export default function PresentationPage() {
  // Navigation & View States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<"slide" | "grid">("slide");
  const [showNotes, setShowNotes] = useState(false);
  const [isSurgeActive, setIsSurgeActive] = useState(false);

  // Presentation Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Slides metadata
  const slides: Slide[] = [
    {
      id: 1,
      category: "Architecture Keynote",
      categoryType: "blue",
      title: "Resilient Systems at Scale",
      subtitle:
        "Senior engineering patterns for low-latency, mission-critical distributed platforms.",
      presenterNotes:
        "Welcome team. Today we're breaking down how we overhauled our core architecture—moving from monolithic choke points to an edge-first distributed model while cutting P99 latency down to sub-20ms.",
    },
    {
      id: 2,
      category: "System Blueprint",
      categoryType: "red",
      title: "Decoupled Architecture: Blue & Red Planes",
      subtitle:
        "Separating the persistent control plane from high-velocity edge execution boundaries.",
      presenterNotes:
        "Notice the fundamental separation here: The Blue Plane guarantees transactional consistency and event persistence. The Red Plane handles untrusted ingress, edge caching, and fault containment.",
    },
    {
      id: 3,
      category: "Production Benchmarks",
      categoryType: "blue",
      title: "Telemetry & Performance Profiling",
      subtitle:
        "Real-world production measurements before and after optimization under peak stress.",
      presenterNotes:
        "These aren't synthetic benchmarks. Under a 5x traffic surge, our new event pipeline maintains a 94% latency reduction and near-zero error budget burn.",
    },
    {
      id: 4,
      category: "Engineering Principles",
      categoryType: "red",
      title: "Senior Guardrails & Best Practices",
      subtitle:
        "Core design mandates that prevent cascading failure and minimize cognitive overhead.",
      presenterNotes:
        "These four tenets guide every pull request and architectural design review: enforce idempotency, fail early, prioritize observability, and ruthlessly isolate failure domains.",
    },
    {
      id: 5,
      category: "Deployment Roadmap",
      categoryType: "blue",
      title: "Execution Milestones & Production Plan",
      subtitle:
        "Four-phase delivery framework for zero-downtime global rollout and verification.",
      presenterNotes:
        "We are currently in Phase 2. The database replication pipeline is verified. Next milestone is the edge runtime cutover. Questions are welcome!",
    },
  ];

  const totalSlides = slides.length;

  // Slide navigation
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (viewMode === "grid") setViewMode("slide");
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focusing on an input element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key.toLowerCase() === "n") {
        setShowNotes((prev) => !prev);
      } else if (e.key.toLowerCase() === "g") {
        setViewMode((prev) => (prev === "slide" ? "grid" : "slide"));
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Presentation Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Benchmark Metrics Data
  const benchmarks: BenchmarkMetric[] = [
    {
      name: "Throughput Capacity",
      unit: "req/s",
      before: 2400,
      after: 18500,
      peakAfter: 24200,
      accent: "blue",
    },
    {
      name: "P99 API Latency",
      unit: "ms",
      before: 340,
      after: 18,
      peakAfter: 24,
      accent: "red",
      inverted: true,
    },
    {
      name: "System Error Rate",
      unit: "%",
      before: 1.85,
      after: 0.02,
      peakAfter: 0.05,
      accent: "red",
      inverted: true,
    },
    {
      name: "Node Memory Footprint",
      unit: "MB",
      before: 780,
      after: 142,
      peakAfter: 195,
      accent: "blue",
      inverted: true,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden selection:bg-blue-600 selection:text-white"
    >
      {/* Dynamic Top Progress Bar with Blue & Red gradient */}
      <div className="w-full h-1.5 bg-slate-900 relative">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-red-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(59,130,246,0.5)]"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* Header / Presenter Control Bar */}
      <header className="px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Brand & Speaker Role Badge */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-950 border border-blue-600/40 text-blue-400 font-bold text-sm shadow-inner">
              <span>S</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="text-blue-400">Senior Dev</span>
                <span className="text-slate-600">•</span>
                <span className="text-red-400">Tech Lead</span>
              </div>
              <h1 className="text-sm font-medium text-slate-200">
                System Engineering & Architecture Deck
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Slide indicator */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-300">
          <span className="text-blue-400 font-semibold">
            Slide {String(currentSlide + 1).padStart(2, "0")}
          </span>
          <span className="text-slate-600">/</span>
          <span>{String(totalSlides).padStart(2, "0")}</span>
          <span className="mx-1 text-slate-700">|</span>
          <span className="text-slate-400 truncate max-w-[200px]">
            {slides[currentSlide].title}
          </span>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Presentation Timer */}
          <div
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            title="Click to pause/resume timer"
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isTimerRunning ? "bg-red-500 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span className="text-slate-300">{formatTimer(timerSeconds)}</span>
          </div>

          {/* Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showNotes
                ? "bg-red-950/60 border-red-500/50 text-red-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
            title="Toggle Speaker Notes (N)"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* Grid View Toggle */}
          <button
            onClick={() =>
              setViewMode((prev) => (prev === "slide" ? "grid" : "slide"))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              viewMode === "grid"
                ? "bg-blue-950/60 border-blue-500/50 text-blue-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
            title="Overview Grid (G)"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <span className="hidden sm:inline">Overview</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Toggle Fullscreen (F)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isFullscreen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-8 relative">
        {viewMode === "grid" ? (
          /* Grid / Deck Overview Mode */
          <div className="w-full max-w-5xl mx-auto py-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Presentation Slides Overview
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any slide to jump directly to it.
                </p>
              </div>
              <button
                onClick={() => setViewMode("slide")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-md"
              >
                Back to Presentation
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {slides.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => goToSlide(idx)}
                  className={`cursor-pointer group relative p-5 rounded-xl border transition-all duration-200 ${
                    idx === currentSlide
                      ? "bg-slate-900 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-2 ring-blue-500/30"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        s.categoryType === "blue"
                          ? "bg-blue-950 text-blue-400 border border-blue-800/40"
                          : "bg-red-950 text-red-400 border border-red-800/40"
                      }`}
                    >
                      {s.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500 group-hover:text-slate-300">
                      #{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {s.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single Slide Presentation Stage */
          <div className="w-full max-w-4xl mx-auto flex flex-col justify-center">
            {/* Slide Card Container */}
            <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
              {/* Decorative Subtle Blue and Red Glow Accents */}
              <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 bg-red-600/10 rounded-full blur-3xl" />

              {/* Slide Meta Badge & Counter */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                      slides[currentSlide].categoryType === "blue"
                        ? "bg-blue-950/80 text-blue-400 border-blue-800/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        : "bg-red-950/80 text-red-400 border-red-800/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        slides[currentSlide].categoryType === "blue"
                          ? "bg-blue-400"
                          : "bg-red-400"
                      }`}
                    />
                    {slides[currentSlide].category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                  <span className="text-slate-300 font-bold">
                    0{currentSlide + 1}
                  </span>
                  <span>/</span>
                  <span>0{totalSlides}</span>
                </div>
              </div>

              {/* Dynamic Slide Contents */}
              <div className="relative z-10 min-h-[380px] flex flex-col justify-center">
                {/* SLIDE 1: Title & Keynote Intro */}
                {currentSlide === 0 && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="space-y-3">
                      <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-red-400 bg-red-950/50 border border-red-900/60">
                        CONFIDENTIAL • INTERNAL TECH TALK
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Scalable Architecture{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-red-500">
                          & Edge Resilience
                        </span>
                      </h2>
                      <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                        How senior engineering teams eliminate single points of
                        failure, tame concurrency, and deliver ultra-predictable
                        P99 response curves.
                      </p>
                    </div>

                    {/* Quick Metric Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-900/40 hover:border-blue-700/60 transition-colors">
                        <div className="text-2xl font-bold text-blue-400 font-mono">
                          99.995%
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-1">
                          Core SLA Availability
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-red-900/40 hover:border-red-700/60 transition-colors">
                        <div className="text-2xl font-bold text-red-400 font-mono">
                          18ms P99
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-1">
                          Edge Global Latency
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-900/40 hover:border-blue-700/60 transition-colors">
                        <div className="text-2xl font-bold text-blue-400 font-mono">
                          10x Scale
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-1">
                          Zero Infrastructure Sprawl
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 2: Blue vs Red Architecture Planes */}
                {currentSlide === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        System Boundaries: Blue & Red Planes
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Decoupling stateful consensus from stateless edge routing
                        for uncompromised throughput.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      {/* The Blue Plane Card */}
                      <div className="p-5 rounded-xl bg-blue-950/20 border border-blue-600/30 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              The Blue Plane
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              Core State
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-slate-100 mb-3">
                            Transactional Ledger & Storage
                          </h3>
                          <ul className="space-y-2.5 text-xs text-slate-300">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 font-bold">✓</span>
                              <span>
                                Distributed consensus with Raft-backed storage
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 font-bold">✓</span>
                              <span>
                                Strictly typed event bus & schema enforcement
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 font-bold">✓</span>
                              <span>
                                Multi-region asynchronous data replication
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 border-t border-blue-900/40 text-[11px] font-mono text-blue-300/80">
                          Focus: Correctness & Persistence
                        </div>
                      </div>

                      {/* The Red Plane Card */}
                      <div className="p-5 rounded-xl bg-red-950/20 border border-red-600/30 flex flex-col justify-between hover:border-red-500/50 transition-colors">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              The Red Plane
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              Fault Domain
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-slate-100 mb-3">
                            Edge Ingress & Blast Mitigation
                          </h3>
                          <ul className="space-y-2.5 text-xs text-slate-300">
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 font-bold">✓</span>
                              <span>
                                Sub-millisecond JWT & edge authorization checks
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 font-bold">✓</span>
                              <span>
                                Circuit-breakers with automatic request shedding
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 font-bold">✓</span>
                              <span>
                                Isolated tenancy sandboxes preventing noisy neighbors
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 border-t border-red-900/40 text-[11px] font-mono text-red-300/80">
                          Focus: Velocity & Failure Isolation
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 3: Telemetry Benchmarks */}
                {currentSlide === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                          Production Telemetry Profile
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                          Empirical gains measured across distributed load
                          clusters.
                        </p>
                      </div>

                      {/* Interactive Surge Mode Toggle */}
                      <button
                        onClick={() => setIsSurgeActive(!isSurgeActive)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                          isSurgeActive
                            ? "bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSurgeActive
                              ? "bg-white animate-ping"
                              : "bg-red-500"
                          }`}
                        />
                        <span>
                          {isSurgeActive
                            ? "Simulated Surge (5x Load Active)"
                            : "Simulate 5x Peak Surge"}
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {benchmarks.map((b) => {
                        const activeVal = isSurgeActive ? b.peakAfter : b.after;
                        const isBetter = b.inverted
                          ? activeVal < b.before
                          : activeVal > b.before;

                        return (
                          <div
                            key={b.name}
                            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-300">
                                {b.name}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                  b.accent === "blue"
                                    ? "bg-blue-950 text-blue-400 border border-blue-800/40"
                                    : "bg-red-950 text-red-400 border border-red-800/40"
                                }`}
                              >
                                {isBetter ? "OPTIMIZED" : "STABLE"}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-2xl font-bold font-mono text-white">
                                {activeVal.toLocaleString()}{" "}
                                <span className="text-xs font-normal text-slate-400">
                                  {b.unit}
                                </span>
                              </span>
                              <span className="text-xs text-slate-500 line-through font-mono">
                                {b.before.toLocaleString()} {b.unit}
                              </span>
                            </div>

                            {/* Relative comparison bar */}
                            <div className="mt-3 w-full bg-slate-800/70 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  b.accent === "blue"
                                    ? "bg-blue-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: b.inverted
                                    ? `${Math.max(
                                        8,
                                        (activeVal / b.before) * 100
                                      )}%`
                                    : `${Math.min(
                                        100,
                                        (activeVal / (b.peakAfter * 1.1)) * 100
                                      )}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SLIDE 4: Senior Developer Principles */}
                {currentSlide === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Senior Engineering Guardrails
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Core mental models that differentiate fragile hacks from
                        bulletproof systems.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-blue-900/30 hover:border-blue-600/50 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 font-bold text-xs mb-3 border border-blue-800/40">
                          01
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100">
                          Enforce Strict Idempotency
                        </h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          Every write mutation and webhook endpoint must be safely
                          replayable without causing state corruption or phantom records.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/60 border border-red-900/30 hover:border-red-600/50 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-red-950 flex items-center justify-center text-red-400 font-bold text-xs mb-3 border border-red-800/40">
                          02
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100">
                          Fail Early & Visibly
                        </h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          Do not silently trap exceptions. Set tight network timeouts,
                          trip circuit-breakers immediately, and trigger telemetry alarms.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/60 border border-blue-900/30 hover:border-blue-600/50 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 font-bold text-xs mb-3 border border-blue-800/40">
                          03
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100">
                          Telemetry as a First-Class Citizen
                        </h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          Features without structured traces and metrics do not ship to
                          production. Observability is not an afterthought.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/60 border border-red-900/30 hover:border-red-600/50 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-red-950 flex items-center justify-center text-red-400 font-bold text-xs mb-3 border border-red-800/40">
                          04
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100">
                          Bound the Blast Radius
                        </h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          Partition connections, pool limits, and background worker queues
                          so a single noisy tenant cannot drown the cluster.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 5: Roadmap & Wrap-up */}
                {currentSlide === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Execution Roadmap & Deliverables
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Timeline towards full production certification and multi-region
                        readiness.
                      </p>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-blue-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <div>
                            <div className="text-sm font-semibold text-slate-100">
                              Phase 1: Event Ingestion Pipeline
                            </div>
                            <div className="text-xs text-slate-400">
                              Schema registry & Raft persistent broker
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-blue-950 text-blue-400 border border-blue-800/40 font-semibold">
                          COMPLETED
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-red-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                          <div>
                            <div className="text-sm font-semibold text-slate-100">
                              Phase 2: Zero-Downtime Data Migration
                            </div>
                            <div className="text-xs text-slate-400">
                              Dual-write validation and shadow-traffic testing
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-red-950 text-red-400 border border-red-800/40 font-semibold">
                          IN PROGRESS
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                          <div>
                            <div className="text-sm font-semibold text-slate-300">
                              Phase 3: Edge Security & Failover Mesh
                            </div>
                            <div className="text-xs text-slate-500">
                              Automated chaos injection and self-healing routes
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 font-semibold">
                          PLANNED Q3
                        </span>
                      </div>
                    </div>

                    {/* Summary callout */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-red-950/40 border border-slate-800 flex items-center justify-between">
                      <div className="text-xs text-slate-300">
                        <span className="font-bold text-white">Summary:</span> Keep
                        systems simple, enforce rigid boundaries, and design for
                        resilience from day one.
                      </div>
                      <div className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer ml-4 whitespace-nowrap">
                        Open Q&A →
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Presenter Notes Collapsible Box */}
            {showNotes && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-red-900/30 text-xs text-slate-300 backdrop-blur-md animate-fadeIn">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Presenter Talking Points (Slide {currentSlide + 1})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Press &apos;N&apos; to hide
                  </span>
                </div>
                <p className="leading-relaxed text-slate-200">
                  {slides[currentSlide].presenterNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Floating Navigation Toolbar */}
      <footer className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky bottom-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Previous Slide Button */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentSlide === 0
                ? "opacity-30 cursor-not-allowed bg-slate-900 text-slate-600"
                : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 shadow-sm"
            }`}
          >
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Interactive Slide Dots */}
          <div className="flex items-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                title={`Go to slide ${idx + 1}: ${s.title}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? "w-8 h-2.5 bg-gradient-to-r from-blue-500 to-red-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                    : "w-2.5 h-2.5 bg-slate-800 hover:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Next Slide Button */}
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentSlide === totalSlides - 1
                ? "opacity-30 cursor-not-allowed bg-slate-900 text-slate-600"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]"
            }`}
          >
            <span className="hidden sm:inline">
              {currentSlide === totalSlides - 1 ? "Finish" : "Next"}
            </span>
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Hotkeys helper footer */}
        <div className="hidden sm:flex justify-center items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              ←
            </kbd>{" "}
            /{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              →
            </kbd>{" "}
            navigate
          </span>
          <span>•</span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              N
            </kbd>{" "}
            presenter notes
          </span>
          <span>•</span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              G
            </kbd>{" "}
            grid overview
          </span>
          <span>•</span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              F
            </kbd>{" "}
            fullscreen
          </span>
        </div>
      </footer>
    </div>
  );
}
