"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: "1px solid #444",
        background: "rgba(255,255,255,0.05)",
        color: "white",
        cursor: "pointer",
        marginBottom: 10,
      }}
    >
      ← Indietro
    </button>
  );
}