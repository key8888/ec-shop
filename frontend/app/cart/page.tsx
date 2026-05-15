"use client";
import { useCart } from "@/features/cart/CartContext";
import CartItem from "@/components/CartItem";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCart();

  if (items.length === 0) return (
    <div>
      <h2>カート</h2>
      <p>カートは空です。</p>
      <Link href="/products">商品一覧を見る</Link>
    </div>
  );

  return (
    <div>
      <h2>カート</h2>
      {items.map(item => (
        <CartItem key={item.product_id} {...item} onUpdate={qty => updateQuantity(item.product_id, qty)} onRemove={() => removeItem(item.product_id)} />
      ))}
      <div style={{ textAlign: "right", margin: "1rem 0", fontSize: "1.2rem", fontWeight: "bold" }}>
        合計: ¥{getTotal().toLocaleString()}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
        <Link href="/products" className="form-button" style={{ background: "#888" }}>買い物を続ける</Link>
        <Link href="/checkout" className="form-button">レジに進む</Link>
      </div>
    </div>
  );
}
