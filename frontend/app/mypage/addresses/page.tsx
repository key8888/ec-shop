"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Address {
  id: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
  name: string;
  phone?: string;
  is_default: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = () => {
    api.get<Address[]>("/addresses")
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/addresses/${id}`, { is_default: true });
      fetchAddresses();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    try {
      await api.delete(`/addresses/${id}`);
      fetchAddresses();
    } catch {}
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>配送先住所</h2>
        <Link href="/mypage/addresses/new" className="form-button" style={{ width: "auto", padding: "0.5rem 1rem" }}>
          新規住所追加
        </Link>
      </div>

      {addresses.length >= 10 && (
        <p style={{ color: "#e67e22", marginTop: "0.5rem" }}>住所は最大10件まで登録できます</p>
      )}

      <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {addresses.length === 0 ? (
          <p>登録された住所はありません</p>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="product-card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p><strong>{addr.name}</strong> {addr.is_default && <span style={{ color: "var(--color-gold)", fontSize: "0.875rem" }}>[デフォルト]</span>}</p>
                  <p style={{ fontSize: "0.9rem" }}>〒{addr.postal_code?.slice(0, 3)}-{addr.postal_code?.slice(3)}</p>
                  <p>{addr.prefecture} {addr.city} {addr.address1}</p>
                  {addr.address2 && <p>{addr.address2}</p>}
                  {addr.phone && <p style={{ fontSize: "0.875rem" }}>Tel: {addr.phone}</p>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                {!addr.is_default && (
                  <button className="form-button" style={{ width: "auto", padding: "0.4rem 0.75rem", fontSize: "0.875rem" }} onClick={() => handleSetDefault(addr.id)}>
                    デフォルトに設定
                  </button>
                )}
                <Link href={`/mypage/addresses/${addr.id}/edit`} className="form-button" style={{ width: "auto", padding: "0.4rem 0.75rem", fontSize: "0.875rem", textAlign: "center" }}>
                  編集
                </Link>
                <button className="form-button" style={{ width: "auto", padding: "0.4rem 0.75rem", fontSize: "0.875rem", background: "#c0392b" }} onClick={() => handleDelete(addr.id)}>
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
