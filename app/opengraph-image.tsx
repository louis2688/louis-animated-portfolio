import { ImageResponse } from "next/og";

export const alt = "Louis Madrigal — Senior AI Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#050609",
          backgroundImage:
            "radial-gradient(60% 60% at 78% 82%, rgba(0,122,255,0.22), transparent 70%)",
          color: "#f5f7fa",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#41a4ff",
            fontSize: 30,
            letterSpacing: 6,
            marginBottom: 30,
          }}
        >
          [ LM — v2.026 ]
        </div>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 800, lineHeight: 1 }}>
          LOUIS MADRIGAL
        </div>
        <div style={{ display: "flex", fontSize: 42, color: "#b7bfcc", marginTop: 26 }}>
          Senior AI Full Stack Developer
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#7b8394",
            marginTop: 46,
            letterSpacing: 2,
          }}
        >
          React · Next.js · Spring Boot · LLM · RAG · AWS
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 90,
            bottom: 78,
            width: 130,
            height: 6,
            background: "#007aff",
          }}
        />
      </div>
    ),
    { ...size }
  );
}