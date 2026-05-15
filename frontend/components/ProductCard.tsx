"use client";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id?: string;
  thumbnail_url?: string;
  created_at: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="product-card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div style={{ background: product.stock === 0 ? "#eee" : "#fff", padding: "1rem", borderRadius: "8px", border: "1px solid #ddd" }}>
        {product.thumbnail_url ? (
          <img src={product.thumbnail_url} alt={product.name} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "4px" }} />
        ) : (
          <div style={{ width: "100%", height: "200px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
            画像なし
          </div>
        )}
        <h3 style={{ margin: "0.5rem 0" }}>{product.name}</h3>
        <p style={{ fontWeight: "bold", color: "var(--color-gold)" }}>¥{product.price.toLocaleString()}</p>
        {product.stock === 0 && <p style={{ color: "red", fontSize: "0.9rem" }}>在庫切れ</p>}
      </div>
    </Link>
  );
}
