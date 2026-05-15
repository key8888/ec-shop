"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/features/cart/CartContext";
import Link from "next/link";
import TryOnPreview from "@/components/TryOnPreview";
import PatchCanvas from "@/components/PatchCanvas";

interface Product { id: string; name: string; description?: string; price: number; stock: number; thumbnail_url?: string; created_at: string; }

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    api.get<Product>(`/products/${id}`).then(setProduct).catch(() => {});
  }, [id]);

  if (!product) return <div className="skeleton-loader" style={{ height: "400px" }} />;

  return (
    <div className="product-detail">
      <Link href="/products">← 商品一覧に戻る</Link>
      <div style={{ display: "flex", gap: "2rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px" }}>
          {product.thumbnail_url ? (
            <img src={product.thumbnail_url} alt={product.name} style={{ width: "100%", borderRadius: "8px" }} />
          ) : (
            <div style={{ width: "100%", height: "400px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>画像なし</div>
          )}
        </div>
        <div style={{ flex: "1 1 300px" }}>
          <h2>{product.name}</h2>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-gold)" }}>¥{product.price.toLocaleString()}</p>
          <p style={{ margin: "1rem 0" }}>{product.description || "商品の説明はありません"}</p>
          <p>在庫: {product.stock > 0 ? `${product.stock}個` : "在庫切れ"}</p>
          {product.stock > 0 && (
            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
              <select value={qty} onChange={e => setQty(Number(e.target.value))} className="form-input" style={{ width: "80px" }}>
                {[...Array(Math.min(product.stock, 10))].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
              </select>
              <button className="form-button" onClick={() => {
                addItem({ product_id: product.id, product: { id: product.id, name: product.name, price: product.price, thumbnail_url: product.thumbnail_url }, quantity: qty });
                router.push("/cart");
              }}>カートに入れる</button>
            </div>
          )}
          <div style={{ marginTop: "1rem" }}>
            <Link href={`/share/create?product_id=${product.id}`} className="form-button" style={{ display: "inline-block", textAlign: "center" }}>シェアして割引をもらう</Link>
          </div>
        </div>
      </div>
      <TryOnPreview productId={id} />
      <PatchCanvas productImage={product.thumbnail_url || ""} onPatchesChange={(patches) => { /* save to cart when adding */ }} />
    </div>
  );
}
