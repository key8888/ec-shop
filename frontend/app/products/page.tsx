"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

interface Product { id: string; name: string; price: number; stock: number; thumbnail_url?: string; description?: string; category_id?: string; created_at: string; }
interface ProductListResponse { items: Product[]; total: number; page: number; per_page: number; }

export default function ProductsPage() {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (p: number = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), per_page: "20" });
      if (keyword) params.set("keyword", keyword);
      const res = await api.get<ProductListResponse>(`/products?${params}`);
      setData(res);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchProducts(1); };

  return (
    <div>
      <h2>商品一覧</h2>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        <input className="form-input" type="text" placeholder="キーワード検索" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ flex: 1 }} />
        <button className="form-button" type="submit">検索</button>
      </form>
      {loading ? (
        <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton-loader" style={{ height: "300px", background: "#eee", borderRadius: "8px" }} />)}
        </div>
      ) : (
        <>
          <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
            {data?.items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {data && data.total > data.per_page && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "2rem 0" }}>
              <button className="form-button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>前</button>
              <span>ページ {data.page}</span>
              <button className="form-button" disabled={page * data.per_page >= data.total} onClick={() => setPage(p => p + 1)}>次</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
