export default function AiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #0f172a 0, #020617 35%, #000000 100%)",
        color: "#e5e7eb",
        padding: "32px 16px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* soft aurora glows */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-20%",
          background:
            "radial-gradient(circle at 0% 0%, rgba(59,130,246,0.35), transparent 55%), radial-gradient(circle at 100% 20%, rgba(147,51,234,0.32), transparent 55%), radial-gradient(circle at 10% 100%, rgba(34,197,94,0.28), transparent 55%)",
          opacity: 0.9,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* fine noise overlay for texture */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='noStitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.14'/%3E%3C/svg%3E\")",
          mixBlendMode: "soft-light",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1120px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

