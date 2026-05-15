"use client";
import { useState } from "react";
import { api } from "@/lib/api";

interface CouponInputProps { orderAmount: number; onApply: (code: string, discount: number) => void; }

export default function CouponInput({ orderAmount, onApply }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);

  const handleValidate = async () => {
    try {
      const res = await api.post<{ valid: boolean; discount_amount: number; message?: string }>("/coupons/validate", { code, order_amount: orderAmount });
      if (res.valid) {
        setMessage(`${res.discount_amount.toLocaleString()}円引き`);
        onApply(code, res.discount_amount);
        setApplied(true);
      } else {
        setMessage(res.message || "無効なクーポンです");
        setApplied(false);
      }
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setMessage(apiErr?.detail || "クーポン検証エラー");
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", margin: "0.5rem 0" }}>
      <input className="form-input" type="text" placeholder="クーポンコード" value={code} onChange={e => setCode(e.target.value)} disabled={applied} style={{ flex: 1 }} />
      {!applied ? (
        <button className="form-button" onClick={handleValidate} disabled={!code}>適用</button>
      ) : (
        <button className="form-button" onClick={() => { setApplied(false); setCode(""); setMessage(""); onApply("", 0); }} style={{ background: "#888" }}>解除</button>
      )}
      {message && <span style={{ fontSize: "0.9rem", color: applied ? "green" : "red" }}>{message}</span>}
    </div>
  );
}
