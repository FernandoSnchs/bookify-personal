import { Clock, TrendingUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadingStatsBarProps {
  currentPage: number;
  totalPages: number;
  estimatedTimeLeft?: string;
  readingSpeed?: number;
  className?: string;
}

export const ReadingStatsBar = ({
  currentPage,
  totalPages,
  estimatedTimeLeft,
  readingSpeed,
  className,
}: ReadingStatsBarProps) => {
  const percentage = Math.round((currentPage / totalPages) * 100);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 text-xs text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center gap-1">
        <BookOpen className="h-3 w-3" />
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="font-medium">{percentage}%</span>
      </div>

      {estimatedTimeLeft && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{estimatedTimeLeft} left</span>
        </div>
      )}

      {readingSpeed && (
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>{readingSpeed.toFixed(1)} ppm</span>
        </div>
      )}
    </div>
  );
};
