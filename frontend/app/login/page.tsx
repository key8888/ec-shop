"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setError(apiErr?.detail || "ログインに失敗しました");
    }
  };

  return (
    <div className="form-container">
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div>
          <label>メールアドレス</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>パスワード</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="form-button" type="submit">ログイン</button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/register">新規登録はこちら</Link> | <Link href="/reset-password">パスワードをお忘れの方</Link>
      </p>
    </div>
  );
}
