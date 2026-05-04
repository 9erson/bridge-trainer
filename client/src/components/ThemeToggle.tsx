import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * ThemeToggle — switches between light and dark mode.
 *
 * Shows Moon in light mode (click to go dark), Sun in dark mode (click to go light).
 * Placed in the Layout sidebar footer and mobile header.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="text-sidebar-foreground hover:bg-sidebar-accent min-h-[44px] min-w-[44px]"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </Button>
  );
}
