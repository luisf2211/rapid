import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME } from "@/lib/seo/config";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import { Analytics } from "@/components/analytics/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rapid · Cotiza la reparación de tu vehículo online",
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Cotiza pintura, desabolladura, bumper, rayones y detailing con talleres cerca de ti. Y si tienes un taller, gestiona tu operación y recibe nuevos clientes con Rapid.",
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-rapid-bg text-rapid-text"
        suppressHydrationWarning
      >
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
