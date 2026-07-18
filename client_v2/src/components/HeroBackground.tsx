"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Data (pure module-level constants) ─────────────────────────────────────

const JOB_DATA = [
  { title: "Senior Frontend Engineer", salary: "৳120k–৳160k", type: "Remote" },
  { title: "Backend Developer",        salary: "৳100k–৳140k", type: "Hybrid" },
  { title: "Product Designer",         salary: "৳90k–৳130k",  type: "Remote" },
  { title: "ML Engineer",              salary: "৳140k–৳180k", type: "Onsite" },
  { title: "DevOps Engineer",          salary: "৳110k–৳150k", type: "Remote" },
  { title: "iOS Developer",            salary: "৳105k–৳145k", type: "Hybrid" },
  { title: "Data Scientist",           salary: "৳115k–৳155k", type: "Remote" },
  { title: "Cloud Architect",          salary: "৳130k–৳170k", type: "Onsite" },
  { title: "Security Engineer",        salary: "৳125k–৳165k", type: "Hybrid" },
  { title: "Android Developer",        salary: "৳100k–৳140k", type: "Remote" },
  { title: "Full Stack Engineer",      salary: "৳110k–৳150k", type: "Remote" },
  { title: "Product Manager",          salary: "৳120k–৳155k", type: "Hybrid" },
] as const;

// ─── Slot positions ──────────────────────────────────────────────────────────
//
// 6 fixed slots: 3 per side (left / right), each on its own tier (Top/Mid/Bot).
// Rule: no two chips may share the same tier at the same time.

type Side = "left" | "right";

interface SlotConfig {
  id: number;
  side: Side;
  tier: number; // 0 = Top | 1 = Mid | 2 = Bot
  top: string;
  inset: string;
}

const SLOTS: SlotConfig[] = [
  { id: 0, side: "left",  tier: 0, top: "8%",  inset: "3%" },
  { id: 1, side: "left",  tier: 1, top: "42%", inset: "6%" },
  { id: 2, side: "left",  tier: 2, top: "74%", inset: "3%" },
  { id: 3, side: "right", tier: 0, top: "14%", inset: "3%" },
  { id: 4, side: "right", tier: 1, top: "48%", inset: "6%" },
  { id: 5, side: "right", tier: 2, top: "78%", inset: "3%" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActiveChip {
  instanceId: number;
  slotId: number;
  job: (typeof JOB_DATA)[number];
  spawnedAt: number;
}

// ─── Pure helper functions (no side-effects, safe at module scope) ────────────

function getOccupiedTiers(chips: ActiveChip[]): Set<number> {
  return new Set(chips.map((c) => SLOTS[c.slotId].tier));
}

function getAvailableSlots(chips: ActiveChip[]): SlotConfig[] {
  const occupiedSlots = new Set(chips.map((c) => c.slotId));
  const occupiedTiers = getOccupiedTiers(chips);
  return SLOTS.filter((s) => !occupiedSlots.has(s.id) && !occupiedTiers.has(s.tier));
}

// ─── Chip component ──────────────────────────────────────────────────────────

interface ChipProps {
  job: (typeof JOB_DATA)[number];
  slot: SlotConfig;
}

function JobChip({ job, slot }: ChipProps) {
  const isLeft = slot.side === "left";

  const posStyle: React.CSSProperties = {
    top: slot.top,
    ...(isLeft ? { left: slot.inset } : { right: slot.inset }),
  };

  return (
    <motion.div
      style={posStyle}
      className="absolute group cursor-default"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <div
        style={{ transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
        className="
          px-4 py-3 rounded-xl
          border border-gray-200/70
          bg-background/80 backdrop-blur-md
          shadow-sm
          min-w-[170px] max-w-[220px]
          select-none
          group-hover:[border-color:var(--primary)]
          group-hover:[box-shadow:0_0_18px_-2px_color-mix(in_srgb,var(--primary)_40%,transparent)]
        "
      >
        <p className="text-sm font-semibold text-foreground leading-tight truncate">
          {job.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
            {job.salary}
          </span>
          <span className="font-mono text-[10px] text-primary uppercase tracking-wider font-semibold">
            · {job.type}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_CHIPS = 3;
const TICK_MIN_MS = 1800;
const TICK_MAX_MS = 2800;

// ─── Main component ──────────────────────────────────────────────────────────

export default function HeroBackground() {
  const [chips, setChips] = useState<ActiveChip[]>([]);

  // Refs that persist across renders without triggering re-renders
  const instanceCounterRef = useRef(0);
  const usedJobsRef = useRef<Set<number>>(new Set());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // All impure logic (Math.random, Date.now) is confined here — never during render.

    function pickJob(): (typeof JOB_DATA)[number] {
      const allIndices = JOB_DATA.map((_, i) => i);
      const unused = allIndices.filter((i) => !usedJobsRef.current.has(i));
      const pool = unused.length > 0 ? unused : allIndices;
      const idx = pool[Math.floor(Math.random() * pool.length)];

      usedJobsRef.current.add(idx);
      if (usedJobsRef.current.size > Math.floor(JOB_DATA.length * 0.6)) {
        usedJobsRef.current.clear();
      }

      return JOB_DATA[idx];
    }

    function pickRandom<T>(arr: T[]): T {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function tick() {
      setChips((prev) => {
        if (prev.length >= MAX_CHIPS) {
          // Remove the oldest chip
          return [...prev].sort((a, b) => a.spawnedAt - b.spawnedAt).slice(1);
        }

        const available = getAvailableSlots(prev);
        if (available.length === 0) return prev;

        const slot = pickRandom(available);
        const job = pickJob();
        const newChip: ActiveChip = {
          instanceId: ++instanceCounterRef.current,
          slotId: slot.id,
          job,
          spawnedAt: Date.now(),
        };
        return [...prev, newChip];
      });

      scheduleNext();
    }

    function scheduleNext() {
      const delay = TICK_MIN_MS + Math.random() * (TICK_MAX_MS - TICK_MIN_MS);
      timeoutRef.current = setTimeout(tick, delay);
    }

    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    // Hidden on screens smaller than lg — chips don't fit narrow layouts
    <div
      aria-hidden="true"
      className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none"
    >
      <AnimatePresence>
        {chips.map((chip) => (
          <JobChip
            key={chip.instanceId}
            job={chip.job}
            slot={SLOTS[chip.slotId]}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
