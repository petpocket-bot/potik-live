import Link from "next/link";

const TABS = [
  { href: "/admin/sources", label: "Источники", key: "sources" },
  { href: "/admin/articles", label: "Лента публикаций", key: "articles" },
  { href: "/admin/failed", label: "Лог ошибок", key: "failed" },
];

export default function AdminNav({ active }: { active: string }) {
  return (
    <nav style={{ display: "flex", gap: 16, borderBottom: "1px solid #ddd", paddingBottom: 12 }}>
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          style={{
            fontWeight: active === t.key ? 700 : 400,
            textDecoration: "none",
            color: "#111",
          }}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
