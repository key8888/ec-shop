"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }
    try {
      await register(name, email, password);
      router.push("/login");
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setError(apiErr?.detail || "登録に失敗しました");
    }
  };

  return (
    <div className="form-container">
      <h2>新規登録</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div><label>お名前</label><input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div><label>メールアドレス</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div><label>パスワード</label><input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>
        <div><label>パスワード（確認）</label><input className="form-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></div>
        <button className="form-button" type="submit">登録</button>
      </form>
      <p style={{ marginTop: "1rem" }}><Link href="/login">ログインはこちら</Link></p>
    </div>
  );
}
