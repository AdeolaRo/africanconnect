/**
 * Configuration monétisation — prête pour activation future (Stripe / abonnements).
 * Aujourd'hui : tout le site reste gratuit (PLANS.FREE).
 * Pour activer le payant : voir docs/MONETISATION.md
 */

export const PLANS = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
} as const;

export type PlanId = (typeof PLANS)[keyof typeof PLANS];

/** Fonctionnalités contrôlables par plan (feature flags) */
export const PLAN_FEATURES = {
  [PLANS.FREE]: {
    discoverDailyLimit: null as number | null,
    messages: true,
    verifiedBadge: false,
    prioritySupport: false,
    seeWhoVisited: true,
  },
  [PLANS.PREMIUM]: {
    discoverDailyLimit: null,
    messages: true,
    verifiedBadge: true,
    prioritySupport: true,
    seeWhoVisited: true,
  },
} as const;

/** Mode global : passer à true quand la monétisation sera activée */
export const BILLING_ENABLED = process.env.BILLING_ENABLED === "true";

/** Plan par défaut pour les nouveaux inscrits */
export const DEFAULT_PLAN: PlanId = PLANS.FREE;

export function userPlan(_user?: { subscriptionPlan?: string | null }): PlanId {
  if (!BILLING_ENABLED) return PLANS.FREE;
  const p = _user?.subscriptionPlan;
  if (p === PLANS.PREMIUM) return PLANS.PREMIUM;
  return PLANS.FREE;
}

export function hasFeature(
  plan: PlanId,
  feature: keyof (typeof PLAN_FEATURES)[typeof PLANS.FREE]
): boolean {
  return PLAN_FEATURES[plan][feature] as boolean;
}

/** Variables d'environnement à prévoir (Stripe) — non utilisées tant que BILLING_ENABLED=false */
export const BILLING_ENV_KEYS = [
  "BILLING_ENABLED",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PREMIUM_MONTHLY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
] as const;
