"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Pet {
  id: string;
  name: string;
  species: string;
  gender: string;
  weight?: number;
  body_length?: number;
  image_front?: string;
  image_side?: string;
  image_angle45?: string;
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyLength, setBodyLength] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFront, setImageFront] = useState<File | null>(null);
  const [imageSide, setImageSide] = useState<File | null>(null);
  const [imageAngle45, setImageAngle45] = useState<File | null>(null);
  const [error, setError] = useState("");

  const fetchPets = () => {
    api.get<Pet[]>("/pets")
      .then(setPets)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const resetForm = () => {
    setName("");
    setSpecies("");
    setGender("");
    setWeight("");
    setBodyLength("");
    setEditingId(null);
    setImageFront(null);
    setImageSide(null);
    setImageAngle45(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      name,
      species,
      gender,
      weight: weight ? parseFloat(weight) : undefined,
      body_length: bodyLength ? parseFloat(bodyLength) : undefined,
    };
    try {
      let petId: string;
      if (editingId) {
        await api.put(`/pets/${editingId}`, payload);
        petId = editingId;
      } else {
        const res = await api.post<{ id: string }>("/pets", payload);
        petId = res.id;
      }
      if (imageFront) {
        const fd = new FormData();
        fd.append("image", imageFront);
        fd.append("angle", "front");
        await api.upload(`/pets/${petId}/images`, fd);
      }
      if (imageSide) {
        const fd = new FormData();
        fd.append("image", imageSide);
        fd.append("angle", "side");
        await api.upload(`/pets/${petId}/images`, fd);
      }
      if (imageAngle45) {
        const fd = new FormData();
        fd.append("image", imageAngle45);
        fd.append("angle", "angle45");
        await api.upload(`/pets/${petId}/images`, fd);
      }
      resetForm();
      fetchPets();
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setError(apiErr?.detail || "エラーが発生しました");
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingId(pet.id);
    setName(pet.name);
    setSpecies(pet.species);
    setGender(pet.gender);
    setWeight(pet.weight?.toString() || "");
    setBodyLength(pet.body_length?.toString() || "");
    setImageFront(null);
    setImageSide(null);
    setImageAngle45(null);
    setError("");
  };

  const handleDelete = async (petId: string) => {
    if (!confirm("本当に削除しますか？")) return;
    try {
      await api.delete(`/pets/${petId}`);
      fetchPets();
    } catch {}
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>ペット管理</h2>

      <div className="form-container" style={{ marginTop: "1rem" }}>
        <h3>{editingId ? "ペット編集" : "ペット追加"}</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input className="form-input" type="text" placeholder="名前" value={name} onChange={e => setName(e.target.value)} required />
          <input className="form-input" type="text" placeholder="種類 (犬, 猫など)" value={species} onChange={e => setSpecies(e.target.value)} required />
          <select className="form-input" value={gender} onChange={e => setGender(e.target.value)} required>
            <option value="">性別を選択</option>
            <option value="male">オス</option>
            <option value="female">メス</option>
          </select>
          <input className="form-input" type="number" step="0.1" placeholder="体重 (kg)" value={weight} onChange={e => setWeight(e.target.value)} />
          <input className="form-input" type="number" step="0.1" placeholder="体長 (cm)" value={bodyLength} onChange={e => setBodyLength(e.target.value)} />

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>正面画像</label>
            <input type="file" accept="image/*" onChange={e => setImageFront(e.target.files?.[0] || null)} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>側面画像</label>
            <input type="file" accept="image/*" onChange={e => setImageSide(e.target.files?.[0] || null)} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>45度画像</label>
            <input type="file" accept="image/*" onChange={e => setImageAngle45(e.target.files?.[0] || null)} />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="form-button" type="submit">{editingId ? "更新" : "追加"}</button>
            {editingId && <button className="form-button" type="button" onClick={resetForm} style={{ background: "#888" }}>キャンセル</button>}
          </div>
        </form>
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {pets.length === 0 ? (
          <p>登録されたペットはいません</p>
        ) : (
          pets.map((pet) => (
            <div key={pet.id} className="product-card" style={{ display: "flex", gap: "1rem", padding: "1rem", alignItems: "center" }}>
              {pet.image_front && <img src={pet.image_front} alt={pet.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />}
              <div style={{ flex: 1 }}>
                <p><strong>{pet.name}</strong> ({pet.species} / {pet.gender === "male" ? "オス" : "メス"})</p>
                {pet.weight && <p style={{ fontSize: "0.875rem" }}>体重: {pet.weight}kg / 体長: {pet.body_length}cm</p>}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="form-button" style={{ width: "auto", padding: "0.4rem 0.75rem", fontSize: "0.875rem" }} onClick={() => handleEdit(pet)}>編集</button>
                <button className="form-button" style={{ width: "auto", padding: "0.4rem 0.75rem", fontSize: "0.875rem", background: "#c0392b" }} onClick={() => handleDelete(pet.id)}>削除</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
