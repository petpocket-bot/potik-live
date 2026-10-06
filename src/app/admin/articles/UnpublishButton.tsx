"use client";

import { useRouter } from "next/navigation";

export default function UnpublishButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const nextStatus = status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";

  async function handleClick() {
    await fetch(`/api/admin/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    router.refresh();
  }

  return (
    <button onClick={handleClick} style={{ padding: "4px 10px", fontSize: 13 }}>
      {status === "PUBLISHED" ? "Снять с публикации" : "Опубликовать снова"}
    </button>
  );
}
