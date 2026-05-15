"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Order {
  id: string;
  user_name?: string;
  user_email?: string;
  status: string;
  total_price: number;
  created_at: string;
}

interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  per_page: number;
}

export default function AdminOrdersPage() {
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "20" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    api.get<OrderListResponse>(`/admin/orders?${params}`)
      .then(setData)
      .catch(() => setError("注文一覧の取得に失敗しました"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch {
      setError("ステータス更新に失敗しました");
    }
    setUpdating(null);
  };

  const statusOptions = [
    { value: "all", label: "すべて" },
    { value: "pending", label: "保留中" },
    { value: "shipped", label: "発送済み" },
    { value: "delivered", label: "配達完了" },
  ];

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h2>注文管理</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem", fontSize: "0.875rem" }}>ステータス:</label>
        <select className="form-input" style={{ width: "auto", display: "inline-block" }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div style={{ background: "var(--color-white)", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-navy)", color: "var(--color-white)" }}>
              <th style={thStyle}>注文ID</th>
              <th style={thStyle}>顧客</th>
              <th style={thStyle}>合計金額</th>
              <th style={thStyle}>ステータス</th>
              <th style={thStyle}>日時</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{order.id.substring(0, 8)}...</td>
                <td style={tdStyle}>{order.user_name || order.user_email || "-"}</td>
                <td style={tdStyle}>¥{order.total_price.toLocaleString()}</td>
                <td style={tdStyle}>{order.status}</td>
                <td style={tdStyle}>{new Date(order.created_at).toLocaleDateString("ja-JP")}</td>
                <td style={tdStyle}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updating === order.id}
                    style={{ fontSize: "0.875rem", padding: "0.25rem" }}
                  >
                    {statusOptions.filter((o) => o.value !== "all").map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {(!data || data.items.length === 0) && (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center" }}>注文がありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {data && data.total > data.per_page && (
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "1.5rem 0" }}>
          <button className="form-button" style={{ width: "auto", padding: "0.5rem 1rem" }} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            前
          </button>
          <span style={{ lineHeight: "2.25" }}>ページ {data.page}</span>
          <button className="form-button" style={{ width: "auto", padding: "0.5rem 1rem" }} disabled={page * data.per_page >= data.total} onClick={() => setPage((p) => p + 1)}>
            次
          </button>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem" };
const tdStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.875rem" };
