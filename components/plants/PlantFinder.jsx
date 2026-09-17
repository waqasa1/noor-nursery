"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Home,
  Leaf,
  LoaderCircle,
  RotateCcw,
  Shuffle,
  Sprout,
  Sun,
  SunDim,
  SunMedium,
  TreePine,
} from "lucide-react";
import { CatalogProductCard } from "@/components/catalog/ProductCard";
import {
  PLANT_FINDER_STEPS,
  buildShopFilterUrl,
  matchProducts,
  summarizeAnswers,
} from "@/lib/plants/plant-finder";

const ICONS = {
  "sun-dim": SunDim,
  "sun-medium": SunMedium,
  sun: Sun,
  home: Home,
  tree: TreePine,
  shuffle: Shuffle,
  sprout: Sprout,
  leaf: Leaf,
  award: Award,
};

export function PlantFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentStep = PLANT_FINDER_STEPS[step];
  const isComplete = step >= PLANT_FINDER_STEPS.length;
  const progress = isComplete ? 100 : ((step + 1) / PLANT_FINDER_STEPS.length) * 100;

  const fetchResults = useCallback(async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?limit=100&available=true");
      const data = await res.json();
      const matched = matchProducts(data.products || [], finalAnswers);
      setResults(matched);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectOption = (optionId) => {
    const nextAnswers = { ...answers, [currentStep.id]: optionId };
    setAnswers(nextAnswers);

    if (step + 1 >= PLANT_FINDER_STEPS.length) {
      setStep(PLANT_FINDER_STEPS.length);
      fetchResults(nextAnswers);
      return;
    }

    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (isComplete) {
      setResults(null);
      setStep(PLANT_FINDER_STEPS.length - 1);
      return;
    }
    if (step > 0) setStep((s) => s - 1);
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  const summary = isComplete ? summarizeAnswers(answers) : null;

  return (
    <section id="plant-finder" className="scroll-mt-24 bg-surface-low py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Plant Finder Tool</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Find the Right Plant for Your Space
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Answer a few quick questions and we&apos;ll recommend plants suited to your home or garden.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border bg-card shadow-lg">
          <div className="h-1.5 bg-surface-mid">
            <div
              className="h-full bg-secondary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6 sm:p-10">
            {!isComplete ? (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Question {step + 1} of {PLANT_FINDER_STEPS.length}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
                  {currentStep.question}
                </h3>
                {currentStep.questionUr && (
                  <p className="text-urdu mt-1 text-sm text-secondary" dir="rtl" lang="ur">
                    {currentStep.questionUr}
                  </p>
                )}

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {currentStep.options.map((option) => {
                    const Icon = ICONS[option.icon] || Leaf;
                    const selected = answers[currentStep.id] === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectOption(option.id)}
                        className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-secondary hover:shadow-md ${
                          selected
                            ? "border-secondary bg-secondary/5 ring-2 ring-secondary/30"
                            : "border-border bg-surface-low/40"
                        }`}
                      >
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-card shadow-sm">
                          <Icon className="h-5 w-5 text-secondary" />
                        </span>
                        <p className="mt-4 font-display text-base font-bold text-foreground">
                          {option.label}
                        </p>
                        {option.labelUr && (
                          <p className="text-urdu text-xs text-secondary" dir="rtl" lang="ur">
                            {option.labelUr}
                          </p>
                        )}
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {option.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {step > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
              </>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <LoaderCircle className="h-10 w-10 animate-spin text-secondary" />
                <p className="mt-4 font-medium text-muted-foreground">Finding your perfect plants…</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-secondary">
                      Your Recommendations
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold text-primary">
                      Plants matched to your space
                    </h3>
                    {summary && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.values(summary).map((label) => (
                          <span
                            key={label}
                            className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-foreground"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={restart}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-surface-low"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start Over
                  </button>
                </div>

                {results?.length > 0 ? (
                  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((product) => (
                      <CatalogProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 rounded-2xl border border-dashed bg-surface-low/50 px-6 py-12 text-center">
                    <p className="font-medium text-foreground">
                      No exact matches right now — browse our full collection instead.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Our team can also help on WhatsApp with personalised recommendations.
                    </p>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={buildShopFilterUrl(answers)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-forest"
                  >
                    Browse All Matching Plants
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold text-secondary transition hover:bg-surface-low"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change Answers
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
