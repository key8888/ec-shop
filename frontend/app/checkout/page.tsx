"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";
import { api } from "@/lib/api";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div>
        <h2>チェックアウト</h2>
        <p>ご注文にはログインが必要です。</p>
        <button className="form-button" onClick={() => router.push("/login")}>ログイン</button>
      </div>
    );
  }

  if (items.length === 0) {
    return <p>カートが空です</p>;
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const orderItems = items.map(i => ({ product_id: i.product_id, quantity: i.quantity }));
      const order = await api.post<{ id: string }>("/orders", { items: orderItems });
      const payment = await api.post<{ payment_url: string }>(`/orders/${order.id}/payment`);
      clearCart();
      window.location.href = payment.payment_url;
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setError(apiErr?.detail || "注文に失敗しました");
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>注文確認</h2>
      {items.map(item => (
        <div key={item.product_id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #eee" }}>
          {item.product.name} × {item.quantity} = ¥{(item.product.price * item.quantity).toLocaleString()}
        </div>
      ))}
      <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "1rem" }}>合計: ¥{getTotal().toLocaleString()}</p>
      {error && <p className="error-message">{error}</p>}
      <button className="form-button" onClick={handleCheckout} disabled={loading} style={{ marginTop: "1rem" }}>
        {loading ? "処理中..." : "注文を確定する"}
      </button>
    </div>
  );
}
