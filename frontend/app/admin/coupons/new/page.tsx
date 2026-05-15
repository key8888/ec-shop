"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminCouponNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_uses: "0",
    starts_at: "",
    expires_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/admin/coupons", {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : undefined,
        max_uses: Number(form.max_uses),
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : undefined,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : undefined,
      });
      router.push("/admin/coupons");
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setError(apiErr?.detail || "クーポンの作成に失敗しました");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2>新規クーポン発行</h2>
      <div className="form-container" style={{ maxWidth: "100%" }}>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>クーポンコード</label>
          <input className="form-input" name="code" value={form.code} onChange={handleChange} required />

          <label style={labelStyle}>割引タイプ</label>
          <div style={{ marginBottom: "1rem", display: "flex", gap: "1.5rem" }}>
            <label style={{ fontSize: "0.875rem" }}>
              <input type="radio" name="discount_type" value="percentage" checked={form.discount_type === "percentage"} onChange={handleChange} /> 割引率(%)
            </label>
            <label style={{ fontSize: "0.875rem" }}>
              <input type="radio" name="discount_type" value="fixed" checked={form.discount_type === "fixed"} onChange={handleChange} /> 固定額(¥)
            </label>
          </div>

          <label style={labelStyle}>割引値</label>
          <input className="form-input" name="discount_value" type="number" value={form.discount_value} onChange={handleChange} required />

          <label style={labelStyle}>最低注文金額</label>
          <input className="form-input" name="min_order_amount" type="number" value={form.min_order_amount} onChange={handleChange} />

          <label style={labelStyle}>最大使用回数 (0=無制限)</label>
          <input className="form-input" name="max_uses" type="number" value={form.max_uses} onChange={handleChange} />

          <label style={labelStyle}>開始日時</label>
          <input className="form-input" name="starts_at" type="datetime-local" value={form.starts_at} onChange={handleChange} />

          <label style={labelStyle}>終了日時</label>
          <input className="form-input" name="expires_at" type="datetime-local" value={form.expires_at} onChange={handleChange} />

          <button className="form-button" type="submit" disabled={loading}>
            {loading ? "発行中..." : "発行"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: "bold", fontSize: "0.875rem" };
