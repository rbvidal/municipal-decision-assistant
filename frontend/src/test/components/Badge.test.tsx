import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../../components/common/Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("applies status class for success", () => {
    const { container } = render(<Badge status="success">OK</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("success");
  });

  it("applies status class for error", () => {
    const { container } = render(<Badge status="error">Fehler</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("error");
  });

  it("defaults to neutral status", () => {
    const { container } = render(<Badge>Neutral</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("neutral");
  });

  it("renders with pill variant by default", () => {
    const { container } = render(<Badge>Pill</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("SPAN");
  });

  it("applies aria-label when provided", () => {
    render(<Badge ariaLabel="Status: Aktiv">Aktiv</Badge>);
    expect(screen.getByLabelText("Status: Aktiv")).toBeInTheDocument();
  });
});
