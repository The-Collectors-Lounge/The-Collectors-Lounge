/* The Collectors Lounge — interactions (V6.2) */

/* Anti-spam Cloudflare Turnstile (optionnel).
   Pour l'activer : collez ici la « Site key » (clé publique) de votre widget Turnstile.
   Laissée vide = désactivé, le formulaire fonctionne normalement. */
const TURNSTILE_SITE_KEY = '';

(function () {
  const lang = document.documentElement.lang || 'en';

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('.menu');
  const nav = document.querySelector('#nav');
  const setMenuState = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    const label = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    if (label) toggle.setAttribute('aria-label', label);
    document.body.classList.toggle('menu-open', open);
  };
  toggle?.addEventListener('click', () => setMenuState(!nav?.classList.contains('open')));
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenuState(false)));
  document.addEventListener('click', (event) => {
    if (nav?.classList.contains('open') && !nav.contains(event.target) && !toggle?.contains(event.target)) setMenuState(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) {
      setMenuState(false);
      toggle?.focus();
    }
  });

  /* ---------- Apparition discrète des sections ---------- */
  const targets = document.querySelectorAll(
    '.intro .copy, .space-section .space-gallery figure, .offer-grid article, ' +
    '.community-grid > div, .experience-copy, .experience-image, .city32-copy, ' +
    '.location-copy, .statement h2, .support-grid > div, .contact-intro, .contact-form'
  );
  targets.forEach((el) => el.classList.add('tcl-reveal'));
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('tcl-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('tcl-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- Offres : pré-sélection du formulaire ---------- */
  const select = document.querySelector('#request');
  document.querySelectorAll('[data-interest]').forEach((a) =>
    a.addEventListener('click', () => { if (select) select.value = a.dataset.interest; })
  );

  /* ---------- Formulaire ---------- */
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  if (!form) return;

  const MSG = {
    en: { sending: 'Sending…', success: 'Thank you. Your enquiry has been sent.', error: 'Unable to send your enquiry. Please try again or write to brands@thecollectorslounge.mx.', verify: 'Please wait for the security check to complete, then try again.' },
    fr: { sending: 'Envoi…', success: 'Merci. Votre demande a bien été envoyée.', error: 'Impossible d’envoyer votre demande. Veuillez réessayer ou écrire à brands@thecollectorslounge.mx.', verify: 'Veuillez patienter jusqu’à la fin de la vérification de sécurité, puis réessayer.' },
    es: { sending: 'Enviando…', success: 'Gracias. Tu solicitud ha sido enviada.', error: 'No ha sido posible enviar tu solicitud. Inténtalo de nuevo o escribe a brands@thecollectorslounge.mx.', verify: 'Espera a que termine la verificación de seguridad e inténtalo de nuevo.' }
  };
  const t = MSG[lang] || MSG.en;

  /* Turnstile (chargé seulement si une clé est renseignée) */
  let token = '';
  let widgetId = null;
  if (TURNSTILE_SITE_KEY) {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => {
      widgetId = window.turnstile.render('#turnstile-box', {
        sitekey: TURNSTILE_SITE_KEY,
        language: lang,
        theme: 'light',
        callback: (v) => { token = v; },
        'expired-callback': () => { token = ''; },
        'error-callback': () => { token = ''; }
      });
    };
    document.head.appendChild(s);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('.form-submit');
    status.classList.remove('is-error', 'is-success');
    if (TURNSTILE_SITE_KEY && !token) {
      status.textContent = t.verify;
      status.classList.add('is-error');
      return;
    }
    status.textContent = t.sending;
    submit.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      data.lang = lang;
      data.elapsed_ms = Math.round(performance.now());
      if (token) data.turnstile_token = token;
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || t.error);
      form.reset();
      status.textContent = t.success;
      status.classList.add('is-success');
    } catch (error) {
      status.textContent = error.message || t.error;
      status.classList.add('is-error');
    } finally {
      submit.disabled = false;
      if (widgetId !== null && window.turnstile) { window.turnstile.reset(widgetId); token = ''; }
    }
  });
})();
