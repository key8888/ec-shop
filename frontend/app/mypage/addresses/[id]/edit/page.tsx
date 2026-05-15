"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

interface PostalLookup {
  postal_code: string;
  prefecture: string;
  city: string;
  address1: string;
}

export default function EditAddressPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [name, setName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    api.get<Address>(`/addresses/${id}`)
      .then((addr) => {
        setName(addr.name);
        setPostalCode(addr.postal_code);
        setPrefecture(addr.prefecture);
        setCity(addr.city);
        setAddress1(addr.address1);
        setAddress2(addr.address2 || "");
        setPhone(addr.phone || "");
        setIsDefault(addr.is_default);
      })
      .catch(() => setError("住所の取得に失敗しました"))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handlePostalCodeChange = async (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, "");
    setPostalCode(digitsOnly);
    if (digitsOnly.length === 7) {
      try {
        const res = await api.get<PostalLookup>(`/postal-code/lookup?code=${digitsOnly}`);
        setPrefecture(res.prefecture);
        setCity(res.city);
        setAddress1(res.address1);
      } catch {
        setError("郵便番号から住所を取得できませんでした");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.put(`/addresses/${id}`, {
        name,
        postal_code: postalCode,
        prefecture,
        city,
        address1,
        address2: address2 || undefined,
        phone: phone || undefined,
        is_default: isDefault,
      });
      router.push("/mypage/addresses");
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setError(apiErr?.detail || "住所の更新に失敗しました");
    }
    setLoading(false);
  };

  if (pageLoading) return <p>読み込み中...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>住所編集</h2>
      <div className="form-container" style={{ marginTop: "1rem" }}>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input className="form-input" type="text" placeholder="お名前" value={name} onChange={e => setName(e.target.value)} required />
          <input
            className="form-input"
            type="text"
            placeholder="郵便番号 (7桁)"
            value={postalCode}
            onChange={e => handlePostalCodeChange(e.target.value)}
            maxLength={7}
            required
          />
          <input className="form-input" type="text" placeholder="都道府県" value={prefecture} onChange={e => setPrefecture(e.target.value)} required />
          <input className="form-input" type="text" placeholder="市区町村" value={city} onChange={e => setCity(e.target.value)} required />
          <input className="form-input" type="text" placeholder="住所1 (番地)" value={address1} onChange={e => setAddress1(e.target.value)} required />
          <input className="form-input" type="text" placeholder="住所2 (建物名・部屋番号)" value={address2} onChange={e => setAddress2(e.target.value)} />
          <input className="form-input" type="tel" placeholder="電話番号" value={phone} onChange={e => setPhone(e.target.value)} />
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
            デフォルト住所に設定
          </label>
          <button className="form-button" type="submit" disabled={loading}>
            {loading ? "更新中..." : "更新"}
          </button>
        </form>
      </div>
    </div>
  );
}
