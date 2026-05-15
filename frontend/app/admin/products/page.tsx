"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id?: string;
  thumbnail_url?: string;
  created_at: string;
}

interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  per_page: number;
}

export default function AdminProductsPage() {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "20" });
    api.get<ProductListResponse>(`/products?${params}`)
      .then(setData)
      .catch(() => setError("商品一覧の取得に失敗しました"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("この商品を削除しますか？")) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      setError("削除に失敗しました");
    }
    setDeleting(null);
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>商品管理</h2>
        <Link href="/admin/products/new" className="form-button" style={{ width: "auto", padding: "0.5rem 1.5rem", display: "inline-block" }}>
          新規商品登録
        </Link>
      </div>
      <div style={{ background: "var(--color-white)", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-navy)", color: "var(--color-white)" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>商品名</th>
              <th style={thStyle}>価格</th>
              <th style={thStyle}>在庫</th>
              <th style={thStyle}>カテゴリ</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{p.id.substring(0, 8)}...</td>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>¥{p.price.toLocaleString()}</td>
                <td style={tdStyle}>{p.stock}</td>
                <td style={tdStyle}>{p.category_id || "-"}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/admin/products/${p.id}/edit`} style={{ color: "var(--color-navy)", textDecoration: "underline", fontSize: "0.875rem" }}>
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      style={{ color: "#e53e3e", textDecoration: "underline", fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer" }}
                    >
                      {deleting === p.id ? "削除中..." : "削除"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.items.length === 0) && (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center" }}>商品がありません</td></tr>
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
