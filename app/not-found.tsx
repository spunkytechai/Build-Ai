import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f5f7f5", color: "#18231f", fontFamily: "Arial,sans-serif" }}>
      <section style={{ textAlign: "center", maxWidth: 520 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: "#718079" }}>BUILD AI · 404</div>
        <h1 style={{ margin: "12px 0 8px", fontSize: 42 }}>Project not found.</h1>
        <p style={{ color: "#68756f", lineHeight: 1.6 }}>The page or project you requested does not exist, or is no longer available.</p>
        <Link href="/dashboard" style={{ display: "inline-block", marginTop: 18, padding: "10px 14px", borderRadius: 7, background: "#18352a", color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 12 }}>Return to dashboard</Link>
      </section>
    </main>
  );
}
