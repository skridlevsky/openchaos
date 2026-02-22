"use client";

export default function NewspaperError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="np-page" style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "2rem" }}>STOP THE PRESSES!</h1>
      <p style={{ fontFamily: "Lora, Georgia, serif" }}>Something went wrong loading The Daily Chaos.</p>
      <button onClick={reset} style={{ marginTop: "16px", cursor: "pointer", fontFamily: "inherit", padding: "8px 16px" }}>
        Try Again
      </button>
    </div>
  );
}
