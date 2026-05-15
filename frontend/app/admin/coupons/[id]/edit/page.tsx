"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount?: number;
  max_uses: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
}

function formatDatetimeLocal(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminCouponEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_uses: "0",
    starts_at: "",
    expires_at: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Coupon>(`/admin/coupons/${id}`)
      .then((coupon) => {
        setForm({
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: String(coupon.discount_value),
          min_order_amount: coupon.min_order_amount ? String(coupon.min_order_amount) : "",
          max_uses: String(coupon.max_uses),
          starts_at: formatDatetimeLocal(coupon.starts_at),
          expires_at: formatDatetimeLocal(coupon.expires_at),
        });
      })
      .catch(() => setError("クーポン情報の取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/admin/coupons/${id}`, {
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
      setError(apiErr?.detail || "クーポンの更新に失敗しました");
      setSaving(false);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error && !form.code) return <p className="error-message">{error}</p>;

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2>クーポン編集</h2>
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

          <button className="form-button" type="submit" disabled={saving}>
            {saving ? "保存中..." : "更新"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: "bold", fontSize: "0.875rem" };
