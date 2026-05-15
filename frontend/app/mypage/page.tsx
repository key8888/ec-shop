"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";

export default function MyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <p>読み込み中...</p>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>マイページ</h2>
      <div className="form-container">
        <p><strong>名前:</strong> {user.name}</p>
        <p><strong>メールアドレス:</strong> {user.email}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
        <Link href="/mypage/orders" className="form-button" style={{ textAlign: "center" }}>
          注文履歴
        </Link>
        <Link href="/mypage/pets" className="form-button" style={{ textAlign: "center" }}>
          ペット管理
        </Link>
        <Link href="/mypage/addresses" className="form-button" style={{ textAlign: "center" }}>
          配送先住所
        </Link>
        <Link href="/mypage/shares" className="form-button" style={{ textAlign: "center" }}>
          シェアリンク
        </Link>
      </div>
    </div>
  );
}
