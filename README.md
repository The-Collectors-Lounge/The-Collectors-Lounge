# The Collectors Lounge — V6.2

Site statique (Cloudflare Pages) : EN `/`, FR `/fr/`, ES `/es/`.

## Publier (2 minutes)
1. Sur GitHub, dans le dépôt : **Add file → Upload files**.
2. Glissez **tout le contenu** de ce dossier (pas le .zip lui-même), y compris les dossiers `assets`, `fr`, `es`, `functions`, `tools`.
3. **Commit directly to main**. Cloudflare publie automatiquement (aucun réglage à changer).

> Si GitHub refuse plus de 100 fichiers d'un coup : envoyez d'abord `assets/`, faites un commit, puis le reste.

### Nettoyage (facultatif, sans urgence)
Ces anciens fichiers ne sont plus utilisés : `lang.js` et toutes les images à la racine de `assets/` (`*.jpg`, `*.webp`). Les supprimer allège le dépôt, rien ne casse si vous les laissez.

## Emails et WhatsApp
- Le formulaire envoie à `brands@thecollectorslounge.mx` (variable `CONTACT_TO` si vous voulez changer).
- `merida@thecollectorslounge.mx` (administratif) et le WhatsApp +33 6 66 97 39 76 sont affichés dans la section Contact et dans les mentions légales.
- Variables Cloudflare existantes à conserver : `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`.

## Anti-spam Turnstile (optionnel, recommandé)
1. Cloudflare → **Turnstile** → *Add widget* → domaine `thecollectorslounge.mx` → copiez la *Site key* et la *Secret key*.
2. Pages → votre projet → **Settings → Variables and Secrets** : ajoutez `TURNSTILE_SECRET_KEY` (secret).
3. Dans `script.js`, ligne 1 : collez la Site key dans `const TURNSTILE_SITE_KEY = '';` et faites un commit.

Une fois actif, l'accusé de réception automatique (dans la langue du visiteur) est aussi envoyé. Il est volontairement désactivé sans Turnstile, pour éviter que le formulaire serve à envoyer des emails à des tiers.

## Modifier un texte
Tous les textes sont dans `tools/translations.json` (EN/FR/ES côte à côte). Les pages sont ensuite régénérées par `python3 tools/build.py` (nécessite `pip install beautifulsoup4`). Le plus simple : demandez-moi la modification et je renvoie les fichiers.

## Contenu
- `index.html`, `legal.html`, `privacy.html` + `fr/` + `es/` : pages générées
- `styles.css`, `script.js`, `legal.css`, `lang-redirect.js`
- `functions/api/contact.js` : formulaire
- `_headers` : sécurité (CSP, etc.) et cache · `robots.txt` · `sitemap.xml` · `404.html`
- `assets/img` (WebP responsives), `assets/fonts` (polices auto-hébergées), `assets/og-image.jpg`
- `favicon.*`, `icon-*.png`, `apple-touch-icon.png` : **icônes provisoires** (monogramme « C »), à remplacer par le vrai logo
