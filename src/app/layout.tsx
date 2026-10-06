import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "POTIK.LIVE — новини про Україну, коротко",
    template: "%s — POTIK.LIVE",
  },
  description: "Агрегатор новостей об Украине из украинских новостных порталов.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "#1C1A17", background: "#FBF9F6" }}>
        <header style={{ background: "#1E3A5F" }}>
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "14px 24px",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <a href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: 24, color: "#fff" }}>
                POTIK<span style={{ color: "rgba(255,255,255,.6)", fontWeight: 400 }}>.LIVE</span>
              </span>
            </a>
          </div>
        </header>

        <div style={{ width: "100%", background: "#fff", borderBottom: "1px solid #E5E0D8" }}>
          <nav style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 24px", display: "flex", gap: 22, overflowX: "auto" }}>
            <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#1E3A5F", whiteSpace: "nowrap" }}>
              Усі новини
            </a>
            <a href="/category/ukraine-in-press" style={{ fontSize: 13, color: "#5B5548", whiteSpace: "nowrap" }}>
              Україна в пресі
            </a>
            <span style={{ fontSize: 13, color: "#C9C2B4", whiteSpace: "nowrap" }}>Політика</span>
            <span style={{ fontSize: 13, color: "#C9C2B4", whiteSpace: "nowrap" }}>Економіка</span>
            <span style={{ fontSize: 13, color: "#C9C2B4", whiteSpace: "nowrap" }}>Світ</span>
            <span style={{ fontSize: 13, color: "#C9C2B4", whiteSpace: "nowrap" }}>Суспільство</span>
          </nav>
        </div>

        {children}

        <footer style={{ borderTop: "1px solid #E5E0D8", marginTop: 16 }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px", fontSize: 11, color: "#AFA999" }}>
            Матеріали — переформульовані версії новин джерел із посиланням на оригінал.
          </div>
        </footer>
      </body>
    </html>
  );
}
