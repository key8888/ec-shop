"use client";
import { useRef, useState, useEffect } from "react";

interface Patch { patch_id: string; x: number; y: number; scale: number; }
interface PatchCanvasProps { productImage: string; onPatchesChange: (patches: Patch[]) => void; }

const SAMPLE_PATCHES = [
  { id: "patch1", label: "肉球", url: "/patches/paw.png", fallback: "🐾" },
  { id: "patch2", label: "星", url: "/patches/star.png", fallback: "⭐" },
  { id: "patch3", label: "ハート", url: "/patches/heart.png", fallback: "❤️" },
];

export default function PatchCanvas({ productImage, onPatchesChange }: PatchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [patches, setPatches] = useState<Patch[]>([]);
  const [selectedPatch, setSelectedPatch] = useState<string>("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = productImage;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [productImage]);

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imageRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    patches.forEach(p => {
      ctx.font = "40px sans-serif";
      ctx.fillText("⭐", p.x, p.y);
      ctx.strokeStyle = p.patch_id === dragging ? "blue" : "transparent";
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 20, p.y - 30, 40, 40);
    });
  }, [imageLoaded, patches, dragging]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedPatch || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPatch: Patch = { patch_id: selectedPatch + "-" + Date.now(), x, y, scale: 1.0 };
    const updated = [...patches, newPatch];
    setPatches(updated);
    onPatchesChange(updated);
  };

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!selectedPatch || !canvasRef.current || e.touches.length === 0) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const newPatch: Patch = { patch_id: selectedPatch + "-" + Date.now(), x, y, scale: 1.0 };
    const updated = [...patches, newPatch];
    setPatches(updated);
    onPatchesChange(updated);
  };

  const handleRemove = (patchId: string) => {
    const updated = patches.filter(p => p.patch_id !== patchId);
    setPatches(updated);
    onPatchesChange(updated);
  };

  return (
    <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h3>ワッペンカスタマイズ</h3>
      <div style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0" }}>
        {SAMPLE_PATCHES.map(p => (
          <button
            key={p.id}
            className="form-button"
            onClick={() => setSelectedPatch(p.id)}
            style={{ background: selectedPatch === p.id ? "var(--color-gold)" : undefined }}
          >
            {p.fallback} {p.label}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchEnd={handleTouch}
        style={{ border: "1px solid #ccc", maxWidth: "100%", cursor: selectedPatch ? "crosshair" : "default" }}
      />
      {patches.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <p>配置済みワッペン: {patches.length}個</p>
          {patches.map(p => (
            <button key={p.patch_id} onClick={() => handleRemove(p.patch_id)} style={{ background: "red", color: "white", border: "none", padding: "0.25rem 0.5rem", marginRight: "0.5rem", borderRadius: "4px", cursor: "pointer" }}>
              削除 ({p.x}, {p.y})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
