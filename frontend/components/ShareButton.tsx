"use client";
import { useState } from "react";
import { api } from "@/lib/api";

interface ShareButtonProps { product_id: string; }

export default function ShareButton({ product_id }: ShareButtonProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ share_code: string }>("/share/create", { product_id });
      setShareUrl(`${window.location.origin}/share/${res.share_code}`);
    } catch {}
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      {!shareUrl ? (
        <button className="form-button" onClick={handleCreate} disabled={loading}>
          {loading ? "作成中..." : "シェアして割引をもらう"}
        </button>
      ) : (
        <div>
          <input type="text" value={shareUrl} readOnly style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }} />
          <button className="form-button" onClick={handleCopy}>{copied ? "コピーしました！" : "URLをコピー"}</button>
        </div>
      )}
    </div>
  );
}
