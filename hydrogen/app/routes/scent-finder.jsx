import {pageMeta} from '~/lib/seo';
import {useState, useMemo} from 'react';
import {Link, useLoaderData} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useToast} from '~/components/ToastContext';
import {loadAllProducts} from '~/lib/almas';
import {toCartLine} from '~/lib/cart';

/* ── Step Data ── */
const STEPS = [
  {
    id: 'gender',
    question: 'Who is this for?',
    subtitle: 'Help us narrow down the perfect scent for you.',
    type: 'single',
    options: [
      {value: 'men', label: 'For Him', icon: '♂'},
      {value: 'women', label: 'For Her', icon: '♀'},
      {value: 'any', label: 'Anyone', icon: '◈'},
      {value: 'surprise', label: 'Surprise Me', icon: '✦'},
    ],
  },
  {
    id: 'mood',
    question: 'What mood are you going for?',
    subtitle: 'Choose the vibe that resonates with you.',
    type: 'single',
    options: [
      {value: 'fresh', label: 'Fresh & Clean', icon: '🌊'},
      {value: 'bold', label: 'Bold & Confident', icon: '🔥'},
      {value: 'romantic', label: 'Romantic', icon: '🌹'},
      {value: 'mysterious', label: 'Mysterious', icon: '🌙'},
      {value: 'warm', label: 'Warm & Cozy', icon: '☕'},
      {value: 'energetic', label: 'Energetic', icon: '⚡'},
    ],
  },
  {
    id: 'occasion',
    question: "What's the occasion?",
    subtitle: 'Where will you wear this fragrance most?',
    type: 'single',
    options: [
      {value: 'everyday', label: 'Everyday', icon: '☀'},
      {value: 'date', label: 'Date Night', icon: '🕯'},
      {value: 'office', label: 'Office', icon: '💼'},
      {value: 'special', label: 'Special Event', icon: '✨'},
      {value: 'outdoor', label: 'Outdoor', icon: '🌿'},
    ],
  },
  {
    id: 'intensity',
    question: 'How strong do you like it?',
    subtitle: 'Select your preferred sillage level.',
    type: 'slider',
    options: [
      {value: 1, label: 'Subtle'},
      {value: 2, label: 'Moderate'},
      {value: 3, label: 'Strong'},
      {value: 4, label: 'Statement'},
    ],
  },
  {
    id: 'notes',
    question: 'Pick notes you love',
    subtitle: 'Select as many as you like. These help us find your perfect match.',
    type: 'multi',
    options: [
      'Vanilla', 'Oud', 'Rose', 'Citrus', 'Musk', 'Amber',
      'Sandalwood', 'Jasmine', 'Bergamot', 'Saffron', 'Cedar',
      'Patchouli', 'Lavender', 'Tonka Bean', 'Leather', 'Vetiver',
      'Iris', 'Peony', 'Tuberose', 'Black Pepper',
    ],
  },
];

const TOTAL_STEPS = STEPS.length;

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return pageMeta({
    title: 'Scent Finder Quiz \u2014 Find Your Perfect Fragrance',
    description:
      'Take the ALMAS Scent finder quiz: answer a few questions and get matched with the luxury-inspired perfume made for your taste.',
    path: '/scent-finder',
  });
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  return {products: await loadAllProducts(context)};
}

/* ── Scoring Logic ──
 * All mapping values below are reconciled against the real catalog data
 * (distinct scentFamily / accord / bestFor / sillage values in Shopify
 * metafields) — do not add terms that don't exist in the data.
 */

// Mood → scent families + accord names (both verified against the catalog).
const MOOD_MAP = {
  fresh: {
    families: ['Fresh', 'Citrus', 'Aromatic'],
    accords: ['Fresh', 'Citrus', 'Aquatic', 'Clean', 'Green', 'Aromatic', 'Mineral'],
  },
  bold: {
    families: ['Woody', 'Oud', 'Spicy'],
    accords: ['Oud', 'Leather', 'Leathery', 'Smoky', 'Spicy', 'Tobacco', 'Woody'],
  },
  romantic: {
    families: ['Floral', 'Gourmand', 'Oriental'],
    accords: ['Floral', 'Sweet', 'Fruity', 'Vanilla', 'Powdery', 'Musk', 'Musky', 'Creamy'],
  },
  mysterious: {
    families: ['Oriental', 'Oud', 'Amber'],
    accords: ['Oud', 'Smoky', 'Amber', 'Earthy', 'Leather', 'Leathery', 'Warm'],
  },
  warm: {
    families: ['Amber', 'Gourmand', 'Woody', 'Oriental'],
    accords: ['Warm', 'Amber', 'Vanilla', 'Sweet', 'Gourmand', 'Almond', 'Creamy', 'Tobacco'],
  },
  energetic: {
    families: ['Fresh', 'Citrus', 'Aromatic', 'Spicy'],
    accords: ['Citrus', 'Fresh', 'Fruity', 'Green', 'Aromatic', 'Spicy', 'Aquatic'],
  },
};

// Occasion → bestFor values (exact values from the catalog).
const OCCASION_MAP = {
  everyday: ['Daily Wear', 'Casual', 'All Seasons', 'Brunch', 'Office'],
  date: ['Date Night', 'Evening', 'Special Occasions', 'Clubbing'],
  office: ['Office', 'Daily Wear', 'Casual'],
  special: ['Special Occasions', 'Evening', 'Date Night', 'Garden Party', 'Clubbing'],
  outdoor: ['Beach', 'Sport', 'Garden Party', 'Vacation', 'Summer', 'Spring'],
};

// Catalog sillage strings mapped onto the 1–4 quiz scale.
const SILLAGE_LEVEL = {
  'soft': 1,
  'soft-moderate': 1.5,
  'moderate': 2,
  'variable': 2.5,
  'moderate-strong': 3,
  'strong': 3.5,
  'enormous': 4,
};

function isInStock(product) {
  return Object.values(product.variantBySize || {}).some(
    (v) => v?.availableForSale,
  );
}

function genderMatches(product, gender) {
  if (gender === 'surprise' || gender === 'any' || !gender) return true;
  return product.category === gender || product.category === 'unisex';
}

function scoreProduct(product, answers) {
  let score = 0;
  let maxScore = 0;

  const accordNames = (product.accords || []).map((a) => a.name.toLowerCase());

  // Mood match via scent family + accords (weight: 30)
  maxScore += 30;
  const mood = MOOD_MAP[answers.mood];
  if (mood) {
    if (mood.families.includes(product.scentFamily)) score += 16;
    const accordHits = mood.accords.filter((a) =>
      accordNames.includes(a.toLowerCase()),
    ).length;
    score += Math.min(14, accordHits * 5);
  } else {
    score += 15;
  }

  // Occasion match via bestFor (weight: 20)
  maxScore += 20;
  const occasionTerms = (OCCASION_MAP[answers.occasion] || []).map((t) =>
    t.toLowerCase(),
  );
  const bestForHits = (product.bestFor || []).filter((bf) =>
    occasionTerms.includes(bf.toLowerCase()),
  ).length;
  if (occasionTerms.length === 0) {
    score += 10;
  } else if (bestForHits >= 2) {
    score += 20;
  } else if (bestForHits === 1) {
    score += 14;
  }

  // Intensity match via sillage, by distance on the 1–4 scale (weight: 15)
  maxScore += 15;
  const level = SILLAGE_LEVEL[(product.sillage || '').toLowerCase()];
  if (level != null && answers.intensity != null) {
    score += Math.max(0, 15 - Math.abs(level - answers.intensity) * 6);
  } else {
    score += 5;
  }

  // Notes match against top/heart/base notes AND accords (weight: 20)
  maxScore += 20;
  const selectedNotes = answers.notes || [];
  if (selectedNotes.length > 0) {
    const haystack = [
      ...(product.notes?.top || []),
      ...(product.notes?.heart || []),
      ...(product.notes?.base || []),
      ...accordNames,
    ].map((n) => n.toLowerCase());

    const matchCount = selectedNotes.filter((note) => {
      const q = note.toLowerCase();
      return haystack.some((pn) => pn.includes(q) || q.includes(pn));
    }).length;

    score += Math.min(20, Math.round((matchCount / selectedNotes.length) * 20));
  } else {
    score += 10;
  }

  const matchPct = Math.round((score / maxScore) * 100);
  return {product, score, matchPct: Math.min(matchPct, 98)};
}

function scoreProducts(products, answers) {
  // Sold-out products are never recommended.
  const inStock = products.filter(isInStock);

  // "For Him"/"For Her" is a hard filter (unisex always qualifies) — the
  // old soft weighting let men's products surface on a For Her path.
  const pool = inStock.filter((p) => genderMatches(p, answers.gender));

  const ranked = pool
    .map((p) => scoreProduct(p, answers))
    .sort((a, b) => b.score - a.score);

  // Backfill from the remaining in-stock catalog only if the gender pool
  // can't fill the top 3 — never backfill with sold-out products.
  if (ranked.length < 3) {
    const rest = inStock
      .filter((p) => !genderMatches(p, answers.gender))
      .map((p) => scoreProduct(p, answers))
      .sort((a, b) => b.score - a.score);
    return [...ranked, ...rest].slice(0, 3);
  }

  return ranked.slice(0, 3);
}

function getMatchExplanation(result, answers) {
  const parts = [];
  const p = result.product;

  if (p.scentFamily) {
    parts.push(`a ${p.scentFamily.toLowerCase()} fragrance`);
  }
  if (p.bestFor?.length) {
    parts.push(`perfect for ${p.bestFor.slice(0, 2).join(' and ').toLowerCase()}`);
  }

  const selectedNotes = answers.notes || [];
  const allNotes = [
    ...(p.notes?.top || []),
    ...(p.notes?.heart || []),
    ...(p.notes?.base || []),
    ...(p.accords || []).map(a => a.name),
  ];
  const matched = selectedNotes.filter(n =>
    allNotes.some(pn => pn.toLowerCase().includes(n.toLowerCase()))
  );
  if (matched.length > 0) {
    parts.push(`featuring ${matched.slice(0, 3).join(', ').toLowerCase()} notes you love`);
  }

  return parts.length > 0
    ? `This is ${parts.join(', ')}.`
    : `A beautiful match for your preferences.`;
}

/* ── Main Component ── */
export default function ScentFinderPage() {
  const {products} = useLoaderData();
  const {addToast} = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    gender: null,
    mood: null,
    occasion: null,
    intensity: 2,
    notes: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('forward');

  const step = STEPS[currentStep];

  const results = useMemo(() => {
    if (!showResults) return [];
    return scoreProducts(products, answers);
  }, [showResults, products, answers]);

  const canProceed = () => {
    if (!step) return false;
    switch (step.id) {
      case 'gender': return !!answers.gender;
      case 'mood': return !!answers.mood;
      case 'occasion': return !!answers.occasion;
      case 'intensity': return !!answers.intensity;
      case 'notes': return true; // notes are optional
      default: return false;
    }
  };

  const goNext = () => {
    if (!canProceed()) return;
    setDirection('forward');
    setAnimating(true);
    setTimeout(() => {
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowResults(true);
      }
      setAnimating(false);
    }, 300);
  };

  const goBack = () => {
    if (showResults) {
      setShowResults(false);
      setCurrentStep(TOTAL_STEPS - 1);
      return;
    }
    if (currentStep > 0) {
      setDirection('backward');
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setAnimating(false);
      }, 300);
    }
  };

  const startOver = () => {
    setShowResults(false);
    setCurrentStep(0);
    setAnswers({
      gender: null,
      mood: null,
      occasion: null,
      intensity: 2,
      notes: [],
    });
  };

  const handleSingleSelect = (value) => {
    setAnswers(prev => ({...prev, [step.id]: value}));
  };

  const handleMultiSelect = (note) => {
    setAnswers(prev => {
      const current = prev.notes || [];
      return {
        ...prev,
        notes: current.includes(note)
          ? current.filter(n => n !== note)
          : [...current, note],
      };
    });
  };

  const handleSlider = (value) => {
    setAnswers(prev => ({...prev, intensity: value}));
  };

  // Progress percentage
  const progressPct = showResults
    ? 100
    : ((currentStep + 1) / TOTAL_STEPS) * 100;

  /* ── Results View ── */
  if (showResults) {
    return (
      <div className="min-h-screen bg-white">
        {/* Progress */}
        <div className="w-full h-1 bg-light-gray">
          <div className="h-full bg-black transition-all duration-500" style={{width: '100%'}} />
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-12 py-16">
          <div className="text-center mb-16">
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-4 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-warm-gray" />
              Your Results
              <span className="w-8 h-px bg-warm-gray" />
            </p>
            <h1 className="font-serif text-[clamp(32px,4vw,52px)] font-light mb-4">
              Your Perfect Matches
            </h1>
            <p className="font-sans text-sm text-warm-gray max-w-md mx-auto">
              Based on your preferences, we have handpicked these fragrances just for you.
            </p>
          </div>

          <div className="space-y-8">
            {results.map((result, index) => {
              // Legacy hardcoded the 50ml size; fall back to the first
              // available size when variants use other titles (mock.shop).
              const size = result.product.prices?.['50ml'] != null
                ? '50ml'
                : Object.keys(result.product.prices || {})[0];
              const price = result.product.prices?.[size];
              const variant = result.product.variantBySize?.[size];
              return (
              <div
                key={result.product.id}
                className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 p-8 border border-stone-dark/30 hover:border-stone-dark transition-colors"
              >
                {/* Product image */}
                <div className="aspect-[2/3] max-md:w-[240px] max-md:mx-auto bg-light-gray relative overflow-hidden">
                  <img
                    src={result.product.image}
                    alt={result.product.name}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  <span className="absolute top-3 left-3 bg-black text-white font-sans text-[9px] tracking-[0.1em] uppercase px-2 py-1">
                    #{index + 1} Match
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-warm-gray">
                      {result.product.category === 'men' ? 'For Him' : result.product.category === 'women' ? 'For Her' : 'Unisex'}
                    </span>
                    <span className="font-sans text-[11px] tracking-[0.1em] text-warm-gray">|</span>
                    <span className="font-sans text-[11px] tracking-[0.1em] text-warm-gray">
                      {result.product.scentFamily}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-light mb-1">{result.product.name}</h3>
                  <p className="font-sans text-sm text-warm-gray italic mb-3">
                    Inspired by {result.product.inspiredBy}
                  </p>

                  {/* Match percentage */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 max-w-[200px] h-2 bg-light-gray rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-700"
                        style={{width: `${result.matchPct}%`}}
                      />
                    </div>
                    <span className="font-sans text-sm font-medium">{result.matchPct}% match</span>
                  </div>

                  <p className="font-sans text-sm text-warm-gray leading-relaxed mb-6">
                    {getMatchExplanation(result, answers)}
                  </p>

                  <div className="flex items-center gap-4">
                    <span className="font-sans text-lg">${price}</span>
                    <AddToCartButton
                      lines={variant?.availableForSale ? [toCartLine(variant, result.product)] : []}
                      disabled={!variant?.availableForSale}
                      onClick={() => addToast(`${result.product.name} added to bag`, 'success')}
                      className={`px-6 py-2.5 text-white text-[11px] tracking-[0.15em] uppercase font-sans transition-colors ${
                        variant?.availableForSale
                          ? 'bg-black hover:bg-black/85'
                          : 'bg-warm-gray cursor-not-allowed'
                      }`}
                    >
                      {variant?.availableForSale ? 'Add to Bag' : 'Sold Out'}
                    </AddToCartButton>
                    <Link
                      to={`/products/${result.product.handle}`}
                      className="px-6 py-2.5 border border-black text-black text-[11px] tracking-[0.15em] uppercase font-sans hover:bg-black hover:text-white transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Start Again */}
          <div className="text-center mt-12">
            <button
              onClick={startOver}
              className="px-8 py-3 border border-stone-dark text-black text-[11px] tracking-[0.15em] uppercase font-sans hover:border-black transition-colors"
            >
              Start Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Quiz View ── */
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-light-gray">
        <div
          className="h-full bg-black transition-all duration-500"
          style={{width: `${progressPct}%`}}
        />
      </div>

      {/* Step indicator */}
      <div className="px-6 md:px-12 pt-8">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-warm-gray">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </p>
          <button
            onClick={startOver}
            className="font-sans text-[11px] tracking-[0.1em] uppercase text-warm-gray hover:text-black transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
        <div
          className={`max-w-3xl w-full text-center transition-all duration-300 ${
            animating
              ? direction === 'forward'
                ? 'opacity-0 translate-x-8'
                : 'opacity-0 -translate-x-8'
              : 'opacity-100 translate-x-0'
          }`}
        >
          <h1 className="font-serif text-[clamp(28px,4vw,48px)] font-light mb-3">
            {step.question}
          </h1>
          <p className="font-sans text-sm text-warm-gray mb-12">
            {step.subtitle}
          </p>

          {/* Single Select Cards */}
          {step.type === 'single' && (
            <div className={`grid gap-4 mx-auto ${
              step.options.length <= 4
                ? 'grid-cols-2 md:grid-cols-4 max-w-2xl'
                : step.options.length <= 5
                  ? 'grid-cols-2 md:grid-cols-5 max-w-3xl'
                  : 'grid-cols-2 md:grid-cols-3 max-w-2xl'
            }`}>
              {step.options.map(opt => {
                const isSelected = answers[step.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSingleSelect(opt.value)}
                    className={`flex flex-col items-center justify-center p-6 border transition-all duration-300 ${
                      isSelected
                        ? 'border-black bg-black text-white'
                        : 'border-stone-dark hover:border-black text-black'
                    }`}
                  >
                    <span className="text-2xl mb-3">{opt.icon}</span>
                    <span className="font-sans text-[11px] tracking-[0.12em] uppercase">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Slider */}
          {step.type === 'slider' && (
            <div className="max-w-lg mx-auto">
              <div className="grid grid-cols-4 gap-3 mb-8">
                {step.options.map(opt => {
                  const isSelected = answers.intensity === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSlider(opt.value)}
                      className={`flex flex-col items-center justify-center p-6 border transition-all duration-300 ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-stone-dark hover:border-black text-black'
                      }`}
                    >
                      <span className="font-sans text-2xl font-light mb-2">{opt.value}</span>
                      <span className="font-sans text-[10px] tracking-[0.12em] uppercase">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Visual slider bar */}
              <div className="relative h-2 bg-light-gray rounded-full">
                <div
                  className="absolute h-full bg-black rounded-full transition-all duration-300"
                  style={{width: `${((answers.intensity) / 4) * 100}%`}}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-sans text-[10px] text-warm-gray">Subtle</span>
                <span className="font-sans text-[10px] text-warm-gray">Statement</span>
              </div>
            </div>
          )}

          {/* Multi Select */}
          {step.type === 'multi' && (
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-wrap justify-center gap-3">
                {step.options.map(note => {
                  const isSelected = (answers.notes || []).includes(note);
                  return (
                    <button
                      key={note}
                      onClick={() => handleMultiSelect(note)}
                      className={`px-5 py-2.5 text-[12px] tracking-[0.08em] font-sans transition-all duration-200 ${
                        isSelected
                          ? 'bg-black text-white border border-black'
                          : 'bg-transparent border border-stone-dark text-black hover:border-black'
                      }`}
                    >
                      {note}
                    </button>
                  );
                })}
              </div>
              {(answers.notes || []).length > 0 && (
                <p className="font-sans text-xs text-warm-gray mt-6">
                  {answers.notes.length} note{answers.notes.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 md:px-12 pb-12">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={goBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 font-sans text-[11px] tracking-[0.15em] uppercase transition-colors ${
              currentStep === 0
                ? 'text-stone-dark cursor-not-allowed'
                : 'text-black hover:opacity-60'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-8 py-3 text-[11px] tracking-[0.15em] uppercase font-sans transition-all ${
              canProceed()
                ? 'bg-black text-white hover:bg-black/85'
                : 'bg-stone text-warm-gray cursor-not-allowed'
            }`}
          >
            {currentStep === TOTAL_STEPS - 1 ? 'See Results' : 'Next'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/scent-finder').Route} Route */
