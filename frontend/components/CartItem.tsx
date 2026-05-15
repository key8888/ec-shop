"use client";
interface CartItemProps { product_id: string; product: { id: string; name: string; price: number; thumbnail_url?: string }; quantity: number; onUpdate: (qty: number) => void; onRemove: () => void; }

export default function CartItem({ product, quantity, onUpdate, onRemove }: CartItemProps) {
  return (
    <div style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ddd", alignItems: "center" }}>
      <img src={product.thumbnail_url || "/placeholder.png"} alt={product.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }} />
      <div style={{ flex: 1 }}>
        <h4>{product.name}</h4>
        <p>¥{product.price.toLocaleString()}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <select value={quantity} onChange={e => onUpdate(Number(e.target.value))} className="form-input" style={{ width: "60px" }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}>削除</button>
      </div>
      <div style={{ fontWeight: "bold", minWidth: "100px", textAlign: "right" }}>¥{(product.price * quantity).toLocaleString()}</div>
    </div>
  );
}
