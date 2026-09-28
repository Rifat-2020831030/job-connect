"use client";

import { Loader2 } from "lucide-react";

export interface TrackerStatsData {
  total: number;
  statuses: {
    APPLIED: number;
    INTERVIEWING: number;
    OFFER: number;
    REJECTED: number;
    PENDING_CONFIRMATION: number;
    [key: string]: number; // allow index signature for dynamic updates
  };
}

interface TrackerStatsProps {
  stats: TrackerStatsData | null;
  loading: boolean;
}

export default function TrackerStats({ stats, loading }: TrackerStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-center min-h-[90px]">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Applied" value={stats.total} />
      <StatCard label="Interviewing" value={stats.statuses.INTERVIEWING || 0} />
      <StatCard label="Offers" value={stats.statuses.OFFER || 0} />
      <StatCard label="Rejected" value={stats.statuses.REJECTED || 0} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="text-sm font-medium text-gray-500 mb-1">{label}</h4>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">
        {value}
      </div>
    </div>
  );
}
