import { Suspense } from "react";
import { Epilogue, Noto_Nastaliq_Urdu, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";
import { RouteProgress } from "@/components/layout/RouteProgress";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { getEnv } from "@/lib/env";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-epilogue",
  display: "swap",
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-noto-urdu",
  display: "swap",
});

const env = getEnv();

const siteTitle = "Noor Nursery — Buy Live Plants Online in Pakistan";
const siteDescription =
  "Noor Nursery, the name of customer trust. Quality you can trust, service you deserve! Shop 200+ acclimatized plants with 48-hour live arrival guarantee, COD, JazzCash and nationwide delivery.";

export const metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: siteTitle,
    template: "%s | Noor Nursery",
  },
  description: siteDescription,
  applicationName: "Noor Nursery",
  authors: [{ name: "Noor Nursery" }],
  creator: "Noor Nursery",
  publisher: "Noor Nursery",
  category: "shopping",
  keywords: [
    "buy plants online Pakistan",
    "Noor Nursery",
    "live plants Karachi",
    "indoor plants delivery",
    "COD plants Pakistan",
    "JazzCash nursery",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Noor Nursery",
    title: siteTitle,
    description:
      "200+ pest-free, acclimatized plants shipped in shock-resistant crates to Lahore, Karachi, Islamabad & 50+ cities. COD and JazzCash available.",
    url: "/",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Noor Nursery plants" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description:
      "200+ pest-free, acclimatized plants with a 48-hour live arrival guarantee and nationwide delivery.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${epilogue.variable} ${notoNastaliqUrdu.variable}`}
    >
      <body className={plusJakartaSans.className}>
        <JsonLdScript data={organizationJsonLd()} />
        <JsonLdScript data={websiteJsonLd()} />
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
