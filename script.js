const toggle = document.querySelector('.menu');
const nav = document.querySelector('#nav');

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  });
});


/* =========================
   CONTACT FORM
========================= */

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submit = contactForm.querySelector('.form-submit');

  formStatus.textContent = 'Sending…';
  formStatus.classList.remove('is-success', 'is-error');
  submit.disabled = true;

  try {
    const data = Object.fromEntries(
      new FormData(contactForm).entries()
    );

    const response = await fetch(contactForm.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error || 'Unable to send your enquiry.'
      );
    }

    contactForm.reset();

    formStatus.textContent =
      'Thank you. Your enquiry has been sent.';

    formStatus.classList.add('is-success');

  } catch (error) {

    formStatus.textContent =
      error.message ||
      'Unable to send your enquiry. Please try again.';

    formStatus.classList.add('is-error');

  } finally {

    submit.disabled = false;

  }
});
