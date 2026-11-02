import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLProps<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, className, showLabel = false, ...props }, ref) => {
    const percentage = Math.round((value / max) * 100);

    return (
      <div
        className={cn("w-full flex items-center gap-2", className)}
        ref={ref}
        {...props}
      >
        <div className="relative w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {percentage}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
