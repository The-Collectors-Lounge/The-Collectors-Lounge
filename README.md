# The Collectors Lounge

Static website served by the existing Cloudflare Worker `tcl-contact`.

## Simple workflow

Edit files in GitHub -> commit to `main` -> Cloudflare automatically deploys `tcl-contact`.

No separate Pages project and no manual deployment is required.

## Contact form

`POST /api/contact` is handled by `functions/api/contact.js` and sends through Resend.

Required Cloudflare Runtime variables/secrets:
- `CONTACT_FROM` = `brands@thecollectorslounge.mx`
- `CONTACT_TO` = `brands@thecollectorslounge.mx`
- `RESEND_API_KEY` = Secret

The Resend API key is never stored in GitHub.
