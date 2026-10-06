import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  sourceName: string;
  publishedAt: Date;
};

export default function ArticleCard({ slug, title, sourceName, publishedAt }: Props) {
  const time = new Date(publishedAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/article/${slug}`}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        padding: "11px 0",
        borderBottom: "1px solid #EDE8DF",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span style={{ flex: "0 0 42px", fontSize: 12, color: "#AFA999", fontVariantNumeric: "tabular-nums" }}>
        {time}
      </span>
      <span style={{ flex: 1, fontSize: 15, lineHeight: 1.4 }}>{title}</span>
      <span style={{ flex: "0 0 auto", fontSize: 11, color: "#AFA999", whiteSpace: "nowrap" }}>{sourceName}</span>
    </Link>
  );
}
