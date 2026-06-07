import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #6b1d5c 0%, #e8195a 50%, #ff8c42 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            background: "white",
            clipPath:
              "path('M36 66 C36 66 9 48 9 28 C9 20 15 13 25 13 C31 13 35 16 36 20 C37 16 41 13 47 13 C57 13 63 20 63 28 C63 48 36 66 36 66 Z')",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 18,
            right: 18,
            width: 56,
            height: 56,
            borderRadius: 28,
            background: "#2d1b2e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "#fff5f7",
          }}
        >
          AC
        </div>
      </div>
    ),
    { ...size }
  );
}
