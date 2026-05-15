"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  current_uses: number;
  max_uses: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
}

interface CouponListResponse {
  items: Coupon[];
  total: number;
  page: number;
  per_page: number;
}

export default function AdminCouponsPage() {
  const [data, setData] = useState<CouponListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchCoupons = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "20" });
    api.get<CouponListResponse>(`/admin/coupons?${params}`)
      .then(setData)
      .catch(() => setError("クーポン一覧の取得に失敗しました"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("このクーポンを削除しますか？")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      fetchCoupons();
    } catch {
      setError("削除に失敗しました");
    }
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    setToggling(id);
    try {
      await api.put(`/admin/coupons/${id}`, { is_active: !currentlyActive });
      fetchCoupons();
    } catch {
      setError("ステータス更新に失敗しました");
    }
    setToggling(null);
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>クーポン管理</h2>
        <Link href="/admin/coupons/new" className="form-button" style={{ width: "auto", padding: "0.5rem 1.5rem", display: "inline-block" }}>
          新規クーポン発行
        </Link>
      </div>
      <div style={{ background: "var(--color-white)", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-navy)", color: "var(--color-white)" }}>
              <th style={thStyle}>コード</th>
              <th style={thStyle}>種類</th>
              <th style={thStyle}>割引値</th>
              <th style={thStyle}>使用数</th>
              <th style={thStyle}>有効</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}><code>{c.code}</code></td>
                <td style={tdStyle}>{c.discount_type === "percentage" ? "割引率" : "固定額"}</td>
                <td style={tdStyle}>
                  {c.discount_type === "percentage" ? `${c.discount_value}%` : `¥${c.discount_value.toLocaleString()}`}
                </td>
                <td style={tdStyle}>{c.current_uses}/{c.max_uses === 0 ? "∞" : c.max_uses}</td>
                <td style={tdStyle}>
                  <span style={{ color: c.is_active ? "green" : "#e53e3e" }}>{c.is_active ? "有効" : "無効"}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <Link href={`/admin/coupons/${c.id}/edit`} style={{ color: "var(--color-navy)", textDecoration: "underline", fontSize: "0.875rem" }}>
                      編集
                    </Link>
                    <button
                      onClick={() => handleToggleActive(c.id, c.is_active)}
                      disabled={toggling === c.id}
                      style={{ color: "var(--color-gold)", textDecoration: "underline", fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer" }}
                    >
                      {toggling === c.id ? "更新中..." : (c.is_active ? "無効化" : "有効化")}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{ color: "#e53e3e", textDecoration: "underline", fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer" }}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.items.length === 0) && (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center" }}>クーポンがありません</td></tr>
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
