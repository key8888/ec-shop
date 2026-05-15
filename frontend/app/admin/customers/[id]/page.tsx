"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

interface CustomerOrder {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
}

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  orders: CustomerOrder[];
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<CustomerDetail>(`/admin/customers/${id}`)
      .then(setCustomer)
      .catch(() => setError("顧客情報の取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!customer) return <p>顧客が見つかりません</p>;

  return (
    <div>
      <h2>顧客詳細</h2>
      <div className="product-card" style={{ padding: "1.5rem", marginTop: "1rem" }}>
        <p><strong>ID:</strong> {customer.id}</p>
        <p><strong>名前:</strong> {customer.name}</p>
        <p><strong>メールアドレス:</strong> {customer.email}</p>
        <p><strong>権限:</strong> {customer.role}</p>
        <p><strong>登録日:</strong> {new Date(customer.created_at).toLocaleDateString("ja-JP")}</p>
      </div>

      <h3 style={{ marginTop: "2rem", marginBottom: "0.75rem" }}>注文履歴</h3>
      {customer.orders.length === 0 ? (
        <p>注文履歴がありません</p>
      ) : (
        <div style={{ background: "var(--color-white)", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-navy)", color: "var(--color-white)" }}>
                <th style={thStyle}>注文ID</th>
                <th style={thStyle}>ステータス</th>
                <th style={thStyle}>合計金額</th>
                <th style={thStyle}>日時</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{order.id.substring(0, 8)}...</td>
                  <td style={tdStyle}>{order.status}</td>
                  <td style={tdStyle}>¥{order.total_price.toLocaleString()}</td>
                  <td style={tdStyle}>{new Date(order.created_at).toLocaleDateString("ja-JP")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem" };
const tdStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.875rem" };
