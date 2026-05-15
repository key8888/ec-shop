import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductCard from "../ProductCard";

const mockProduct = {
  id: "prod-1",
  name: "プレミアムドッグフード",
  price: 2980,
  stock: 10,
  created_at: "2025-01-01T00:00:00Z",
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("プレミアムドッグフード")).toBeInTheDocument();
  });

  it("renders product price with yen symbol", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("¥2,980")).toBeInTheDocument();
  });

  it("renders link to product detail page", () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByText("プレミアムドッグフード").closest("a");
    expect(link).toHaveAttribute("href", "/products/prod-1");
  });

  it("shows 在庫切れ when stock is 0", () => {
    render(<ProductCard product={{ ...mockProduct, stock: 0 }} />);
    expect(screen.getByText("在庫切れ")).toBeInTheDocument();
  });

  it("shows 画像なし placeholder when no thumbnail", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("画像なし")).toBeInTheDocument();
  });
});
