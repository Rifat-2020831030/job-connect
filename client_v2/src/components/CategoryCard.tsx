import Link from "next/link";
import React from "react";

export interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  href?: string;
}

export default function CategoryCard({
  title,
  icon,
  count,
  href = "#",
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group card card-hover flex flex-col items-center text-center h-full justify-between"
    >
      <div className="flex flex-col items-center">
        <div className="size-12 group-hover:bg-primary/10 rounded flex items-center justify-center text-2xl mb-4 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h3>
      </div>
      <p className="text-meta mt-4">{count} Jobs</p>
    </Link>
  );
}
