import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://rapidcar.app"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/cotizar", "/rastrear"],
        // Zonas privadas del taller y APIs: no indexar.
        disallow: [
          "/dashboard",
          "/quotations",
          "/solicitudes",
          "/work-orders",
          "/invoices",
          "/inventory",
          "/employees",
          "/payments",
          "/expenses",
          "/petty-cash",
          "/banks",
          "/users",
          "/settings",
          "/admin",
          "/login",
          "/print",
          "/api",
          "/uploads",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
