"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Build Ai application error", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f5f7f5", color: "#18231f", fontFamily: "Arial,sans-serif" }}>
      <section style={{ width: "min(560px,100%)", background: "#fff", border: "1px solid #dbe2df", borderRadius: 12, padding: 28, boxShadow: "0 12px 40px rgba(25,45,35,.08)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: "#718079" }}>BUILD AI · RECOVERABLE ERROR</div>
        <h1 style={{ margin: "10px 0 8px", fontSize: 28 }}>Something went wrong.</h1>
        <p style={{ margin: 0, color: "#68756f", lineHeight: 1.6 }}>The workspace could not complete this request. Your project data is not assumed to be lost.</p>
        {error.digest && <p style={{ fontSize: 11, color: "#89938e", marginTop: 12 }}>Reference: {error.digest}</p>}
        <button onClick={() => reset()} style={{ marginTop: 20, border: 0, borderRadius: 7, padding: "10px 14px", background: "#18352a", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Try again</button>
      </section>
    </main>
  );
}
