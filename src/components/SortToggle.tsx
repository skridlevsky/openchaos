"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SortOrder } from "@/lib/github";

interface SortToggleProps {
  currentSort: SortOrder;
}

export function SortToggle({ currentSort }: SortToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sort: SortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
      
    if (sort === "votes") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
      
    const query = params.toString();
    router.push(query ? `?${query}` : "/", { scroll: false });
  };

  const sortOptions: { value: SortOrder; label: string }[] = [
    { value: "votes", label: "Most Votes" },
    { value: "recent", label: "Most Recent" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
      {sortOptions.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleSort(value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            currentSort === value
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
