const SUNLIGHT_LABELS = {
  low: "Low Light",
  medium: "Medium / Indirect Light",
  bright: "Bright Indirect Light",
  direct: "Direct Sunlight",
};

const WATERING_LABELS = {
  low: "Low — water sparingly",
  medium: "Moderate — regular watering",
  high: "High — keep soil moist",
};

const DIFFICULTY_LABELS = {
  easy: "Easy — beginner friendly",
  moderate: "Moderate — some experience helpful",
  advanced: "Advanced — needs attentive care",
};

const SUITABILITY_LABELS = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  both: "Indoor & Outdoor",
};

export function extractBotanicalName(product) {
  const match = product.descriptionEn?.match(/\(([A-Za-z\s.×-]+)\)/);
  return match?.[1]?.trim() || null;
}

export function buildQuickFacts(product) {
  const facts = [];

  if (product.categoryId?.nameEn) {
    facts.push({ label: "Category", value: product.categoryId.nameEn });
  }
  if (product.suitability) {
    facts.push({ label: "Best For", value: SUITABILITY_LABELS[product.suitability] || product.suitability });
  }
  if (product.sunlight) {
    facts.push({ label: "Light", value: SUNLIGHT_LABELS[product.sunlight] || product.sunlight });
  }
  if (product.watering) {
    facts.push({ label: "Watering", value: WATERING_LABELS[product.watering] || product.watering });
  }
  if (product.difficulty) {
    facts.push({ label: "Care Level", value: DIFFICULTY_LABELS[product.difficulty] || product.difficulty });
  }
  if (product.heightInfo) {
    facts.push({ label: "Mature Height", value: product.heightInfo });
  }

  const sizes = product.variants
    ?.filter((v) => v.isActive)
    .map((v) => v.sizeLabelEn)
    .join(", ");
  if (sizes) {
    facts.push({ label: "Available Sizes", value: sizes });
  }

  return facts;
}

export function buildSpecifications(product, variant) {
  const specs = [];

  const botanical = extractBotanicalName(product);
  if (botanical) specs.push({ label: "Botanical Name", value: botanical });

  if (product.categoryId?.nameEn) {
    specs.push({ label: "Category", value: product.categoryId.nameEn });
  }
  if (product.suitability) {
    specs.push({ label: "Suitable For", value: SUITABILITY_LABELS[product.suitability] });
  }
  if (product.sunlight) {
    specs.push({ label: "Sunlight Requirement", value: SUNLIGHT_LABELS[product.sunlight] });
  }
  if (product.watering) {
    specs.push({ label: "Watering Needs", value: WATERING_LABELS[product.watering] });
  }
  if (product.difficulty) {
    specs.push({ label: "Care Difficulty", value: DIFFICULTY_LABELS[product.difficulty] });
  }
  if (product.heightInfo) {
    specs.push({ label: "Height / Size Info", value: product.heightInfo });
  }
  if (variant?.sku) {
    specs.push({ label: "SKU", value: variant.sku });
  }
  if (variant?.weight) {
    specs.push({ label: "Weight", value: `${variant.weight} kg` });
  }
  if (variant?.dimensions) {
    specs.push({ label: "Dimensions", value: variant.dimensions });
  }
  if (variant?.sizeLabelEn) {
    specs.push({ label: "Selected Size", value: variant.sizeLabelEn });
  }

  return specs;
}

export function buildCareGuide(product) {
  const items = [];

  if (product.sunlight) {
    items.push({
      title: "Sunlight",
      value: SUNLIGHT_LABELS[product.sunlight],
      tip: product.sunlight === "low"
        ? "Place away from harsh direct sun. North-facing windows or shaded corners work well."
        : product.sunlight === "direct"
          ? "Needs several hours of direct sun daily — ideal for balconies and open gardens."
          : "Bright, filtered light is ideal. Avoid prolonged harsh afternoon sun in summer.",
    });
  }

  if (product.watering) {
    items.push({
      title: "Watering",
      value: WATERING_LABELS[product.watering],
      tip: product.watering === "low"
        ? "Let the soil dry out between waterings. Overwatering is the most common mistake."
        : product.watering === "high"
          ? "Keep soil consistently moist but not waterlogged. Mist leaves in dry weather."
          : "Water when the top inch of soil feels dry. Reduce frequency in winter.",
    });
  }

  if (product.difficulty) {
    items.push({
      title: "Care Level",
      value: DIFFICULTY_LABELS[product.difficulty],
      tip: product.difficulty === "easy"
        ? "Perfect for beginners — forgiving and low-maintenance."
        : product.difficulty === "advanced"
          ? "Best for experienced plant owners who can monitor humidity and light closely."
          : "Manageable with basic attention to light and watering schedule.",
    });
  }

  if (product.suitability) {
    items.push({
      title: "Placement",
      value: SUITABILITY_LABELS[product.suitability],
      tip: product.suitability === "indoor"
        ? "Well-suited for living rooms, offices, and bedrooms with adequate light."
        : product.suitability === "outdoor"
          ? "Best grown on terraces, lawns, or open gardens in Pakistani climates."
          : "Flexible — can thrive indoors near bright windows or outdoors in partial shade.",
    });
  }

  return items;
}

export function buildProductFaqs(product) {
  const name = product.nameEn;
  const faqs = [];

  if (product.sunlight) {
    faqs.push({
      q: `How much light does ${name} need?`,
      a: `${name} prefers ${SUNLIGHT_LABELS[product.sunlight].toLowerCase()}. Adjust placement if leaves yellow or stretch toward the window.`,
    });
  }

  if (product.watering) {
    faqs.push({
      q: `How often should I water ${name}?`,
      a: `Follow a ${WATERING_LABELS[product.watering].toLowerCase()} schedule. Always check soil moisture before watering — Pakistani summers may need slightly more frequent checks.`,
    });
  }

  faqs.push({
    q: `Is ${name} suitable for beginners?`,
    a: product.difficulty === "easy"
      ? `Yes! ${name} is beginner-friendly and tolerates occasional missed waterings.`
      : product.difficulty === "advanced"
        ? `${name} needs attentive care — best for experienced plant owners.`
        : `${name} is moderately easy to care for with a consistent routine.`,
  });

  faqs.push({
    q: `Can I order ${name} for delivery across Pakistan?`,
    a: "Yes. Noor Nursery ships live plants nationwide in shock-resistant packaging with a 48-hour live arrival guarantee. Cash on Delivery is available.",
  });

  if (product.suitability) {
    faqs.push({
      q: `Can I keep ${name} indoors?`,
      a: product.suitability === "outdoor"
        ? `${name} is primarily suited for outdoor spaces like terraces and gardens.`
        : product.suitability === "indoor"
          ? `Yes, ${name} is ideal for indoor spaces with appropriate light.`
          : `${name} works both indoors near bright windows and outdoors in suitable conditions.`,
    });
  }

  return faqs;
}
