"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SourceForm() {
  const [name, setName] = useState("");
  const [rssUrl, setRssUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rssUrl }),
    });
    setName("");
    setRssUrl("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        placeholder="Название источника"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ padding: 8, flex: 1 }}
      />
      <input
        placeholder="RSS URL"
        value={rssUrl}
        onChange={(e) => setRssUrl(e.target.value)}
        required
        style={{ padding: 8, flex: 2 }}
      />
      <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
        {loading ? "Добавляю…" : "Добавить"}
      </button>
    </form>
  );
}
