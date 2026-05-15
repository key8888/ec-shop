"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface ShareData {
  share_code: string;
  product_id: string;
  product_name: string;
  product_thumbnail?: string;
  discount_amount: number;
  current_clicks: number;
  required_clicks: number;
  discount_activated: boolean;
}

export default function SharePage() {
  const params = useParams();
  const shareCode = params.shareCode as string;
  const [share, setShare] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [supporting, setSupporting] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    api.get<ShareData>(`/share/${shareCode}`)
      .then((data) => {
        setShare(data);
        setClicks(data.current_clicks);
        setActivated(data.discount_activated);
      })
      .catch((err: unknown) => {
        const apiErr = err as { detail?: string };
        setError(apiErr?.detail || "シェア情報の取得に失敗しました");
      })
      .finally(() => setLoading(false));
  }, [shareCode]);

  const handleSupport = async () => {
    setSupporting(true);
    try {
      const res = await api.post<{ current_clicks: number; discount_activated: boolean }>(`/share/${shareCode}/click`);
      setClicks(res.current_clicks);
      setActivated(res.discount_activated);
    } catch {}
    setSupporting(false);
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error-message" style={{ maxWidth: "500px", margin: "2rem auto" }}>{error}</p>;
  if (!share) return null;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h2>シェア割引キャンペーン</h2>
      <div className="product-card" style={{ padding: "1.5rem", marginTop: "1rem" }}>
        {share.product_thumbnail && (
          <img src={share.product_thumbnail} alt={share.product_name} style={{ width: "100%", maxWidth: "300px", borderRadius: "8px", marginBottom: "1rem" }} />
        )}
        <h3>{share.product_name}</h3>
        <p style={{ fontSize: "1.25rem", color: "var(--color-gold)", margin: "0.5rem 0" }}>
          最大 ¥{share.discount_amount.toLocaleString()} OFF
        </p>
        <p style={{ margin: "0.5rem 0" }}>
          応援クリック: {clicks} / {share.required_clicks}
        </p>
        {activated && (
          <p style={{ color: "green", fontWeight: "bold", margin: "0.5rem 0" }}>割引が適用されました！</p>
        )}
        {!activated && (
          <button className="form-button" onClick={handleSupport} disabled={supporting} style={{ marginBottom: "0.5rem" }}>
            {supporting ? "応援中..." : "割引を応援する"}
          </button>
        )}
        <div style={{ marginTop: "0.5rem" }}>
          <Link href={`/products/${share.product_id}`} style={{ color: "var(--color-gold)", textDecoration: "underline" }}>
            この商品を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
