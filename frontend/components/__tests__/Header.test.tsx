import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../Header";
import { useAuth } from "@/features/auth/AuthContext";

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Header", () => {
  it("renders the logo text", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() });
    render(<Header />);
    expect(screen.getByText("星野のペット用品")).toBeInTheDocument();
  });

  it("renders 商品一覧 link", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() });
    render(<Header />);
    const link = screen.getByText("商品一覧");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/products");
  });

  it("renders ログイン link when user is null", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() });
    render(<Header />);
    const link = screen.getByText("ログイン");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/login");
  });

  it("renders auth links when user is logged in", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "test@test.com", name: "Tester", role: "customer" },
      logout: vi.fn(),
    });
    render(<Header />);
    expect(screen.getByText("マイページ")).toBeInTheDocument();
    expect(screen.getByText("カート")).toBeInTheDocument();
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
    expect(screen.queryByText("ログイン")).not.toBeInTheDocument();
  });
});
