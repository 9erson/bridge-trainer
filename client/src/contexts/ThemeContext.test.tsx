import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";

/**
 * Tests for ThemeProvider's switchable theme behavior.
 *
 * These verify the public interface: { theme, toggleTheme, switchable }.
 * The ThemeContext infrastructure is already built; these tests confirm
 * that enabling switchable=true produces the correct observable behavior.
 */

describe("ThemeProvider — switchable behavior", () => {
  beforeEach(() => {
    // jsdom may not provide localStorage without a URL; polyfill if missing
    if (typeof localStorage === "undefined" || !localStorage.getItem) {
      const store: Record<string, string> = {};
      vi.stubGlobal("localStorage", {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          Object.keys(store).forEach(k => delete store[k]);
        },
        get length() {
          return Object.keys(store).length;
        },
        key: (i: number) => Object.keys(store)[i] ?? null,
      } satisfies Storage);
    } else {
      localStorage.clear();
    }

    // Ensure clean .dark class state
    document.documentElement.classList.remove("dark");
  });
  it("exposes toggleTheme when switchable is true", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light" switchable>
          {children}
        </ThemeProvider>
      ),
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.switchable).toBe(true);
    expect(result.current.toggleTheme).toBeTypeOf("function");
  });

  it("toggles from light to dark when toggleTheme is called", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light" switchable>
          {children}
        </ThemeProvider>
      ),
    });

    expect(result.current.theme).toBe("light");

    act(() => {
      result.current.toggleTheme!();
    });

    expect(result.current.theme).toBe("dark");
  });

  it("adds .dark class to document root when theme is dark", () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="dark" switchable>
          {children}
        </ThemeProvider>
      ),
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes .dark class when theme toggles back to light", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="dark" switchable>
          {children}
        </ThemeProvider>
      ),
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      result.current.toggleTheme!();
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists theme to localStorage when switchable", () => {
    localStorage.clear();

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light" switchable>
          {children}
        </ThemeProvider>
      ),
    });

    act(() => {
      result.current.toggleTheme!();
    });

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("restores theme from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light" switchable>
          {children}
        </ThemeProvider>
      ),
    });

    expect(result.current.theme).toBe("dark");
  });

  it("does not expose toggleTheme when switchable is false", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      ),
    });

    expect(result.current.switchable).toBe(false);
    expect(result.current.toggleTheme).toBeUndefined();
  });
});

describe("useTheme — error boundary", () => {
  it("throws when used outside ThemeProvider", () => {
    // Suppress React error boundary console noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within ThemeProvider"
    );
    spy.mockRestore();
  });
});
