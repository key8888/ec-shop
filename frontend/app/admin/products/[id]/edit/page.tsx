"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id?: string;
  thumbnail_url?: string;
}

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category_id: "", thumbnail_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Product>(`/products/${id}`)
      .then((product) => {
        setForm({
          name: product.name,
          description: product.description || "",
          price: String(product.price),
          stock: String(product.stock),
          category_id: product.category_id || "",
          thumbnail_url: product.thumbnail_url || "",
        });
      })
      .catch(() => setError("商品情報の取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/products/${id}`, {
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
      setError(apiErr?.detail || "商品の更新に失敗しました");
      setSaving(false);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error && !form.name) return <p className="error-message">{error}</p>;

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2>商品編集</h2>
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
          <button className="form-button" type="submit" disabled={saving}>
            {saving ? "保存中..." : "更新"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: "bold", fontSize: "0.875rem" };
