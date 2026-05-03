import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ConventionReference from "./ConventionReference";

// Mock framer-motion to avoid animation overhead in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("ConventionReference", () => {
  it("renders heading text using font-sans utility (not undefined font-heading)", () => {
    render(<ConventionReference />);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: /Convention Quick Reference/i,
    });

    // font-heading is undefined in the project CSS — must use font-sans instead
    expect(heading.className).toContain("font-sans");
    expect(heading.className).not.toContain("font-heading");
  });

  it("renders body text using font-serif utility (not undefined font-body)", () => {
    render(<ConventionReference />);

    const tagline = screen.getByText(
      /Concise cheat-sheets for opening bids and key conventions/,
    );

    // font-body is undefined in the project CSS — must use font-serif instead
    expect(tagline.className).toContain("font-serif");
    expect(tagline.className).not.toContain("font-body");
  });
});
