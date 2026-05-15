"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ShareLink {
  id: string;
  share_code: string;
  product_name?: string;
  product_id: string;
  sharer_name?: string;
  sharer_id: string;
  current_clicks: number;
  required_clicks: number;
  is_active: boolean;
  discount_activated: boolean;
  status: string;
  created_at: string;
}

interface ShareLinkListResponse {
  items: ShareLink[];
  total: number;
  page: number;
  per_page: number;
}

export default function AdminShareLinksPage() {
  const [data, setData] = useState<ShareLinkListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchLinks = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "20" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    api.get<ShareLinkListResponse>(`/admin/share/links?${params}`)
      .then(setData)
      .catch(() => setError("シェアリンク一覧の取得に失敗しました"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLinks(); }, [page, statusFilter]);

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    setToggling(id);
    try {
      await api.put(`/admin/share/links/${id}`, { is_active: !currentlyActive });
      fetchLinks();
    } catch {
      setError("ステータス更新に失敗しました");
    }
    setToggling(null);
  };

  const statusOptions = [
    { value: "all", label: "すべて" },
    { value: "active", label: "有効" },
    { value: "completed", label: "達成" },
    { value: "expired", label: "期限切れ" },
    { value: "disabled", label: "無効" },
  ];

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h2>シェアリンク一覧</h2>
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
              <th style={thStyle}>コード</th>
              <th style={thStyle}>商品</th>
              <th style={thStyle}>シェア者</th>
              <th style={thStyle}>進捗</th>
              <th style={thStyle}>ステータス</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((link) => (
              <tr key={link.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}><code>{link.share_code}</code></td>
                <td style={tdStyle}>{link.product_name || link.product_id.substring(0, 8)}</td>
                <td style={tdStyle}>{link.sharer_name || link.sharer_id.substring(0, 8)}</td>
                <td style={tdStyle}>{link.current_clicks}/{link.required_clicks}</td>
                <td style={tdStyle}>
                  <span style={{ color: link.is_active ? (link.discount_activated ? "green" : "var(--color-gold)") : "#e53e3e" }}>
                    {link.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleToggleActive(link.id, link.is_active)}
                    disabled={toggling === link.id}
                    style={{ color: link.is_active ? "#e53e3e" : "green", textDecoration: "underline", fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer" }}
                  >
                    {toggling === link.id ? "更新中..." : (link.is_active ? "無効化" : "有効化")}
                  </button>
                </td>
              </tr>
            ))}
            {(!data || data.items.length === 0) && (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center" }}>シェアリンクがありません</td></tr>
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
