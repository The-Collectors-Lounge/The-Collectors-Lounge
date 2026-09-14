# The Collectors Lounge — V5

Site vitrine statique, responsive, prêt à être hébergé.

## Fichiers
- `index.html` — structure et contenus
- `styles.css` — identité visuelle, mise en page, responsive
- `script.js` — menu mobile
- `assets/` — images utilisées sur le site

## Mise en ligne
Aucun build n'est nécessaire. Le dossier peut être envoyé tel quel sur un hébergeur statique (ou ouvert localement via `index.html`).

## À modifier avant publication
1. Remplacer `contact@thecollectorslounge.com` par l'adresse email définitive si nécessaire.
2. Vérifier les mentions légales / confidentialité avant publication.
3. Remplacer les visuels conceptuels par les photos définitives lorsque disponibles.
4. Ajouter le favicon et les comptes sociaux définitifs si souhaité.

## Direction V5
Architecture de la V4 conservée, avec une mise en scène enrichie par plusieurs visuels du projet, une section City32 dédiée et une illustration Mérida inspirée de l'architecture du Yucatán.

## V5.1 visual update
- Hero restored to the V4 hero image.
- Removed the standalone cropped image break.
- Replaced branded reference images with neutral venue images.
- Added a neutral image to “One place. Infinite identities.”
- Replaced the Mérida church visual with the user-supplied Catedral de San Ildefonso image.
- City32 section uses the user-supplied location image.


## V5.2 update
- Refined typography for a more coherent luxury editorial hierarchy.
- Replaced the 4th and 5th displayed visuals with the latest supplied TCL renders.
- Added two additional supplied visuals to the space gallery.
- Contact updated to `merida@thecollectorslounge.com` and `brands@thecollectorslounge.com`.

## v5.8 — Contact form / Cloudflare Pages

The contact form posts to `/api/contact`, implemented as a Cloudflare Pages Function in `functions/api/contact.js`.

Before the form can send email in production:

1. In Cloudflare, onboard `thecollectorslounge.com` in **Email Service → Email Sending**.
2. Create an API token with permission to send email.
3. In the Pages project, add these **Variables and Secrets**:
   - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID
   - `EMAIL_API_TOKEN` — store as a secret
   - `CONTACT_TO` — e.g. `brands@thecollectorslounge.com`
   - `CONTACT_FROM` — e.g. `website@thecollectorslounge.com` (must use the onboarded sending domain)
4. Redeploy the Pages project from GitHub.

The form includes a hidden honeypot field and server-side validation. For stronger bot protection later, Cloudflare Turnstile can be added without changing the visual design.

## v5.8 — Contact form / Cloudflare Pages

The contact form posts to `/api/contact`, implemented as a Cloudflare Pages Function in `functions/api/contact.js`.

Before deploying the form in production, add these environment variables in the Cloudflare Pages project settings:

- `RESEND_API_KEY` — API key from Resend (store as a secret).
- `CONTACT_FROM` — verified sender, e.g. `The Collectors Lounge <website@thecollectorslounge.com>`.
- `CONTACT_TO` — optional recipient; defaults to `brands@thecollectorslounge.com`.

The sender domain used in `CONTACT_FROM` must be verified with the email provider. The visitor's email is set as the Reply-To address. A hidden honeypot field provides a lightweight first layer of spam protection.


## v5.8 — The Space update
- Retail boutiques: 76 m² each
- Back-of-house: 20 m² each
- Collectors Room: 27 m²
- Added 05 — Chambre forte: 5 m²
- Space statistics displayed in five columns on desktop, with responsive stacking on smaller screens


V5.10 refinement: City32 exterior image is displayed at its full 16:9 ratio without cropping, preserving the complete architecture while keeping the J-shaped editorial layout.


V5.10 City32 refinement: the two City32 images are grouped in a single left column, stacked and aligned; the exterior image is displayed at its natural ratio so it remains complete. The copy sits in the right column, matching the supplied reference composition.

Website deployment updated.
