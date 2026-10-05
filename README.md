# The Collectors Lounge

Static multilingual website deployed with Cloudflare Pages.

## Simple workflow

Edit files in GitHub -> commit to `main` -> Cloudflare Pages automatically deploys the site.

No Wrangler, no Worker deployment, and no manual deployment is required.

## Contact form

`POST /api/contact` is handled by the Cloudflare Pages Function:

`functions/api/contact.js`

The function sends enquiries through Resend.

Required Cloudflare Pages Production variables/secrets:
- `CONTACT_FROM` = `brands@thecollectorslounge.mx`
- `CONTACT_TO` = `brands@thecollectorslounge.mx`
- `RESEND_API_KEY` = Secret

The Resend API key is never stored in GitHub.

## Main files

- `index.html` — main site
- `styles.css` — site styling
- `script.js` — interactions and contact form submission
- `lang.js` — EN / FR / ES language handling
- `legal.html` — legal notice
- `privacy.html` — privacy policy
- `legal.css` — legal/privacy styling
- `functions/api/contact.js` — contact form backend
- `assets/` — site images and media
