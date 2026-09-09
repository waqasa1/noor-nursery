import { getEnv } from "@/lib/env";

export default function robots() {
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/account/",
          "/cart",
          "/checkout",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
