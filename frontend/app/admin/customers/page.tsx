"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  per_page: number;
}

export default function AdminCustomersPage() {
  const [data, setData] = useState<CustomerListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "20" });
    api.get<CustomerListResponse>(`/admin/customers?${params}`)
      .then(setData)
      .catch(() => setError("顧客一覧の取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h2>顧客管理</h2>
      <div style={{ background: "var(--color-white)", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "auto", marginTop: "1rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-navy)", color: "var(--color-white)" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>名前</th>
              <th style={thStyle}>メールアドレス</th>
              <th style={thStyle}>登録日</th>
              <th style={thStyle}>詳細</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{c.id.substring(0, 8)}...</td>
                <td style={tdStyle}>{c.name}</td>
                <td style={tdStyle}>{c.email}</td>
                <td style={tdStyle}>{new Date(c.created_at).toLocaleDateString("ja-JP")}</td>
                <td style={tdStyle}>
                  <Link href={`/admin/customers/${c.id}`} style={{ color: "var(--color-navy)", textDecoration: "underline", fontSize: "0.875rem" }}>
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
            {(!data || data.items.length === 0) && (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: "center" }}>顧客がありません</td></tr>
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
