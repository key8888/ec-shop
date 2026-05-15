"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminProductNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category_id: "", thumbnail_url: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/products", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: form.category_id || undefined,
        thumbnail_url: form.thumbnail_url || undefined,
      });
      router.push("/admin/products");
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setError(apiErr?.detail || "商品の作成に失敗しました");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2>新規商品登録</h2>
      <div className="form-container" style={{ maxWidth: "100%" }}>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>商品名</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
          <label style={labelStyle}>説明</label>
          <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={4} style={{ resize: "vertical" }} />
          <label style={labelStyle}>価格</label>
          <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} required />
          <label style={labelStyle}>在庫数</label>
          <input className="form-input" name="stock" type="number" value={form.stock} onChange={handleChange} required />
          <label style={labelStyle}>カテゴリID</label>
          <input className="form-input" name="category_id" value={form.category_id} onChange={handleChange} />
          <label style={labelStyle}>サムネイルURL</label>
          <input className="form-input" name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} />
          <button className="form-button" type="submit" disabled={loading}>
            {loading ? "登録中..." : "登録"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: "bold", fontSize: "0.875rem" };
