import Image from "next/image";

const FALLBACK = "/placeholder-plant.jpg";

/**
 * next/image wrapper for catalog thumbnails (local public/ + Cloudinary).
 */
export function CatalogImage({
  src,
  alt,
  className = "object-cover",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  priority = false,
}) {
  const url = src || FALLBACK;

  return (
    <Image
      src={url}
      alt={alt || ""}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
