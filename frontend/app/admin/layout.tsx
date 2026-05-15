"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "staff"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) return <p>読み込み中...</p>;

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <aside style={{ width: "200px", background: "var(--color-navy)", color: "var(--color-white)", padding: "1rem", borderRadius: "8px", minHeight: "400px" }}>
        <h3 style={{ color: "var(--color-gold)" }}>管理メニュー</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
          <Link href="/admin" style={{ color: "var(--color-white)" }}>ダッシュボード</Link>
          <Link href="/admin/products" style={{ color: "var(--color-white)" }}>商品管理</Link>
          <Link href="/admin/orders" style={{ color: "var(--color-white)" }}>注文管理</Link>
          <Link href="/admin/customers" style={{ color: "var(--color-white)" }}>顧客管理</Link>
          <Link href="/admin/coupons" style={{ color: "var(--color-white)" }}>クーポン管理</Link>
          <Link href="/admin/share" style={{ color: "var(--color-white)" }}>シェアリンク管理</Link>
        </nav>
      </aside>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
