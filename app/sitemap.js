import { getEnv } from "@/lib/env";
import { connectDB, isDBConfigured } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export default async function sitemap() {
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL;

  const staticPages = [
    "", "/shop", "/categories", "/about", "/contact", "/faq",
    "/shipping-policy", "/return-policy", "/privacy-policy", "/terms",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  if (!isDBConfigured()) return staticPages;

  try {
    await connectDB();
    const [products, categories] = await Promise.all([
      Product.find({ isActive: true }).select("slug updatedAt").lean(),
      Category.find({ isActive: true }).select("slug updatedAt").lean(),
    ]);

    return [
      ...staticPages,
      ...categories.map((c) => ({
        url: `${baseUrl}/categories/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      })),
      ...products.map((p) => ({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.9,
      })),
    ];
  } catch {
    return staticPages;
  }
}
