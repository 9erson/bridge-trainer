import { cn } from "@/lib/utils";

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label={"Loading page\u2026"}
      className={cn("flex items-center justify-center py-20", className)}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full border-4",
          "border-muted border-t-primary",
          "animate-spin"
        )}
      />
    </div>
  );
}

export default LoadingSpinner;
