// The Collectors Lounge — formulaire de contact (Cloudflare Pages Function)
// POST /api/contact  ->  email via Resend

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

const clean = (value, max = 4000) => (typeof value === "string" ? value.trim().slice(0, max) : "");
// Une seule ligne, sans retour chariot (évite toute injection dans l'objet de l'email)
const oneLine = (value, max) => clean(value, max).replace(/[\r\n\t]+/g, " ");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED = [
  "Event / Activation",
  "Annual Residency",
  "MX Extension",
  "Brand Office MX",
  "Market Development",
  "Not sure yet"
];

const T = {
  en: {
    required: "Please complete all required fields.",
    email: "Please enter a valid email address.",
    verify: "Security verification failed. Please reload the page and try again.",
    unavailable: "Unable to send your enquiry right now. Please try again or write to brands@thecollectorslounge.mx."
  },
  fr: {
    required: "Veuillez renseigner tous les champs obligatoires.",
    email: "Veuillez saisir une adresse email valide.",
    verify: "La vérification de sécurité a échoué. Rechargez la page et réessayez.",
    unavailable: "Impossible d’envoyer votre demande pour le moment. Réessayez ou écrivez à brands@thecollectorslounge.mx."
  },
  es: {
    required: "Completa todos los campos obligatorios.",
    email: "Introduce una dirección de correo válida.",
    verify: "La verificación de seguridad ha fallado. Recarga la página e inténtalo de nuevo.",
    unavailable: "No ha sido posible enviar tu solicitud en este momento. Inténtalo de nuevo o escribe a brands@thecollectorslounge.mx."
  }
};

const REPLY = {
  en: {
    subject: "The Collectors Lounge — we have received your enquiry",
    body: "Hello,\n\nThank you for contacting The Collectors Lounge. We have received your enquiry and the house will come back to you directly.\n\nIf your request is urgent, you can also reach us on WhatsApp: +33 6 66 97 39 76.\n\nThe Collectors Lounge\nCity 32 · Mérida · Mexico\n\nThis is an automatic acknowledgement. If you did not send this enquiry, you can ignore this message."
  },
  fr: {
    subject: "The Collectors Lounge — nous avons bien reçu votre demande",
    body: "Bonjour,\n\nMerci d’avoir contacté The Collectors Lounge. Nous avons bien reçu votre demande et la maison reviendra vers vous directement.\n\nSi votre demande est urgente, vous pouvez aussi nous joindre sur WhatsApp : +33 6 66 97 39 76.\n\nThe Collectors Lounge\nCity 32 · Mérida · Mexique\n\nCeci est un accusé de réception automatique. Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer ce message."
  },
  es: {
    subject: "The Collectors Lounge — hemos recibido tu solicitud",
    body: "Hola,\n\nGracias por contactar con The Collectors Lounge. Hemos recibido tu solicitud y la casa te responderá directamente.\n\nSi tu solicitud es urgente, también puedes escribirnos por WhatsApp: +33 6 66 97 39 76.\n\nThe Collectors Lounge\nCity 32 · Mérida · México\n\nEste es un acuse de recibo automático. Si no enviaste esta solicitud, puedes ignorar este mensaje."
  }
};

async function verifyTurnstile(token, secret, ip) {
  if (!token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const j = await r.json();
    return j.success === true;
  } catch (e) {
    console.error("Turnstile error", e);
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  let lang = "en";
  try {
    const data = await request.json();
    if (["en", "fr", "es"].includes(data.lang)) lang = data.lang;
    const t = T[lang];

    // Honeypot : un visiteur humain laisse ce champ vide.
    if (clean(data.company, 200)) return json({ ok: true });
    // Envoi quasi instantané après le chargement de la page = robot.
    const elapsed = Number(data.elapsed_ms);
    if (Number.isFinite(elapsed) && elapsed < 2000) return json({ ok: true });

    // Turnstile (actif seulement si le secret est configuré dans Cloudflare)
    const turnstileOn = Boolean(env.TURNSTILE_SECRET_KEY);
    if (turnstileOn) {
      const ok = await verifyTurnstile(clean(data.turnstile_token, 4000), env.TURNSTILE_SECRET_KEY, request.headers.get("CF-Connecting-IP"));
      if (!ok) return json({ error: t.verify }, 400);
    }

    const name = oneLine(data.name, 200);
    const enquiry = oneLine(data.request, 120);
    const phone = oneLine(data.phone, 80); // facultatif
    const email = oneLine(data.email, 254);
    const message = clean(data.message, 5000);

    if (!name || !message || !ALLOWED.includes(enquiry) || data.privacy_ack !== "yes") {
      return json({ error: t.required }, 400);
    }
    if (!emailPattern.test(email)) return json({ error: t.email }, 400);

    const apiKey = env.RESEND_API_KEY;
    const from = env.CONTACT_FROM || "brands@thecollectorslounge.mx";
    const to = env.CONTACT_TO || "brands@thecollectorslounge.mx";
    if (!apiKey) {
      console.error("RESEND_API_KEY is missing");
      return json({ error: t.unavailable }, 503);
    }

    const text = [
      `Name / Brand: ${name}`,
      `Enquiry: ${enquiry}`,
      `Phone / WhatsApp: ${phone || "-"}`,
      `Email: ${email}`,
      `Site language: ${lang}`,
      `Privacy policy acknowledged: yes`,
      `Marketing consent: ${data.marketing_consent === "yes" ? "yes" : "no"}`,
      "",
      message
    ].join("\n");

    const send = (payload) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "The-Collectors-Lounge-Website/1.1"
        },
        body: JSON.stringify(payload)
      });

    const response = await send({ from, to: [to], reply_to: email, subject: `TCL enquiry — ${enquiry} — ${name}`.slice(0, 200), text });
    if (!response.ok) {
      console.error("Resend error", response.status, await response.text());
      return json({ error: t.unavailable }, 502);
    }

    // Accusé de réception au visiteur : uniquement si la vérification Turnstile est active
    // (évite que le formulaire serve à envoyer des emails à des tiers).
    if (turnstileOn) {
      try {
        const r = REPLY[lang];
        const ack = await send({ from, to: [email], reply_to: to, subject: r.subject, text: r.body });
        if (!ack.ok) console.error("Auto-reply error", ack.status, await ack.text());
      } catch (e) {
        console.error("Auto-reply failed", e);
      }
    }

    return json({ ok: true });
  } catch (error) {
    console.error("Contact error", error);
    return json({ error: T[lang].unavailable }, 500);
  }
}

export const onRequest = () => json({ error: "Method not allowed" }, 405);
