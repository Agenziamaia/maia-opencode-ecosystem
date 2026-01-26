import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App";

describe("App Component", () => {
  it("renders MAIA Opencode heading", () => {
    render(<App />);
    expect(screen.getByText("MAIA Opencode")).toBeInTheDocument();
  });

  it("renders initialization message", () => {
    render(<App />);
    expect(
      screen.getByText("React + TypeScript + Vite environment initialized."),
    ).toBeInTheDocument();
  });
});
