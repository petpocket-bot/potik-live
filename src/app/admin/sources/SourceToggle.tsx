"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function SourceToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function toggle() {
    await fetch(`/api/admin/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      style={{
        padding: "4px 10px",
        background: isActive ? "#e6f4ea" : "#fce8e6",
        color: isActive ? "#137333" : "#c5221f",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      {isActive ? "Активен" : "Отключён"}
    </button>
  );
}
