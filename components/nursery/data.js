/**
 * Owned local assets only — no third-party stock CDNs.
 * Prefer Admin → Settings (Cloudinary) for hero / indoor / about overrides.
 */
export const IMAGES = {
  logo: "/logo.png",
  hero: "/heroimage-clean.png",
  fruitTrees: "/heroimage-clean.png",
  indoor: "/indoorplant.jpg",
  flowering: "/heroimage-clean.png",
  herbs: "/placeholder-plant.jpg",
  vines: "/placeholder-plant.jpg",
  paneeri: "/placeholder-plant.jpg",
  selfWatering: "/placeholder.jpg",
};

/** Fallback labels only — homepage prefers DB categories with Cloudinary images. */
export const CATEGORIES = [
  { name: "Fruit Plants", urdu: "پھل دار پودے", image: IMAGES.fruitTrees },
  { name: "Indoor Plants", urdu: "اندرونی پودے", image: IMAGES.indoor },
  { name: "Flowering", urdu: "پھول دار پودے", image: IMAGES.flowering },
  { name: "Herbs & Tulsi", urdu: "جڑی بوٹیاں", image: IMAGES.herbs },
  { name: "Vines & Climbers", urdu: "بیلیں اور بیل دار", image: IMAGES.vines },
];

/** Static FAQ base. Delivery/promo answers are filled by buildFaqs() from site settings. */
export const FAQ_BASE = [
  {
    q: "How do plants survive courier delivery across Pakistan?",
    a: "We use heavy-grade honeycomb corrugated boxes with specially molded base locks that secure the nursery pot firmly. The soil is watered to ideal moisture before dispatch and sealed with breathable organic coco-wrap so the leaves stay hydrated up to 6 days during express transit.",
  },
  {
    q: "What happens if my plant arrives broken or wilted? (48-Hr Guarantee)",
    a: "We offer an absolute 100% Live Arrival Guarantee. Simply snap a quick photo of the damaged plant within 48 hours of parcel delivery and WhatsApp it to us. We will immediately dispatch a fresh replacement or issue a full refund without questions.",
  },
  {
    q: "Do you offer Cash on Delivery (COD) in Karachi, Islamabad & other cities?",
    a: "Yes! Cash on Delivery is available across 50+ Pakistani cities including Lahore, Karachi, Rawalpindi, Islamabad, Faisalabad, Multan, Peshawar, and Sialkot. You inspect the sealed package and pay the courier directly. JazzCash (Send Money + TID) is also available when enabled in checkout.",
  },
  {
    q: "Can I track my order in real time with the courier?",
    a: "Our Track Order page shows Noor Nursery’s internal order status (payment, packing, shipped, delivered) when you enter your order number plus the email or phone used at checkout. Live courier GPS / scan feeds are not available yet — after your parcel ships, WhatsApp us for the latest courier update.",
  },
  {
    q: "Are the plants delivered in pots with soil, or bare-root?",
    a: "All Noor Nursery plants arrive fully established in standard durable nursery grow pots filled with our enriched organic potting mixture. They are ready to enjoy immediately without urgent repotting.",
  },
];

/** @deprecated Use buildFaqs from @/lib/faqs — kept for any stray imports during transition */
export const FAQS = FAQ_BASE;
