import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../CartContext";
import React from "react";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.getTotal()).toBe(0);
  });

  it("addItem adds a new item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        product_id: "p1",
        product: { id: "p1", name: "Test", price: 1000 },
        quantity: 1,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.name).toBe("Test");
    expect(result.current.getTotal()).toBe(1000);
  });

  it("addItem increments quantity when item already exists", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        product_id: "p1",
        product: { id: "p1", name: "Test", price: 500 },
        quantity: 2,
      });
    });

    act(() => {
      result.current.addItem({
        product_id: "p1",
        product: { id: "p1", name: "Test", price: 500 },
        quantity: 3,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.getTotal()).toBe(2500);
  });

  it("removeItem removes an item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        product_id: "p1",
        product: { id: "p1", name: "Test", price: 1000 },
        quantity: 1,
      });
    });

    act(() => {
      result.current.removeItem("p1");
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.getTotal()).toBe(0);
  });

  it("updateQuantity updates item quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        product_id: "p1",
        product: { id: "p1", name: "Test", price: 100 },
        quantity: 1,
      });
    });

    act(() => {
      result.current.updateQuantity("p1", 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.getTotal()).toBe(500);
  });

  it("updateQuantity removes item when quantity <= 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        product_id: "p1",
        product: { id: "p1", name: "Test", price: 100 },
        quantity: 1,
      });
    });

    act(() => {
      result.current.updateQuantity("p1", 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("clearCart empties the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        product_id: "p1",
        product: { id: "p1", name: "A", price: 100 },
        quantity: 1,
      });
      result.current.addItem({
        product_id: "p2",
        product: { id: "p2", name: "B", price: 200 },
        quantity: 2,
      });
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.getTotal()).toBe(0);
  });

  it("throws error when useCart used outside provider", () => {
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart must be used within CartProvider"
    );
  });
});
