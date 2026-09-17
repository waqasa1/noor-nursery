export const PLANT_FINDER_STEPS = [
  {
    id: "sunlight",
    question: "How much sunlight does your space get?",
    questionUr: "آپ کی جگہ پر کتنی روشنی ملتی ہے؟",
    options: [
      {
        id: "low",
        label: "Low Light",
        labelUr: "کم روشنی",
        desc: "Shaded corners, offices, north-facing windows",
        icon: "sun-dim",
      },
      {
        id: "medium",
        label: "Medium Light",
        labelUr: "درمیانی روشنی",
        desc: "Bright rooms with indirect sunlight",
        icon: "sun-medium",
      },
      {
        id: "bright",
        label: "Bright Light",
        labelUr: "زیادہ روشنی",
        desc: "Sunny balconies, gardens, south-facing windows",
        icon: "sun",
      },
    ],
  },
  {
    id: "placement",
    question: "Where will you keep the plant?",
    questionUr: "آپ پودا کہاں رکھیں گے؟",
    options: [
      {
        id: "indoor",
        label: "Indoors",
        labelUr: "گھر کے اندر",
        desc: "Living room, bedroom, office",
        icon: "home",
      },
      {
        id: "outdoor",
        label: "Outdoors",
        labelUr: "باہر",
        desc: "Terrace, lawn, balcony garden",
        icon: "tree",
      },
      {
        id: "both",
        label: "Flexible",
        labelUr: "دونوں جگہ",
        desc: "Open to indoor or outdoor options",
        icon: "shuffle",
      },
    ],
  },
  {
    id: "experience",
    question: "How much plant care experience do you have?",
    questionUr: "پودوں کی دیکھ بھال کا تجربہ کتنا ہے؟",
    options: [
      {
        id: "easy",
        label: "Beginner",
        labelUr: "نیا شروع",
        desc: "I want easy, low-maintenance plants",
        icon: "sprout",
      },
      {
        id: "moderate",
        label: "Some Experience",
        labelUr: "تھوڑا تجربہ",
        desc: "I can follow a regular care routine",
        icon: "leaf",
      },
      {
        id: "advanced",
        label: "Experienced",
        labelUr: "ماہر",
        desc: "I'm comfortable with attentive care",
        icon: "award",
      },
    ],
  },
];

const SUNLIGHT_SCORES = {
  low: { low: 3, medium: 2, bright: 0, direct: 0 },
  medium: { low: 2, medium: 3, bright: 2, direct: 1 },
  bright: { low: 0, medium: 2, bright: 3, direct: 3 },
};

const DIFFICULTY_RANK = { easy: 0, moderate: 1, advanced: 2 };

function scoreSunlight(preference, productSunlight) {
  return SUNLIGHT_SCORES[preference]?.[productSunlight] ?? 0;
}

function scorePlacement(preference, suitability) {
  if (preference === "both") return 2;
  if (suitability === "both") return 3;
  return preference === suitability ? 3 : 0;
}

function scoreExperience(preference, difficulty) {
  const prefRank = DIFFICULTY_RANK[preference] ?? 1;
  const prodRank = DIFFICULTY_RANK[difficulty] ?? 1;
  if (prodRank <= prefRank) return 3;
  if (prodRank === prefRank + 1) return 1;
  return 0;
}

export function matchProducts(products, answers, limit = 6) {
  const { sunlight, placement, experience } = answers;

  return products
    .filter((p) => p.variants?.some((v) => v.isActive && v.stock > 0))
    .map((product) => {
      const score =
        scoreSunlight(sunlight, product.sunlight) +
        scorePlacement(placement, product.suitability) +
        scoreExperience(experience, product.difficulty);

      return { product, score };
    })
    .filter(({ score }) => score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);
}

export function buildShopFilterUrl(answers) {
  const params = new URLSearchParams();
  if (answers.placement === "indoor") params.set("category", "indoor-plants");
  if (answers.placement === "outdoor") params.set("category", "outdoor-plants");
  return `/shop${params.toString() ? `?${params}` : ""}`;
}

export function summarizeAnswers(answers) {
  const labels = {};
  for (const step of PLANT_FINDER_STEPS) {
    const chosen = step.options.find((o) => o.id === answers[step.id]);
    if (chosen) labels[step.id] = chosen.label;
  }
  return labels;
}
