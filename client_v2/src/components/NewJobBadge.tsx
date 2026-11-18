import { isRecentlyPosted } from "../lib/utils";

export default function NewJobBadge({ firstSeen }: { firstSeen: string }) {
  if (!isRecentlyPosted(firstSeen)) return null;

  return (
    <span className="inline-flex w-fit shrink-0 items-center rounded border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-primary">
      NEW
    </span>
  );
}
