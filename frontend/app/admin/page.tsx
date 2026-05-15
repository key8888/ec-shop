"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DashboardData {
  total_revenue: number;
  total_orders: number;
  total_users: number;
  out_of_stock: number;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<DashboardData>("/admin/dashboard")
      .then(setData)
      .catch(() => setError("ダッシュボードデータの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!data) return null;

  const cards = [
    { label: "総売上", value: `¥${data.total_revenue.toLocaleString()}` },
    { label: "総注文数", value: data.total_orders.toLocaleString() },
    { label: "総ユーザー数", value: data.total_users.toLocaleString() },
    { label: "在庫切れ商品", value: data.out_of_stock.toLocaleString() },
  ];

  return (
    <div>
      <h2>ダッシュボード</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {cards.map((card) => (
          <div key={card.label} className="product-card" style={{ padding: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "#666" }}>{card.label}</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "bold", color: "var(--color-navy)", marginTop: "0.5rem" }}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
