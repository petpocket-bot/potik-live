"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/admin/sources");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка входа");
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>Вход в админку</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8 }}
        />
        {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}
        <button type="submit" style={{ padding: 10, background: "#111", color: "#fff", border: "none" }}>
          Войти
        </button>
      </form>
    </main>
  );
}
