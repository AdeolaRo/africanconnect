import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #6b1d5c 0%, #e8195a 50%, #ff8c42 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            background: "white",
            clipPath:
              "path('M7 13 C7 13 1.5 9 1.5 5.5 C1.5 3.8 3 2.5 4.8 2.5 C5.8 2.5 6.6 3 7 3.8 C7.4 3 8.2 2.5 9.2 2.5 C11 2.5 12.5 3.8 12.5 5.5 C12.5 9 7 13 7 13 Z')",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 11,
            height: 11,
            borderRadius: 6,
            background: "#2d1b2e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 5,
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
