import "./globals.css";
import { organizationJsonLd } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";
import { getEnv } from "@/lib/env";

const env = getEnv();

export const metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Noor Nursery — Buy Live Plants Online in Pakistan",
    template: "%s | Noor Nursery",
  },
  description:
    "Pakistan's trusted online nursery since 2012. Shop 300+ acclimatized indoor plants, fruit trees, herbs and seeds with 48-hour live arrival guarantee, COD and nationwide delivery.",
  authors: [{ name: "Noor Nursery" }],
  openGraph: {
    type: "website",
    siteName: "Noor Nursery",
    title: "Noor Nursery — Buy Live Plants Online in Pakistan",
    description:
      "300+ pest-free, acclimatized plants shipped in shock-resistant crates to Lahore, Karachi, Islamabad & 50+ cities. Cash on Delivery available.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noor Nursery — Buy Live Plants Online in Pakistan",
    description:
      "300+ pest-free, acclimatized plants with a 48-hour live arrival guarantee and nationwide delivery.",
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap"
        />
      </head>
      <body>
        <JsonLdScript data={organizationJsonLd()} />
        {children}
      </body>
    </html>
  );
}
