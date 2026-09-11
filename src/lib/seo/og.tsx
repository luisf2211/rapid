import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Genera una imagen Open Graph consistente para Rapid.
 * Fondo oscuro de marca, wordmark "Rapid●", titular y bajada.
 */
export function renderOgImage(opts: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  const { title, subtitle, eyebrow } = opts;
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0d0c",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Rapid
          </span>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#00c853",
              marginLeft: 6,
              marginTop: 20,
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow ? (
            <span
              style={{
                fontSize: 24,
                color: "#00c853",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: 20,
              }}
            >
              {eyebrow}
            </span>
          ) : null}
          <span
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 1000,
            }}
          >
            {title}
          </span>
          {subtitle ? (
            <span
              style={{
                fontSize: 30,
                color: "rgba(255,255,255,0.65)",
                marginTop: 28,
                maxWidth: 900,
                lineHeight: 1.35,
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
