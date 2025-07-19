"use client";

import { useMemo } from "react";

interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
  className?: string;
}

export default function ProgressBar({
  completed,
  total,
  label = "進捗",
  className = "",
}: ProgressBarProps) {
  const percentage = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }, [completed, total]);

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 60) return "bg-yellow-500";
    if (percent >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {completed}/{total} ({percentage}%)
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${getProgressColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage === 100 && (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            role="img"
            aria-label="完了"
          >
            <title>完了</title>
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">完了!</span>
        </div>
      )}
    </div>
  );
}
