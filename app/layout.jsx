import { Epilogue, Noto_Nastaliq_Urdu, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { organizationJsonLd } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";
import { RouteProgress } from "@/components/layout/RouteProgress";
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

export const metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Noor Nursery — Buy Live Plants Online in Pakistan",
    template: "%s | Noor Nursery",
  },
  description:
    "Noor Nursery, the name of customer trust. Quality you can trust, service you deserve! Shop 300+ acclimatized plants with 48-hour live arrival guarantee, COD and nationwide delivery.",
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
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${epilogue.variable} ${notoNastaliqUrdu.variable}`}
    >
      <body className={plusJakartaSans.className}>
        <JsonLdScript data={organizationJsonLd()} />
        <RouteProgress />
        {children}
      </body>
    </html>
  );
}
