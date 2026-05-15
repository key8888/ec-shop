"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface OrderDetail {
  id: string;
  status: string;
  total_price: number;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<OrderDetail>(`/orders/${id}`)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>読み込み中...</p>;
  if (!order) return <p>注文が見つかりません</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>注文詳細</h2>
      <div className="form-container">
        <p><strong>注文ID:</strong> {order.id}</p>
        <p><strong>注文日:</strong> {new Date(order.created_at).toLocaleDateString("ja-JP")}</p>
        <p><strong>ステータス:</strong> {order.status}</p>
        <p><strong>支払状況:</strong> {order.payment_status}</p>
        <p><strong>合計:</strong> ¥{order.total_price.toLocaleString()}</p>
      </div>

      <h3 style={{ marginTop: "1.5rem" }}>注文商品</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
        {order.items.map((item) => (
          <div key={item.id} className="product-card" style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
            {item.image_url && (
              <img src={item.image_url} alt={item.product_name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }} />
            )}
            <div>
              <p><strong>{item.product_name}</strong></p>
              <p>¥{item.price.toLocaleString()} × {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
