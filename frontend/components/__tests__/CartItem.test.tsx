import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartItem from "../CartItem";

const mockProduct = {
  id: "prod-1",
  name: "猫用おもちゃ",
  price: 1500,
  thumbnail_url: "/test.png",
};

describe("CartItem", () => {
  it("renders product name", () => {
    render(
      <CartItem
        product_id="prod-1"
        product={mockProduct}
        quantity={2}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText("猫用おもちゃ")).toBeInTheDocument();
  });

  it("renders product price", () => {
    render(
      <CartItem
        product_id="prod-1"
        product={mockProduct}
        quantity={2}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText("¥1,500")).toBeInTheDocument();
  });

  it("renders total line price (price * quantity)", () => {
    render(
      <CartItem
        product_id="prod-1"
        product={mockProduct}
        quantity={3}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText("¥4,500")).toBeInTheDocument();
  });

  it("renders quantity select with correct value", () => {
    render(
      <CartItem
        product_id="prod-1"
        product={mockProduct}
        quantity={5}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("5");
  });

  it("calls onUpdate when quantity changes", async () => {
    const onUpdate = vi.fn();
    render(
      <CartItem
        product_id="prod-1"
        product={mockProduct}
        quantity={1}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
      />
    );
    const user = userEvent.setup();
    await user.selectOptions(screen.getByRole("combobox"), "3");
    expect(onUpdate).toHaveBeenCalledWith(3);
  });

  it("calls onRemove when 削除 button is clicked", async () => {
    const onRemove = vi.fn();
    render(
      <CartItem
        product_id="prod-1"
        product={mockProduct}
        quantity={1}
        onUpdate={vi.fn()}
        onRemove={onRemove}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("削除"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
