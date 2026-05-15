"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Pet { id: string; name: string; species?: string; front_image_url?: string; side_image_url?: string; angle45_image_url?: string; }
interface TryOnImage { id: string; image_url: string; angle: string; created_at: string; }

export default function TryOnPreview({ productId }: { productId: string }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [images, setImages] = useState<TryOnImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<Pet[]>("/pets").then(setPets).catch(() => setPets([]));
  }, []);

  const handleGenerate = async () => {
    if (!selectedPet) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post<TryOnImage>("/tryon/generate", { pet_id: selectedPet, product_id: productId, angle: "angle45" });
      setImages(prev => [...prev, res]);
      setMessage("生成完了！");
    } catch (err: unknown) {
      setMessage(((err as { detail?: string })?.detail) || "生成に失敗しました");
    }
    setLoading(false);
  };

  const handleAdditional = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const res = await api.post<TryOnImage[]>("/tryon/generate-additional", {
        pet_id: selectedPet,
        product_id: productId,
        angles: ["front", "side"],
      });
      setImages(prev => [...prev, ...res]);
      setMessage("追加生成完了！");
    } catch (err: unknown) {
      setMessage(((err as { detail?: string })?.detail) || "追加生成に失敗しました");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h3>AI試着プレビュー</h3>
      {pets.length === 0 ? (
        <p>ペットを登録してください（<a href="/mypage/pets">マイページ</a>）</p>
      ) : (
        <>
          <div style={{ margin: "1rem 0" }}>
            <label>ペット選択: </label>
            <select className="form-input" value={selectedPet} onChange={e => setSelectedPet(e.target.value)}>
              <option value="">選択してください</option>
              {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button className="form-button" onClick={handleGenerate} disabled={loading || !selectedPet || images.length >= 4}>
            {loading ? "生成中..." : "試着を生成"}
          </button>
          {images.length > 0 && images.length < 4 && (
            <button className="form-button" onClick={handleAdditional} disabled={loading} style={{ marginLeft: "1rem" }}>
              他の角度も生成
            </button>
          )}
          {message && <p style={{ marginTop: "0.5rem", color: message.includes("失敗") ? "red" : "green" }}>{message}</p>}
          {images.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
              {images.map(img => (
                <div key={img.id}>
                  <img src={img.image_url} alt={`TryOn ${img.angle}`} style={{ width: "100%", borderRadius: "4px" }} />
                  <p style={{ textAlign: "center", fontSize: "0.8rem" }}>{img.angle}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
