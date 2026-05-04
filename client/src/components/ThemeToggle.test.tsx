import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Tests for ThemeToggle — the button that switches between light and dark mode.
 *
 * These verify observable behavior through the public interface:
 * - What icon is rendered (Moon/Sun) based on current theme
 * - What aria-label is applied (describes the *action*, not current state)
 * - What happens when clicked (theme changes)
 */

// Mock lucide-react to provide testable identifiers
vi.mock("lucide-react", () => ({
  Moon: ({ className }: { className?: string }) => (
    <svg data-testid="icon-moon" className={className} />
  ),
  Sun: ({ className }: { className?: string }) => (
    <svg data-testid="icon-sun" className={className} />
  ),
}));

function renderWithTheme(defaultTheme: "light" | "dark" = "light") {
  return render(
    <ThemeProvider defaultTheme={defaultTheme} switchable>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("renders Moon icon in light mode (click to go dark)", () => {
    renderWithTheme("light");
    expect(screen.getByTestId("icon-moon")).toBeDefined();
    expect(screen.queryByTestId("icon-sun")).toBeNull();
  });

  it("renders Sun icon in dark mode (click to go light)", () => {
    renderWithTheme("dark");
    expect(screen.getByTestId("icon-sun")).toBeDefined();
    expect(screen.queryByTestId("icon-moon")).toBeNull();
  });

  it("has aria-label describing the target mode in light mode", () => {
    renderWithTheme("light");
    const button = screen.getByLabelText("Switch to dark mode");
    expect(button).toBeDefined();
  });

  it("has aria-label describing the target mode in dark mode", () => {
    renderWithTheme("dark");
    const button = screen.getByLabelText("Switch to light mode");
    expect(button).toBeDefined();
  });

  it("toggles theme from light to dark on click", () => {
    renderWithTheme("light");
    const button = screen.getByLabelText("Switch to dark mode");

    fireEvent.click(button);

    // After click, should show Sun (currently dark) and offer to go light
    expect(screen.getByTestId("icon-sun")).toBeDefined();
    expect(screen.getByLabelText("Switch to light mode")).toBeDefined();
  });

  it("toggles theme from dark to light on click", () => {
    renderWithTheme("dark");
    const button = screen.getByLabelText("Switch to light mode");

    fireEvent.click(button);

    expect(screen.getByTestId("icon-moon")).toBeDefined();
    expect(screen.getByLabelText("Switch to dark mode")).toBeDefined();
  });
});
