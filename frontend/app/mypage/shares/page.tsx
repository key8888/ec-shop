"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ShareLink {
  id: string;
  share_code: string;
  product_name: string;
  clicks: number;
  max_clicks: number;
  status: "active" | "claimed" | "expired";
  discount_activated: boolean;
  created_at: string;
}

export default function SharesPage() {
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShares = () => {
    api.get<ShareLink[]>("/share/my-links")
      .then(setShares)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const handleClaim = async (shareId: string) => {
    try {
      await api.post(`/share/${shareId}/claim`);
      fetchShares();
    } catch {}
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>シェアリンク</h2>
      {shares.length === 0 ? (
        <p>シェアリンクがありません</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          {shares.map((share) => (
            <div key={share.id} className="product-card" style={{ padding: "1rem" }}>
              <p><strong>商品:</strong> {share.product_name}</p>
              <p><strong>シェアコード:</strong> {share.share_code}</p>
              <p><strong>クリック数:</strong> {share.clicks} / {share.max_clicks}</p>
              <p>
                <strong>ステータス:</strong>{" "}
                <span style={{
                  color: share.status === "active" ? "green" : share.status === "claimed" ? "var(--color-gold)" : "#888",
                }}>
                  {share.status === "active" ? "有効" : share.status === "claimed" ? "割引適用済" : "期限切れ"}
                </span>
              </p>
              {share.status === "active" && share.clicks >= share.max_clicks && share.discount_activated && (
                <button className="form-button" style={{ width: "auto", padding: "0.4rem 0.75rem", marginTop: "0.5rem" }} onClick={() => handleClaim(share.id)}>
                  割引を適用
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
