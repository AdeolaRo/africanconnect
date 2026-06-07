# Déploiement AfricanConnect sur VPS IONOS

**Domaine :** africanconnect.online  
**VPS :** AlmaLinux 9 — 82.165.185.254 — 2 Go RAM / 2 vCPU / 80 Go

---

## Étape 1 — DNS IONOS

Dans le panneau IONOS → Domaine `africanconnect.online` → DNS :

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | 82.165.185.254 |
| A | www | 82.165.185.254 |

Attendre 5–30 min pour la propagation.

---

## Étape 2 — Connexion SSH au VPS

```bash
ssh root@82.165.185.254
```

---

## Étape 3 — Installer les dépendances (AlmaLinux 9)

```bash
# Mise à jour
dnf update -y

# Node.js 20
dnf module install nodejs:20 -y

# PostgreSQL
dnf install postgresql-server postgresql-contrib -y
postgresql-setup --initdb
systemctl enable --now postgresql

# Nginx + Certbot + PM2
dnf install nginx certbot python3-certbot-nginx -y
npm install -g pm2
systemctl enable --now nginx
```

---

## Étape 4 — Base de données PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE USER africanconnect WITH PASSWORD 'VOTRE_MOT_DE_PASSE_FORT';
CREATE DATABASE africanconnect OWNER africanconnect;
\q
```

---

## Étape 5 — Déployer l'application

```bash
# Créer le dossier
mkdir -p /var/www/africanconnect
cd /var/www/africanconnect

# Cloner ou transférer les fichiers (depuis votre machine locale)
# scp -r ./africanconnect/* root@82.165.185.254:/var/www/africanconnect/
```

Sur le VPS, créer le fichier `.env` :

```env
DATABASE_URL="postgresql://africanconnect:VOTRE_MOT_DE_PASSE_FORT@localhost:5432/africanconnect"
AUTH_SECRET="GENEREZ_UN_SECRET_ALEATOIRE_32_CARACTERES_MINIMUM"
NEXTAUTH_URL="https://africanconnect.online"
AUTH_TRUST_HOST=true
PORT=3001
```

Modifier `prisma/schema.prisma` pour la production :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Puis :

```bash
npm install
npx prisma db push
npm run db:seed
npm run build
PORT=3001 pm2 start npm --name "africanconnect-online" -- start
pm2 save
pm2 startup
```

> **Note :** les migrations Prisma du dépôt sont en SQLite (dev). En production PostgreSQL, utilisez `prisma db push` pour créer le schéma, pas `migrate deploy`.

---

## Étape 6 — Nginx

Créer `/etc/nginx/conf.d/africanconnect.conf` :

```nginx
server {
    listen 80;
    server_name africanconnect.online www.africanconnect.online;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
nginx -t
systemctl reload nginx
certbot --nginx -d africanconnect.online -d www.africanconnect.online
```

---

## Étape 7 — Firewall

```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload
```

---

## Mises à jour futures (script)

Après un `git push` sur GitHub, sur le VPS :

```bash
cd /var/www/africanconnect-online
git pull origin main          # récupère le script si première fois
chmod +x scripts/deploy-update.sh
bash scripts/deploy-update.sh
```

Avec réinjection des données démo (seed) :

```bash
bash scripts/deploy-update.sh --seed
```

Le script enchaîne : `git pull` → `npm install` → `prisma db push` → `npm run build` → `pm2 restart africanconnect-online`.

> **Conflit `prisma/schema.prisma` au pull ?**  
> En prod, le provider PostgreSQL ne doit pas rester modifié à la main dans git. Réinitialisez puis relancez :
> ```bash
> cd /var/www/africanconnect-online
> git checkout -- prisma/schema.prisma
> git pull origin main
> bash scripts/deploy-update.sh
> ```
> Le script remet automatiquement `provider = "postgresql"` après chaque pull.

Variables optionnelles :

```bash
APP_DIR=/var/www/africanconnect-online PM2_NAME=africanconnect-online bash scripts/deploy-update.sh
```

---

## Commandes utiles

```bash
pm2 logs africanconnect-online   # Voir les logs
pm2 restart africanconnect-online
pm2 status
```

---

## Comptes démo (après seed)

| Email | Mot de passe | Parcours |
|-------|-------------|----------|
| amina@demo.com | demo1234 | Halal |
| youssef@demo.com | demo1234 | Halal |
| sophie@demo.com | demo1234 | Sérieux |
| thomas@demo.com | demo1234 | Sérieux |

---

## Ressources VPS (2 Go RAM)

Avec un seul site Next.js + PostgreSQL + Nginx, 2 Go RAM suffisent pour démarrer (quelques centaines d'utilisateurs). Surveillez avec `htop` ou `pm2 monit`.
