# Monétisation AfricanConnect (préparation)

Le site est **100 % gratuit** tant que `BILLING_ENABLED` n'est pas activé.

## Architecture prévue

| Couche | Rôle |
|--------|------|
| `src/lib/billing.ts` | Plans FREE / PREMIUM, feature flags, helper `userPlan()` |
| Prisma (futur) | `subscriptionPlan`, `stripeCustomerId`, `subscriptionStatus`, `currentPeriodEnd` sur `User` |
| Stripe Checkout | Abonnement mensuel Premium |
| Webhook `/api/billing/webhook` | `checkout.session.completed`, `customer.subscription.updated/deleted` |
| UI `/parametres` | Section « Mon abonnement », portail client Stripe |

## Activation (checklist)

1. Compte [Stripe](https://stripe.com) + produit/prix récurrent
2. Ajouter au `.env` :
   ```env
   BILLING_ENABLED=true
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_PREMIUM_MONTHLY=price_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
3. Migration Prisma : champs abonnement sur `User`
4. Implémenter routes `POST /api/billing/checkout`, `POST /api/billing/portal`, webhook
5. Mettre à jour CGU (tarifs, remboursement, résiliation)
6. Bandeau accueil : « Gratuit au lancement » → « Premium disponible »

## Fonctionnalités Premium (exemple)

- Badge profil vérifié prioritaire
- Filtres Découvrir avancés
- Support prioritaire
- (À définir avec le produit)

## SEO / légal

- Page tarifs publique `/tarifs` (indexable)
- Schema.org `Offer` mis à jour dans `JsonLd.tsx`
- Factures et TVA selon juridiction (UE : Stripe Tax)
