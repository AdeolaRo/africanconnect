# AfricanConnect

Site de rencontre sérieux — profil d'abord, photo après match, 100 % gratuit au lancement.

## Fonctionnalités

- **Parcours en 3 étapes** : découverte sans photo → intérêt mutuel → messages + photo
- **CV matrimonial** et score de compatibilité (%)
- **Centres d'intérêt**, filtres ville/score, navigation entre profils
- **Confiance** : question secrète, validation de rencontre, badges, témoignages
- **Rôles** : utilisateur, modérateur, admin
- **Modération** : signalements profils/messages

## Stack

- Next.js 16, TypeScript, Tailwind CSS 4
- Prisma (SQLite en dev, PostgreSQL en prod)
- NextAuth (credentials)

## Démarrage local

```bash
cp .env.example .env
# Éditer AUTH_SECRET (32+ caractères aléatoires)

npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Démo | `amina@demo.com` | `demo1234` |
| Admin | `char.wilsons@gmail.com` | `Ade0la` |
| Modérateur | `enguequeen@gmail.com` | `enguequeen` |

## Déploiement

Voir [DEPLOY.md](./DEPLOY.md) pour le VPS IONOS (africanconnect.online).

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run db:migrate` | Migrations Prisma |
| `npm run db:seed` | Profils démo + comptes staff |
| `npm run db:studio` | Interface Prisma Studio |
