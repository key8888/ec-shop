"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ShareSettings {
  default_required_clicks: number;
  default_discount_percentage: number;
  default_expires_in_hours: number;
  max_discount_percentage: number;
  ip_duplicate_window_hours: number;
}

export default function AdminShareSettingsPage() {
  const [form, setForm] = useState<ShareSettings>({
    default_required_clicks: 5,
    default_discount_percentage: 10,
    default_expires_in_hours: 72,
    max_discount_percentage: 30,
    ip_duplicate_window_hours: 24,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get<ShareSettings>("/admin/share/settings")
      .then(setForm)
      .catch(() => setError("設定の取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put("/admin/share/settings", form);
      setSuccess("設定を保存しました");
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setError(apiErr?.detail || "設定の保存に失敗しました");
    }
    setSaving(false);
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2>シェアリンク設定</h2>
      <div className="form-container" style={{ maxWidth: "100%" }}>
        {error && <p className="error-message">{error}</p>}
        {success && <p style={{ color: "green", fontSize: "0.875rem", marginBottom: "1rem", padding: "0.5rem", background: "#f0fff4", borderRadius: "4px" }}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>デフォルト応援クリック数</label>
          <input className="form-input" name="default_required_clicks" type="number" value={form.default_required_clicks} onChange={handleChange} required />

          <label style={labelStyle}>デフォルト割引率 (%)</label>
          <input className="form-input" name="default_discount_percentage" type="number" value={form.default_discount_percentage} onChange={handleChange} required />

          <label style={labelStyle}>デフォルト有効期限 (時間)</label>
          <input className="form-input" name="default_expires_in_hours" type="number" value={form.default_expires_in_hours} onChange={handleChange} required />

          <label style={labelStyle}>最大割引率 (%)</label>
          <input className="form-input" name="max_discount_percentage" type="number" value={form.max_discount_percentage} onChange={handleChange} required />

          <label style={labelStyle}>IP重複ウィンドウ (時間)</label>
          <input className="form-input" name="ip_duplicate_window_hours" type="number" value={form.ip_duplicate_window_hours} onChange={handleChange} required />

          <button className="form-button" type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: "bold", fontSize: "0.875rem" };
