"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Order[]>("/orders/history")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>読み込み中...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>注文履歴</h2>
      {orders.length === 0 ? (
        <p>注文履歴がありません</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {orders.map((order) => (
            <div key={order.id} className="product-card" style={{ padding: "1rem" }}>
              <p><strong>注文日:</strong> {new Date(order.created_at).toLocaleDateString("ja-JP")}</p>
              <p><strong>ステータス:</strong> {order.status}</p>
              <p><strong>合計:</strong> ¥{order.total_price.toLocaleString()}</p>
              <Link href={`/mypage/orders/${order.id}`} style={{ color: "var(--color-gold)", textDecoration: "underline" }}>
                詳細を見る
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
