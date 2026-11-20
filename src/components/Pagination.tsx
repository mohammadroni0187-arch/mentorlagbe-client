"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
};

/** 1 ... 4 5 6 ... 20 style-er page list banay. */
const getPages = (page: number, total: number): (number | "gap")[] => {
  const numbers = Array.from(new Set([1, total, page - 1, page, page + 1]))
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  numbers.forEach((n, i) => {
    if (i > 0 && n - numbers[i - 1] > 1) result.push("gap");
    result.push(n);
  });
  return result;
};

const baseBtn =
  "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

export const Pagination = ({ page, totalPages, onChange, disabled = false }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Previous page"
        className={`${baseBtn} border border-indigo-200 bg-white/70 text-slate-700 hover:bg-indigo-50`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPages(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            disabled={disabled}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={`${baseBtn} ${
              item === page
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30"
                : "border border-indigo-200 bg-white/70 text-slate-700 hover:bg-indigo-50"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Next page"
        className={`${baseBtn} border border-indigo-200 bg-white/70 text-slate-700 hover:bg-indigo-50`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;