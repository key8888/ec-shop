"use client";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={{
      background: "var(--color-navy)",
      color: "var(--color-white)",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <Link href="/" style={{ color: "var(--color-gold)", fontSize: "1.5rem", fontWeight: "bold" }}>
        星野のペット用品
      </Link>
      <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link href="/products">商品一覧</Link>
        {user ? (
          <>
            <Link href="/mypage">マイページ</Link>
            <Link href="/cart">カート</Link>
            <button onClick={logout} style={{ background: "none", border: "none", color: "var(--color-white)", cursor: "pointer" }}>
              ログアウト
            </button>
          </>
        ) : (
          <Link href="/login">ログイン</Link>
        )}
      </nav>
    </header>
  );
}
