"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/auth/reset-password", { email, new_password: newPassword });
      setMessage("パスワードをリセットしました。ログインページからログインしてください。");
    } catch (err: unknown) {
      const apiErr = err as { detail?: string };
      setError(apiErr?.detail || "リセットに失敗しました");
    }
  };

  return (
    <div className="form-container">
      <h2>パスワードリセット</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
        <div><label>メールアドレス</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div><label>新しいパスワード</label><input className="form-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} /></div>
        <button className="form-button" type="submit">リセット</button>
      </form>
      <p style={{ marginTop: "1rem" }}><Link href="/login">ログインはこちら</Link></p>
    </div>
  );
}
