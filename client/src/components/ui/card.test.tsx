import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardTitle } from "./card";

describe("CardTitle", () => {
  it("renders an h3 element by default", () => {
    render(<CardTitle>Test Title</CardTitle>);
    const el = screen.getByText("Test Title");
    expect(el.tagName).toBe("H3");
  });

  it("applies data-slot='card-title'", () => {
    render(<CardTitle>Test Title</CardTitle>);
    const el = screen.getByText("Test Title");
    expect(el).toHaveAttribute("data-slot", "card-title");
  });

  it("applies default heading styles", () => {
    render(<CardTitle>Test Title</CardTitle>);
    const el = screen.getByText("Test Title");
    expect(el).toHaveClass("leading-none", "font-semibold");
  });

  it("passes through className", () => {
    render(<CardTitle className="text-lg">Styled</CardTitle>);
    const el = screen.getByText("Styled");
    expect(el).toHaveClass("text-lg");
  });

  it("renders a different heading level via 'as' prop", () => {
    render(<CardTitle as="h2">Section Title</CardTitle>);
    const el = screen.getByText("Section Title");
    expect(el.tagName).toBe("H2");
    expect(el).toHaveAttribute("data-slot", "card-title");
  });

  it("renders h4 via 'as' prop", () => {
    render(<CardTitle as="h4">Subsection</CardTitle>);
    const el = screen.getByText("Subsection");
    expect(el.tagName).toBe("H4");
  });
});
